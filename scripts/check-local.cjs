// Local integration smoke test. Uses and removes a unique synthetic account.
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const { createRequire } = require('node:module');
const backendRequire = createRequire(path.join(__dirname, '../backend/package.json'));
const mongoose = backendRequire('mongoose');
const api = 'http://127.0.0.1:5050';
const origin = 'http://127.0.0.1:5173';
const email = `local-check-${randomBytes(10).toString('hex')}@example.invalid`;
const password = `Local!8a${randomBytes(24).toString('hex')}`;
let connection;
const results = [];

async function request(route, options = {}) {
    return fetch(`${api}${route}`, {
        ...options,
        headers: { Origin: origin, ...options.headers },
        signal: AbortSignal.timeout(15000),
    });
}
function post(body, cookie) {
    return { method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) };
}

(async () => {
    try {
        const health = await request('/health');
        assert.equal(health.status, 200);
        assert.equal((await health.json()).database, 'connected');
        results.push('Database readiness');
        const website = await fetch(`${origin}/`, { signal: AbortSignal.timeout(15000) });
        assert.equal(website.status, 200);
        const entry = await fetch(`${origin}/src/api.js`, { signal: AbortSignal.timeout(15000) });
        assert.equal(entry.status, 200);
        assert.match(await entry.text(), /127\.0\.0\.1/);
        results.push('Website and local API configuration');
        const anonymous = await request('/session');
        assert.equal(anonymous.status, 401);
        results.push('Anonymous session rejected');

        connection = await mongoose.createConnection('mongodb://127.0.0.1:27017/binzDB', { serverSelectionTimeoutMS: 5000 }).asPromise();
        const registration = await request('/register', post({ firstName: 'Local', lastName: 'Check', email, password, state: 'Uttar Pradesh' }));
        assert.equal(registration.status, 201, 'Registration must succeed');
        assert.equal(registration.headers.get('access-control-allow-origin'), origin);
        assert.equal(registration.headers.get('access-control-allow-credentials'), 'true');
        const cookie = registration.headers.get('set-cookie')?.split(';')[0];
        assert.ok(cookie, 'Session cookie must be present');
        const account = (await registration.json()).User;
        assert.equal(account.email, email);
        assert.equal(account.coins, 5);
        const stored = await connection.collection('users').findOne({ email });
        assert.ok(stored);
        assert.notEqual(stored.password, password);
        assert.match(stored.password, /^\$2/);
        results.push('Registration persists a password hash; browser CORS allows credentials');

        const session = await request('/session', { headers: { Cookie: cookie } });
        assert.equal(session.status, 200);
        assert.equal((await session.json()).email, email);
        const wallet = await request(`/getCoins/${encodeURIComponent(email)}`, { headers: { Cookie: cookie } });
        assert.equal(wallet.status, 200);
        assert.equal((await wallet.json()).coins, 5);
        results.push('Authenticated session and wallet');

        const wrongLogin = await request('/login', post({ email, password: 'Wrong!8password' }));
        assert.equal(wrongLogin.status, 401);
        const login = await request('/login', post({ email, password }));
        assert.equal(login.status, 200);
        assert.ok(login.headers.get('set-cookie'));
        assert.equal((await login.json()).email, email);
        const logout = await request('/logout', post({}, cookie));
        assert.equal(logout.status, 204);
        assert.match(logout.headers.get('set-cookie') || '', /binz_session=;/);
        results.push('Correct/incorrect login and logout');

        const recycler = await connection.collection('recyclers').findOne({ authorized: true, 'acceptedMaterials.0': { $exists: true }, 'serviceAreas.0': { $exists: true } });
        assert.ok(recycler, 'Existing seed directory must be available');
        const query = new URLSearchParams({ material: recycler.acceptedMaterials[0], location: recycler.serviceAreas[0], pickupRequired: 'false' });
        const matches = await request(`/recyclers/match?${query}`);
        assert.equal(matches.status, 200);
        assert.ok((await matches.json()).matches.length > 0);
        results.push('Recycler search reads the local database');
    } finally {
        if (connection) {
            await connection.collection('users').deleteOne({ email });
            assert.equal(await connection.collection('users').countDocuments({ email }), 0);
            await connection.close();
            results.push('Synthetic account removed');
        }
    }
    for (const result of results) console.log(`PASS: ${result}`);
})().catch((error) => { console.error(`Local integration check failed: ${error.message}`); process.exitCode = 1; });
