const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const twilio = require("twilio");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const xss = require('xss');
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();
app.use(express.json());
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
// Vercel gives each deployment a project-specific HTTPS URL. Allow only this
// project's production and deployment URLs so preview builds can call the API.
const isBinzVercelDeployment = (origin) =>
    /^https:\/\/project-binz(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
// Flutter web uses a localhost port in development. This allows local testing
// without opening production API access to arbitrary third-party sites.
const isLocalFlutterWebOrigin = (origin) =>
    /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/i.test(origin);
app.use(cors({
    origin(origin, callback) {
        if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || isBinzVercelDeployment(origin) || isLocalFlutterWebOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
}));
app.use(bodyParser.json());

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const SESSION_COOKIE_NAME = 'binz_session';
const cookieSameSite = process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax');
const sessionCookieOptions = {
    httpOnly: true,
    // Separate frontend and API domains need SameSite=None; HTTPS is required by browsers for that setting.
    secure: process.env.NODE_ENV === 'production' || cookieSameSite === 'none',
    sameSite: cookieSameSite,
    maxAge: SESSION_DURATION_MS,
};
const clearSessionCookieOptions = {
    httpOnly: sessionCookieOptions.httpOnly,
    secure: sessionCookieOptions.secure,
    sameSite: sessionCookieOptions.sameSite,
};

function getJwtSecret() {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production.');
    }
    return 'binz-development-session-secret';
}

const ADMIN_EMAIL = 'aman.bhutani2007@gmail.com';

function isAdminEmail(email) {
    return typeof email === 'string' && email.trim().toLowerCase() === ADMIN_EMAIL;
}

async function enforceAdminRole(user) {
    const admin = isAdminEmail(user.email);
    if (user.admin !== admin) {
        user.admin = admin;
        await user.save();
    }
    return user;
}

function publicAccount(user) {
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        state: user.state,
        phoneNumber: user.phoneNumber,
        coins: user.coins || 0,
        admin: user.admin === true,
    };
}

function startSession(res, user) {
    const token = jwt.sign(
        { sub: user._id.toString(), email: user.email, admin: user.admin === true },
        getJwtSecret(),
        { expiresIn: '24h' },
    );
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
    return token;
}

function requireSession(req, res, next) {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice('Bearer '.length)
        : null;
    const cookieToken = req.headers.cookie
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`))
        ?.slice(`${SESSION_COOKIE_NAME}=`.length);
    const token = bearerToken || cookieToken;

    if (!token) return res.status(401).json({ message: 'Authentication required.' });

    try {
        req.session = jwt.verify(token, getJwtSecret());
        next();
    } catch {
        res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);
        return res.status(401).json({ message: 'Session expired or invalid.' });
    }
}

const accountSid = process.env.twilioAccountSid;
const authToken = process.env.twilioAuthToken;
const twilioNumber = '+16814484190';
const client = twilio(accountSid, authToken);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/binzDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await seedDefaultRecyclers();
        await seedScrapPrices();
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};
connectDB();

app.get('/health', (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
        status: connected ? 'ok' : 'starting',
        database: connected ? 'connected' : 'unavailable',
    });
});

const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many registration attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const validateEmail = (email) => {
    return validator.isEmail(email);
};

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return xss(input.trim());
};

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    state: String,
    phoneNumber: String,
    coins: { type: Number, default: 0 },
    // This is server-owned. The app never accepts an admin value from a request.
    admin: { type: Boolean, default: false },
});
const User = mongoose.model("User", UserSchema);

const cleanupVerificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalFilename: { type: String, required: true },
    storedFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    fileHash: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    rejectionReason: { type: String, default: "" },
    reward: { type: Number, default: 0 },
    rewardCredited: { type: Boolean, default: false },
    reviewedAt: Date,
}, { timestamps: true });

cleanupVerificationSchema.index({ userId: 1, createdAt: -1 });
cleanupVerificationSchema.index({ userId: 1, fileHash: 1 }, { unique: true });
const CleanupVerification = mongoose.model("CleanupVerification", cleanupVerificationSchema);

const PRICE_SEED = [
    ["iron", "Iron", 28, 26],
    ["steel", "Steel", 42, 40],
    ["aluminium", "Aluminium", 110, 105],
    ["copper", "Copper", 665, 650],
    ["brass", "Brass", 400, 390],
    ["lead", "Lead", 128, 130],
    ["zinc", "Zinc", 184, 180],
];
const priceSchema = new mongoose.Schema({
    materialId: { type: String, required: true, trim: true },
    materialName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["INR"], default: "INR" },
    unit: { type: String, enum: ["kg"], default: "kg" },
    location: { type: String, required: true, trim: true },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    source: { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
priceSchema.index({ materialId: 1, location: 1, effectiveFrom: 1 }, { unique: true });
const ScrapPrice = mongoose.model("ScrapPrice", priceSchema);

function priceResponse(price) {
    return {
        priceId: price._id.toString(),
        materialId: price.materialId,
        materialName: price.materialName,
        price: price.price,
        currency: price.currency,
        unit: price.unit,
        location: price.location,
        effectiveFrom: price.effectiveFrom,
        effectiveTo: price.effectiveTo,
        updatedAt: price.updatedAt,
        status: price.status,
        source: price.source,
    };
}

async function seedScrapPrices() {
    const hasPrices = await ScrapPrice.exists({});
    if (hasPrices) return;
    const currentFrom = new Date("2026-11-01T00:00:00.000Z");
    const previousFrom = new Date("2026-10-01T00:00:00.000Z");
    const records = PRICE_SEED.flatMap(([materialId, materialName, current, previous]) => [
        { materialId, materialName, price: previous, location: "default", effectiveFrom: previousFrom, effectiveTo: currentFrom, source: "Existing indicative price history" },
        { materialId, materialName, price: current, location: "default", effectiveFrom: currentFrom, source: "Existing current price dataset; pending business confirmation" },
    ]);
    await ScrapPrice.insertMany(records);
}

const LeaderboardEntry = mongoose.model("LeaderboardEntry", new mongoose.Schema({
    name: { type: String, required: true },
    coins: { type: Number, required: true },
}));

// Recycler records are kept independently from customer accounts so the
// directory can be curated by BinZ without exposing recycler contact details
// in the browser until a customer requests an introduction.
const recyclerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    authorized: { type: Boolean, default: true },
    serviceAreas: { type: [String], default: [] },
    acceptedMaterials: { type: [String], default: [] },
    pickupAvailable: { type: Boolean, default: false },
    rateLabel: { type: String, default: "Quote on inspection" },
    distanceKm: { type: Number, default: 0 },
    address: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    email: { type: String, default: "" },
}, { timestamps: true });

const Recycler = mongoose.model("Recycler", recyclerSchema);

const recyclerConnectionSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recyclerId: { type: mongoose.Schema.Types.ObjectId, ref: "Recycler", required: true, index: true },
    material: { type: String, required: true },
    location: { type: String, required: true },
    pickupRequired: { type: Boolean, default: false },
    status: { type: String, enum: ["Requested", "Contacted", "Closed"], default: "Requested" },
}, { timestamps: true });

recyclerConnectionSchema.index({ customerId: 1, recyclerId: 1, material: 1, status: 1 });
const RecyclerConnection = mongoose.model("RecyclerConnection", recyclerConnectionSchema);

const DEFAULT_RECYCLERS = [
    {
        name: "EcoCycle Solutions",
        serviceAreas: ["Greater Noida", "Noida", "Delhi NCR"],
        acceptedMaterials: ["Mobile phones", "Laptops", "Batteries", "Chargers / adapters", "Mixed electronics"],
        pickupAvailable: true,
        rateLabel: "Up to ₹180/kg",
        distanceKm: 4.2,
        address: "Knowledge Park II, Greater Noida",
        phoneNumber: "+91 98765 10001",
        email: "collections@ecocycle.example",
    },
    {
        name: "GreenLoop Recyclers",
        serviceAreas: ["Greater Noida", "Noida", "Ghaziabad"],
        acceptedMaterials: ["PCB", "Cables", "Motors", "Plastic", "Printers", "Mixed electronics"],
        pickupAvailable: true,
        rateLabel: "Up to ₹135/kg",
        distanceKm: 7.8,
        address: "Sector 63, Noida",
        phoneNumber: "+91 98765 10002",
        email: "support@greenloop.example",
    },
    {
        name: "Renew IT Assets",
        serviceAreas: ["Greater Noida", "Noida", "Delhi"],
        acceptedMaterials: ["LCD", "CRT", "Laptops", "Mobile phones", "Printers"],
        pickupAvailable: false,
        rateLabel: "Quote on inspection",
        distanceKm: 11.5,
        address: "Sector 18, Noida",
        phoneNumber: "+91 98765 10003",
        email: "hello@renewit.example",
    },
    {
        name: "Delhi Circular Electronics",
        serviceAreas: ["Delhi", "New Delhi", "South Delhi", "Delhi NCR"],
        acceptedMaterials: ["Mobile phones", "Laptops", "PCB", "Cables", "Mixed electronics"],
        pickupAvailable: true,
        rateLabel: "Up to ₹160/kg",
        distanceKm: 9.4,
        address: "Okhla Industrial Area, New Delhi",
        phoneNumber: "+91 98765 10004",
        email: "pickup@delhicircular.example",
    },
    {
        name: "Gurugram GreenTech",
        serviceAreas: ["Gurugram", "Gurgaon", "Delhi NCR", "Manesar"],
        acceptedMaterials: ["Laptops", "Mobile phones", "Batteries", "Chargers / adapters", "Printers"],
        pickupAvailable: true,
        rateLabel: "Up to ₹175/kg",
        distanceKm: 12.6,
        address: "Udyog Vihar, Gurugram",
        phoneNumber: "+91 98765 10005",
        email: "collections@gurugramgreentech.example",
    },
    {
        name: "Faridabad Resource Recovery",
        serviceAreas: ["Faridabad", "Ballabhgarh", "Delhi NCR"],
        acceptedMaterials: ["CRT", "LCD", "Motors", "Plastic", "Mixed electronics"],
        pickupAvailable: true,
        rateLabel: "Up to ₹120/kg",
        distanceKm: 15.1,
        address: "Sector 24, Faridabad",
        phoneNumber: "+91 98765 10006",
        email: "team@faridabadrecovery.example",
    },
    {
        name: "Ghaziabad E-Cycle Hub",
        serviceAreas: ["Ghaziabad", "Indirapuram", "Vaishali", "Delhi NCR"],
        acceptedMaterials: ["PCB", "Cables", "Batteries", "Mobile phones", "Mixed electronics"],
        pickupAvailable: true,
        rateLabel: "Up to ₹145/kg",
        distanceKm: 8.6,
        address: "Sahibabad Industrial Area, Ghaziabad",
        phoneNumber: "+91 98765 10007",
        email: "pickup@ecyclehub.example",
    },
    {
        name: "Mumbai Renew Centre",
        serviceAreas: ["Mumbai", "Navi Mumbai", "Thane"],
        acceptedMaterials: ["Laptops", "Mobile phones", "Printers", "Chargers / adapters", "Mixed electronics"],
        pickupAvailable: true,
        rateLabel: "Up to ₹190/kg",
        distanceKm: 6.9,
        address: "Andheri East, Mumbai",
        phoneNumber: "+91 98765 10008",
        email: "support@mumbairenew.example",
    },
    {
        name: "Bengaluru E-Waste Collective",
        serviceAreas: ["Bengaluru", "Bangalore", "Whitefield", "Electronic City"],
        acceptedMaterials: ["Laptops", "Mobile phones", "PCB", "Batteries", "Mixed electronics"],
        pickupAvailable: true,
        rateLabel: "Up to ₹185/kg",
        distanceKm: 5.3,
        address: "Whitefield, Bengaluru",
        phoneNumber: "+91 98765 10009",
        email: "hello@bewastecollective.example",
    },
    {
        name: "Hyderabad Green Recovery",
        serviceAreas: ["Hyderabad", "Secunderabad", "Gachibowli"],
        acceptedMaterials: ["LCD", "CRT", "Laptops", "Printers", "Plastic"],
        pickupAvailable: true,
        rateLabel: "Up to ₹150/kg",
        distanceKm: 7.1,
        address: "HITEC City, Hyderabad",
        phoneNumber: "+91 98765 10010",
        email: "pickup@hyderabadgreen.example",
    },
    {
        name: "Pune Circular Systems",
        serviceAreas: ["Pune", "Pimpri-Chinchwad", "Hinjawadi"],
        acceptedMaterials: ["Mobile phones", "Laptops", "Cables", "Motors", "Mixed electronics"],
        pickupAvailable: true,
        rateLabel: "Up to ₹165/kg",
        distanceKm: 6.2,
        address: "Hinjawadi, Pune",
        phoneNumber: "+91 98765 10011",
        email: "team@punecircular.example",
    },
    {
        name: "Chennai Eco Asset Recovery",
        serviceAreas: ["Chennai", "Tambaram", "OMR"],
        acceptedMaterials: ["Laptops", "Mobile phones", "PCB", "Batteries", "Chargers / adapters"],
        pickupAvailable: true,
        rateLabel: "Up to ₹170/kg",
        distanceKm: 8.4,
        address: "Perungudi, Chennai",
        phoneNumber: "+91 98765 10012",
        email: "collections@chennaiecoasset.example",
    },
];

async function seedDefaultRecyclers() {
    await Recycler.bulkWrite(DEFAULT_RECYCLERS.map((recycler) => ({
        updateOne: {
            filter: { name: recycler.name },
            update: { $setOnInsert: recycler },
            upsert: true,
        },
    })));
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeRecycler(recycler) {
    return {
        id: recycler._id.toString(),
        recyclerName: recycler.name,
        authorized: recycler.authorized === true,
        distance: recycler.distanceKm ? `${recycler.distanceKm} km` : "Distance on request",
        rate: recycler.rateLabel,
        pickupAvailability: recycler.pickupAvailable ? "Available" : "Drop-off only",
        acceptedMaterials: recycler.acceptedMaterials,
        serviceAreas: recycler.serviceAreas,
        address: recycler.address,
    };
}

const PUBLIC_SEARCH_CONTENT = [
    { id: "home", type: "Page", title: "BinZ home", description: "Book a scrap pickup and explore responsible recycling, material prices, cleanup rewards and e-waste services.", href: "/#home", headings: "Book a pickup Sell smarter Impact tracker", keywords: "scrap collection kabad uthana pickup recycling recycle कबाड़ उठाना पुनर्चक्रण" },
    { id: "scrap-catalogue", type: "Page", title: "Scrap catalogue", description: "Find accepted electronics, metals and appliances and choose the right next step.", href: "/#scrap-catalogue", headings: "What would you like to sell", keywords: "scrap material waste metal loha iron lohe ka kabad लोहे का कबाड़ plastic प्लास्टिक plastic kachra कचरा paper kagaz कागज" },
    { id: "prices", type: "Page", title: "Today's scrap rates", description: "Compare backend-authoritative indicative rates by location and estimate material value.", href: "/#prices", headings: "Price discovery Estimate your scrap value", keywords: "price rate bhav भाव kilogram kg daam दाम scrap rates" },
    { id: "services", type: "Page", title: "Refurbishing and reuse", description: "Explore repair, reuse and refurbished-device services that extend product life.", href: "/#services", headings: "Repair reuse refurbishing", keywords: "service मरम्मत marammat reuse punarupyog पुन: उपयोग repair" },
    { id: "learn", type: "Page", title: "Know more about BinZ", description: "Learn how responsible collection, refurbishing and material recovery support a circular economy.", href: "/#learn", headings: "Learn circular recycling", keywords: "education जानकारी jaankari environment पर्यावरण recovery" },
    { id: "about", type: "Page", title: "About BinZ", description: "A student team project for SIH 2026 focused on simpler scrap collection and responsible e-waste handling in Greater Noida.", href: "/#about", headings: "What we are building", keywords: "team project greater noida नोएडा student" },
    { id: "contact", type: "Page", title: "Contact and feedback", description: "Find BinZ support details and prepare a message for questions or feedback.", href: "/#contact", headings: "Contact details support", keywords: "contact help support phone email sampark संपर्क" },
    { id: "help", type: "FAQ", title: "Help and FAQ", description: "Find answers about pickup booking, e-waste tickets, rates, rewards and recycler registration.", href: "/#help", headings: "How do I request a pickup Are rates guaranteed", keywords: "faq questions madad मदद pickup booking ticket reward recycler" },
    { id: "certifications", type: "Page", title: "Recycling certificates", description: "Understand the evidence and device-specific records expected after a recycling service.", href: "/#certifications", headings: "Provide evidence Identify the device", keywords: "certificate report proof evidence प्रमाण pramaan document" },
    { id: "ewaste-tracker", type: "Page", title: "E-waste tracking", description: "Explore the sample pickup and recycling journey from ticket creation to recovery.", href: "/#ewaste-tracker", headings: "Track e-waste", keywords: "electronic waste e-waste ई-कचरा e kachra tracking status" },
];

const SEARCH_ALIASES = {
    iron: ["loha", "loha kabad", "लोहे का कबाड़", "iron scrap", "metal scrap"],
    plastic: ["plastic kachra", "प्लास्टिक", "plastic waste"],
    paper: ["kagaz", "कागज", "paper waste", "paper scrap"],
    recycling: ["recycle", "recycling", "पुनर्चक्रण", "punarchakran"],
    "e-waste": ["electronic waste", "ई-कचरा", "e kachra", "electronics scrap"],
    pickup: ["scrap collection", "कबाड़ उठाना", "kabad uthana", "collection"],
};

function normalizeSearchText(value) {
    return String(value || "").normalize("NFKC").toLocaleLowerCase("en-IN").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function searchScore(item, queryTokens) {
    const title = normalizeSearchText(item.title);
    const fields = {
        title,
        keywords: normalizeSearchText(item.keywords),
        headings: normalizeSearchText(item.headings),
        description: normalizeSearchText(item.description),
        body: normalizeSearchText(item.body),
    };
    let score = 0;
    queryTokens.forEach((token) => {
        if (fields.title === token) score += 100;
        else if (fields.title.includes(token)) score += 60;
        if (fields.keywords.includes(token)) score += 35;
        if (fields.headings.includes(token)) score += 25;
        if (fields.description.includes(token)) score += 15;
        if (fields.body.includes(token)) score += 5;
    });
    return score;
}

async function searchPublicContent(query) {
    const normalizedQuery = normalizeSearchText(query);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const expandedTokens = new Set(queryTokens);
    Object.entries(SEARCH_ALIASES).forEach(([key, aliases]) => {
        const normalizedAliases = aliases.map(normalizeSearchText);
        if (queryTokens.some((token) => token === key || normalizedAliases.includes(token) || normalizedAliases.some((alias) => alias.includes(token)))) {
            expandedTokens.add(key);
            normalizedAliases.forEach((alias) => expandedTokens.add(alias));
        }
    });
    const items = [...PUBLIC_SEARCH_CONTENT, ...[
        ["iron", "Iron", "Heavy iron scrap and household metal items.", "Metals", "iron loha लोहे का कबाड़ lohe ka kabad scrap metal"],
        ["steel", "Steel", "Utensils, frames and small steel scrap.", "Metals", "steel scrap स्टील"],
        ["aluminium", "Aluminium", "Cans, frames and clean aluminium scrap.", "Metals", "aluminium aluminum एल्युमिनियम"],
        ["copper", "Copper wire", "Copper wire value depends on grade and insulation.", "Metals", "copper copper wire तांबा"],
        ["brass", "Brass", "Taps, fittings and clean brass scrap.", "Metals", "brass पीतल"],
        ["lead", "Lead", "Lead scrap is collected through a controlled recovery route.", "Metals", "lead सीसा"],
        ["zinc", "Zinc", "Clean zinc and galvanised offcuts accepted for recovery.", "Metals", "zinc जस्ता"],
        ["plastic", "Plastic", "Plastic waste is accepted for sorting and responsible recovery.", "Materials", "plastic plastic waste plastic kachra प्लास्टिक कचरा"],
        ["paper", "Paper scrap", "Paper scrap is accepted for recycling and material recovery.", "Materials", "paper paper scrap paper waste kagaz कागज"],
        ["ewaste", "E-waste", "Electronic waste is routed through a safe recovery ticket flow.", "Materials", "e-waste electronic waste ई-कचरा electronics scrap"],
    ].map(([id, title, description, group, keywords]) => ({ id, type: "Material", title, description, href: "/#scrap-catalogue", headings: group, keywords }))];
    const recyclers = await Recycler.find({ authorized: true }).select("name serviceAreas acceptedMaterials address").lean();
    recyclers.forEach((recycler) => items.push({
        id: `recycler-${recycler._id}`,
        type: "Directory",
        title: recycler.name,
        description: `${recycler.address || "Verified recycler"} serving ${(recycler.serviceAreas || []).join(", ")}.`,
        href: "/recycler-matching",
        headings: "Verified recycler directory",
        keywords: [...(recycler.serviceAreas || []), ...(recycler.acceptedMaterials || []), "recycler recycling partner"].join(" "),
    }));
    return {
        normalizedQuery,
        results: items
            .map((item) => ({ ...item, score: searchScore(item, [...expandedTokens]) }))
            .filter((item) => item.score > 0)
            .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
            .filter((item, index, list) => list.findIndex((candidate) => candidate.type === item.type && candidate.id === item.id) === index)
            .map(({ score, headings, keywords, body, ...item }) => ({ ...item, excerpt: item.description })),
    };
}

const leaderboardNames = [
    "Aarav Mehta", "Diya Kapoor", "Kabir Shah", "Meera Nair",
    "Rohan Verma", "Ishita Rao", "Vivaan Singh", "Anaya Joshi",
];
const EWASTE_TRACKING_STATUSES = [
    "Ticket Created",
    "Pickup Scheduled",
    "Picked Up",
    "At Facility",
    "Processing",
    "Material Recovery",
    "Final Disposal",
    "Recycled",
    "Cancelled",
];

const DEFAULT_TRACKING_STEPS = [
    { status: "Picked Up", label: "Picked Up", fallbackTime: "Pending" },
    { status: "At Facility", label: "At Facility", fallbackTime: "Pending" },
    { status: "Processing", label: "Processing", fallbackTime: "Pending" },
    { status: "Material Recovery", label: "Material Recovery", fallbackTime: "Pending" },
    { status: "Final Disposal", label: "Final Disposal", fallbackTime: "Pending" },
];

function normalizeTicketStatus(status) {
    if (typeof status !== "string") return null;
    const cleaned = sanitizeInput(status);
    return EWASTE_TRACKING_STATUSES.find((item) => item.toLowerCase() === cleaned.toLowerCase()) || null;
}

function buildTrackingSteps(currentStatus, history = []) {
    const activeIndex = DEFAULT_TRACKING_STEPS.findIndex((step) => step.status === currentStatus);
    const historyByStatus = new Map(
        history
            .filter((item) => item.status)
            .map((item) => [item.status, item]),
    );

    return DEFAULT_TRACKING_STEPS.map((step, index) => {
        const historyItem = historyByStatus.get(step.status);
        let state = "pending";

        if (currentStatus === "Cancelled") state = historyItem ? "done" : "cancelled";
        else if (currentStatus === "Ticket Created" || currentStatus === "Pickup Scheduled") state = "pending";
        else if (index < activeIndex) state = "done";
        else if (index === activeIndex) state = currentStatus === "Final Disposal" ? "done" : "active";

        return {
            status: step.status,
            label: step.label,
            state,
            time: historyItem?.changedAt || step.fallbackTime,
            note: historyItem?.note || "",
            facility: historyItem?.facility || "",
        };
    });
}

function buildReportDownloadUrl(ticket) {
    return `/track-ewaste/${encodeURIComponent(ticket.ticketID)}/report`;
}

function buildTrackingReport(ticket) {
    const productName = ticket.productName || ticket.eWasteType;
    const productCategory = ticket.productCategory || ticket.eWasteType;
    const lines = [
        "BinZ E-Waste Recycling Report",
        "",
        `Tracking ID: ${ticket.ticketID}`,
        `Product ID: ${ticket.productId || ticket.ticketID}`,
        `Product Name: ${productName}`,
        `Category: ${productCategory}`,
        `Current Status: ${ticket.status}`,
        `Status Note: ${ticket.statusNote || ""}`,
        `Facility: ${ticket.facility || ""}`,
        `Created At: ${ticket.createdAt || ticket.date || ""}`,
        `Updated At: ${ticket.updatedAt || ""}`,
        "",
        "Checkpoint History:",
    ];

    (ticket.statusHistory || []).forEach((item) => {
        lines.push(`- ${item.status}: ${item.note || "No note"} (${item.changedAt || "time pending"})`);
    });

    return `${lines.join("\n")}\n`;
}

function buildTrackingResponse(ticket, options = {}) {
    const productName = ticket.productName || ticket.eWasteType;
    const productCategory = ticket.productCategory || ticket.eWasteType;
    const response = {
        ticketID: ticket.ticketID,
        trackingID: ticket.ticketID,
        product: {
            id: ticket.productId || ticket.ticketID,
            name: productName,
            category: productCategory,
            type: ticket.eWasteType,
            imageUrl: ticket.productImageUrl,
            imageAlt: `${productName} product image`,
        },
        eWasteType: ticket.eWasteType,
        productId: ticket.productId || ticket.ticketID,
        productName,
        productCategory,
        productImageUrl: ticket.productImageUrl,
        description: ticket.description,
        status: ticket.status,
        statusNote: ticket.statusNote,
        facility: ticket.facility,
        scheduledPickupAt: ticket.scheduledPickupAt,
        estimatedCompletionAt: ticket.estimatedCompletionAt,
        recyclingReportUrl: ticket.recyclingReportUrl,
        reportDownloadUrl: buildReportDownloadUrl(ticket),
        report: {
            available: true,
            downloadUrl: buildReportDownloadUrl(ticket),
            externalUrl: ticket.recyclingReportUrl || null,
        },
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        trackingSteps: buildTrackingSteps(ticket.status, ticket.statusHistory || []),
        history: ticket.statusHistory,
    };

    if (options.includeCustomer) {
        response.customer = {
            name: ticket.name,
            email: ticket.email,
            pickupAddress: ticket.pickupAddress,
            phoneNumber: ticket.contactPhone,
        };
        response.name = ticket.name;
        response.email = ticket.email;
        response.pickupAddress = ticket.pickupAddress;
    }

    return response;
}

async function requireAdmin(req, res, next) {
    requireSession(req, res, async () => {
        try {
            const user = await User.findById(req.session.sub);
            if (!user) return res.status(401).json({ message: "Authentication required." });

            await enforceAdminRole(user);
            if (user.admin !== true) {
                return res.status(403).json({ message: "Administrator access required." });
            }

            req.admin = user;
            next();
        } catch (error) {
            console.error("Admin authorization error:", error);
            return res.status(500).json({ message: "Unable to verify administrator access." });
        }
    });
}

async function findApplicablePrices(location, dateValue) {
    const date = new Date(dateValue || Date.now());
    if (Number.isNaN(date.getTime())) throw new Error("Invalid pricing date.");
    const requestedLocation = sanitizeInput(location || "default") || "default";
    const records = await ScrapPrice.find({
        location: { $in: [requestedLocation, "default"] },
        status: "active",
        effectiveFrom: { $lte: date },
        $or: [{ effectiveTo: null }, { effectiveTo: { $gt: date } }],
    }).sort({ location: -1, effectiveFrom: -1 });
    const selected = new Map();
    records.forEach((record) => {
        if (!selected.has(record.materialId)) selected.set(record.materialId, record);
    });
    return [...selected.values()];
}

app.get("/search", async (req, res) => {
    try {
        const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
        if (query.length > 150) return res.status(400).json({ message: "Search queries must be 150 characters or fewer." });
        if (!query) return res.json({ query: "", total: 0, page: 1, limit: 20, results: [] });
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const search = await searchPublicContent(query);
        const start = (page - 1) * limit;
        res.json({
            query,
            total: search.results.length,
            page,
            limit,
            results: search.results.slice(start, start + limit),
            hasMore: start + limit < search.results.length,
        });
    } catch (error) {
        console.error("Public search error:", error);
        res.status(500).json({ message: "Search is temporarily unavailable. Please try again." });
    }
});

app.get("/scrap-prices", async (req, res) => {
    try {
        const prices = await findApplicablePrices(req.query.location, req.query.date);
        res.json({
            prices: prices.map(priceResponse),
            requestedLocation: sanitizeInput(req.query.location || "default") || "default",
            pricingBasis: "Location-specific rate, falling back to the backend default rate.",
        });
    } catch (error) {
        res.status(400).json({ message: error.message === "Invalid pricing date." ? error.message : "Unable to load scrap prices." });
    }
});

app.get("/scrap-prices/:materialId/history", async (req, res) => {
    try {
        const history = await ScrapPrice.find({ materialId: sanitizeInput(req.params.materialId) }).sort({ effectiveFrom: -1 });
        res.json({ prices: history.map(priceResponse) });
    } catch (error) {
        console.error("Price history error:", error);
        res.status(500).json({ message: "Unable to load price history." });
    }
});

app.post("/scrap-prices", requireAdmin, async (req, res) => {
    try {
        const { materialId, materialName, price, location = "default", effectiveFrom, effectiveTo, source } = req.body || {};
        const numericPrice = Number(price);
        const from = new Date(effectiveFrom);
        const to = effectiveTo ? new Date(effectiveTo) : null;
        if (!materialId || !materialName || !Number.isFinite(numericPrice) || numericPrice < 0 || Number.isNaN(from.getTime()) || (to && Number.isNaN(to.getTime())) || (to && to <= from) || !source) {
            return res.status(400).json({ message: "Valid material, non-negative price, effective dates and source are required." });
        }
        const normalizedLocation = sanitizeInput(location) || "default";
        const overlap = await ScrapPrice.findOne({
            materialId: sanitizeInput(materialId),
            location: normalizedLocation,
            status: "active",
            effectiveFrom: { $lt: to || new Date("9999-12-31") },
            $or: [{ effectiveTo: null }, { effectiveTo: { $gt: from } }],
        });
        if (overlap) return res.status(409).json({ message: "This material and location has an overlapping active price period." });
        const record = await ScrapPrice.create({
            materialId: sanitizeInput(materialId),
            materialName: sanitizeInput(materialName),
            price: numericPrice,
            location: normalizedLocation,
            effectiveFrom: from,
            effectiveTo: to,
            source: sanitizeInput(source),
            updatedBy: req.admin._id,
        });
        res.status(201).json({ price: priceResponse(record) });
    } catch (error) {
        console.error("Price update error:", error);
        res.status(500).json({ message: "Unable to create scrap price." });
    }
});

app.post("/register", registrationLimiter, async (req, res) => {
    try {
        const { firstName, lastName, email, password, state } = req.body;

        if (!firstName || !lastName || !email || !password || !state) {
            return res.status(400).json({ message: "First name, last name, email, password and state are required!" });
        }

        const sanitizedFirstName = sanitizeInput(firstName);
        const sanitizedLastName = sanitizeInput(lastName);
        const sanitizedEmail = sanitizeInput(email);
        const sanitizedState = sanitizeInput(state);

        if (!validateEmail(sanitizedEmail)) {
            return res.status(400).json({ message: "Please enter a valid email address!" });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character!"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const existingUser = await User.findOne({ email: sanitizedEmail.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const newUser = new User({
            firstName: sanitizedFirstName,
            lastName: sanitizedLastName,
            email: sanitizedEmail.toLowerCase(),
            password: hashedPassword,
            state: sanitizedState,
            coins: 5,
            admin: isAdminEmail(sanitizedEmail),
        });
        const savedUser = await newUser.save();
        const sessionToken = startSession(res, savedUser);
        const account = publicAccount(savedUser);
        res.status(201).json({
            message: "✅ Registration successful! 5 bonus coins added!",
            User: account,
            // Returned only for Flutter clients; browsers continue using the HTTP-only cookie.
            ...(req.get('X-Client-Platform') === 'flutter' ? { sessionToken } : {}),
        });

    } catch (error) {
        console.error("❌ Error during registration:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "User already exists!" });
        }
        res.status(500).json({ message: "❌ Server error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ message: "❌ Email is required!" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "❌ Invalid credentials!" });
        }

        if (!password || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "❌ Invalid credentials!" });
        }

        await enforceAdminRole(user);
        const sessionToken = startSession(res, user);
        res.status(200).json({
            message: "✅ Login successful!",
            ...publicAccount(user),
            ...(req.get('X-Client-Platform') === 'flutter' ? { sessionToken } : {}),
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "❌ Server error" });
    }
});

app.get('/session', requireSession, async (req, res) => {
    try {
        const user = await User.findById(req.session.sub);
        if (!user) {
            res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);
            return res.status(401).json({ message: 'Session user no longer exists.' });
        }

        await enforceAdminRole(user);
        res.status(200).json(publicAccount(user));
    } catch (error) {
        console.error('❌ Session lookup error:', error);
        res.status(500).json({ message: '❌ Server error' });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);
    res.status(204).end();
});

app.post("/sendSMS", async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber || phoneNumber.length !== 10) {
            return res.status(400).json({ message: "⚠️ Invalid phone number!" });
        }
        const fullPhoneNumber = `+91${phoneNumber}`;
        const message = await client.messages.create({
            body: "Your slot is booked successfully! A Rider will be assigned soon. Thanks For Contacting Us!",
            from: twilioNumber,
            to: fullPhoneNumber,
        });
        console.log("✅ Message sent! SID:", message.sid);
        res.status(200).json({ message: "📩 SMS sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending SMS:", error);
        res.status(500).json({ message: "❌ Failed to send SMS!" });
    }
});

app.post("/storePhoneNumber", async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        if (!email || !phoneNumber) {
            return res.status(400).json({ message: "⚠️ Email and Phone Number are required!" });
        }
        const updatedUser = await User.findOneAndUpdate({ email: email.toLowerCase() }, { $set: { phoneNumber } }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "❌ User not found!" });
        }
        res.status(200).json({ message: "✅ Phone number stored successfully!" });
    } catch (error) {
        console.error("❌ Error storing phone number:", error);
        res.status(500).json({ message: "❌ Server error!" });
    }
});

app.get("/leaderboard", async (req, res) => {
    try {
        let entries = await User.find({})
            .sort({ coins: -1 })
            .limit(8)
            .select("firstName lastName coins _id");

        entries = entries.map((user) => ({
            _id: user._id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            coins: user.coins || 0,
        }));

        if (entries.length === 0) {
            entries = await LeaderboardEntry.find({})
                .sort({ coins: -1 })
                .limit(8)
                .select("name coins _id");
        }

        res.status(200).json({ leaderboard: entries });
    } catch (error) {
        console.error("❌ Leaderboard Fetch Error:", error);
        res.status(500).json({ message: "❌ Server error" });
    }
});

app.get("/getCoins/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "❌ User not found!" });
        }
        res.status(200).json({ coins: user.coins });
    } catch (error) {
        console.error("❌ Error fetching coins:", error);
        res.status(500).json({ message: "❌ Server error!" });
    }
});

app.get("/recyclers/match", async (req, res) => {
    try {
        const material = typeof req.query.material === "string" ? sanitizeInput(req.query.material) : "";
        const location = typeof req.query.location === "string" ? sanitizeInput(req.query.location) : "";
        const pickupRequired = req.query.pickupRequired === "true";

        if (!material || !location) {
            return res.status(400).json({ message: "Material and location are required." });
        }
        if (material.length > 80 || location.length > 120) {
            return res.status(400).json({ message: "Material or location is too long." });
        }

        const matches = await Recycler.find({
            authorized: true,
            acceptedMaterials: { $regex: new RegExp(`^${escapeRegex(material)}$`, "i") },
            serviceAreas: { $regex: new RegExp(escapeRegex(location), "i") },
            ...(pickupRequired ? { pickupAvailable: true } : {}),
        })
            .sort({ distanceKm: 1, name: 1 })
            .limit(20);

        res.json({
            matches: matches.map(normalizeRecycler),
            criteria: { material, location, pickupRequired },
        });
    } catch (error) {
        console.error("Recycler matching error:", error);
        res.status(500).json({ message: "Unable to find recyclers right now." });
    }
});

app.post("/recycler-connections", requireSession, async (req, res) => {
    try {
        const recyclerId = typeof req.body.recyclerId === "string" ? req.body.recyclerId : "";
        const material = typeof req.body.material === "string" ? sanitizeInput(req.body.material) : "";
        const location = typeof req.body.location === "string" ? sanitizeInput(req.body.location) : "";
        const pickupRequired = req.body.pickupRequired === true;

        if (!mongoose.isValidObjectId(recyclerId) || !material || !location) {
            return res.status(400).json({ message: "Recycler, material, and location are required." });
        }
        if (material.length > 80 || location.length > 120) {
            return res.status(400).json({ message: "Material or location is too long." });
        }

        const [user, recycler] = await Promise.all([
            User.findById(req.session.sub),
            Recycler.findOne({ _id: recyclerId, authorized: true }),
        ]);
        if (!user) return res.status(401).json({ message: "Authentication required." });
        if (!recycler) return res.status(404).json({ message: "Recycler not found." });
        if (!recycler.acceptedMaterials.some((item) => item.toLowerCase() === material.toLowerCase())) {
            return res.status(400).json({ message: "This recycler does not accept that material." });
        }
        if (pickupRequired && !recycler.pickupAvailable) {
            return res.status(400).json({ message: "This recycler does not offer pickup." });
        }

        const existing = await RecyclerConnection.findOne({
            customerId: user._id,
            recyclerId: recycler._id,
            material,
            status: "Requested",
        });
        const connection = existing || await RecyclerConnection.create({
            customerId: user._id,
            recyclerId: recycler._id,
            material,
            location,
            pickupRequired,
        });

        res.status(existing ? 200 : 201).json({
            message: existing
                ? `Your request to ${recycler.name} is already pending.`
                : `Connection request sent to ${recycler.name}.`,
            connection: {
                id: connection._id,
                status: connection.status,
                recycler: normalizeRecycler(recycler),
            },
        });
    } catch (error) {
        console.error("Recycler connection error:", error);
        res.status(500).json({ message: "Unable to contact this recycler right now." });
    }
});

// ✅ Reward coins endpoint
app.post("/rewardCoins", async (req, res) => {
    try {
        const { email, coins } = req.body;
        if (!email || typeof coins !== 'number') {
            return res.status(400).json({ message: "⚠️ Email and coins are required!" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "❌ User not found!" });
        }

        user.coins += coins;
        await user.save();

        res.status(200).json({ message: `✅ ${coins} coins added!`, coins: user.coins });
    } catch (error) {
        console.error("❌ Error updating coins:", error);
        res.status(500).json({ message: "❌ Server error while rewarding coins" });
    }
});

app.get("/register", (req, res) => res.send("✅ Registration Route is Working!"));
app.get("/login", (req, res) => res.send("✅ Login Route is Working!"));

if (!fs.existsSync(path.join(__dirname, "uploads"))) {
    fs.mkdirSync(path.join(__dirname, "uploads"));
}

const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/ogg", "video/mpeg"]);
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
    storage,
    limits: { fileSize: VIDEO_MAX_BYTES, files: 1 },
    fileFilter: (req, file, cb) => cb(null, VIDEO_MIME_TYPES.has(file.mimetype)),
});

function cleanupVerificationResponse(item) {
    return {
        verificationId: item._id.toString(),
        status: item.status,
        originalFilename: item.originalFilename,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        submittedAt: item.createdAt,
        reviewedAt: item.reviewedAt || null,
        rejectionReason: item.status === "rejected" ? item.rejectionReason || null : null,
        reward: item.status === "approved" ? item.reward : 0,
        rewardCredited: item.status === "approved" && item.rewardCredited === true,
    };
}

function runVideoUpload(req, res, next) {
    upload.single("video")(req, res, (error) => {
        if (!error) return next();
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ message: "Cleanup videos must be 50 MB or smaller." });
        }
        return res.status(400).json({ message: "Choose one supported cleanup video file." });
    });
}

app.post("/uploadVideo", requireSession, runVideoUpload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video file received." });
        }
        const user = await User.findById(req.session.sub);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const fileHash = crypto.createHash("sha256").update(fs.readFileSync(req.file.path)).digest("hex");
        const existing = await CleanupVerification.findOne({ userId: user._id, fileHash });
        if (existing) {
            fs.unlink(req.file.path, () => {});
            return res.status(409).json({ message: "This cleanup video has already been submitted.", verification: cleanupVerificationResponse(existing) });
        }
        const verification = await CleanupVerification.create({
            userId: user._id,
            originalFilename: req.file.originalname,
            storedFilename: req.file.filename,
            mimeType: req.file.mimetype,
            sizeBytes: req.file.size,
            fileHash,
        });
        res.status(201).json({ verification: cleanupVerificationResponse(verification) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: "This cleanup video has already been submitted." });
        console.error("❌ Upload error:", error);
        res.status(500).json({ message: "❌ Server error while processing upload." });
    }
});

app.get("/cleanup-verifications", requireSession, async (req, res) => {
    try {
        const verifications = await CleanupVerification.find({ userId: req.session.sub }).sort({ createdAt: -1 });
        const user = await User.findById(req.session.sub).select("coins");
        res.json({ verifications: verifications.map(cleanupVerificationResponse), rewardBalance: user?.coins || 0 });
    } catch (error) {
        console.error("❌ Cleanup history error:", error);
        res.status(500).json({ message: "Unable to load cleanup verification history." });
    }
});

app.get("/cleanup-verifications/:verificationId", requireSession, async (req, res) => {
    try {
        const verification = await CleanupVerification.findOne({
            _id: req.params.verificationId,
            userId: req.session.sub,
        });
        if (!verification) return res.status(404).json({ message: "Cleanup verification not found." });
        const user = await User.findById(req.session.sub).select("coins");
        res.json({ verification: cleanupVerificationResponse(verification), rewardBalance: user?.coins || 0 });
    } catch (error) {
        if (error.name === "CastError") return res.status(404).json({ message: "Cleanup verification not found." });
        console.error("❌ Cleanup verification lookup error:", error);
        res.status(500).json({ message: "Unable to load cleanup verification." });
    }
});

app.patch("/cleanup-verifications/:verificationId/review", requireSession, async (req, res) => {
    try {
        const reviewer = await User.findById(req.session.sub);
        if (!reviewer || reviewer.admin !== true) return res.status(403).json({ message: "Operator access required." });
        const status = req.body?.status;
        if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Review status must be approved or rejected." });
        const verification = await CleanupVerification.findById(req.params.verificationId);
        if (!verification) return res.status(404).json({ message: "Cleanup verification not found." });
        if (verification.status !== "pending") return res.status(409).json({ message: "This verification has already been reviewed." });
        if (status === "rejected" && typeof req.body?.rejectionReason !== "string") {
            return res.status(400).json({ message: "A rejection reason is required." });
        }

        verification.status = status;
        verification.reviewedAt = new Date();
        if (status === "rejected") {
            verification.rejectionReason = sanitizeInput(req.body.rejectionReason).slice(0, 500);
        } else {
            const configuredReward = Number(process.env.CLEANUP_VIDEO_REWARD);
            verification.reward = Number.isFinite(configuredReward) && configuredReward >= 0 ? configuredReward : 0;
            if (!verification.rewardCredited && verification.reward > 0) {
                const user = await User.findById(verification.userId);
                if (!user) return res.status(404).json({ message: "Verification owner was not found." });
                user.coins += verification.reward;
                await user.save();
                verification.rewardCredited = true;
            }
        }
        await verification.save();
        const owner = await User.findById(verification.userId).select("coins");
        res.json({ verification: cleanupVerificationResponse(verification), rewardBalance: owner?.coins || 0 });
    } catch (error) {
        if (error.name === "CastError") return res.status(404).json({ message: "Cleanup verification not found." });
        console.error("❌ Cleanup review error:", error);
        res.status(500).json({ message: "Unable to review cleanup verification." });
    }
});

// E-waste ticket and tracking system
const ticketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    eWasteType: { type: String, required: true },
    productName: String,
    productCategory: String,
    productId: { type: String, unique: true, sparse: true, index: true },
    productImageUrl: String,
    description: String,
    pickupAddress: String,
    contactPhone: String,
    co2Saved: { type: Number, default: 4.5 },
    ticketID: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: EWASTE_TRACKING_STATUSES, default: "Ticket Created" },
    statusNote: { type: String, default: "Your e-waste ticket has been created." },
    facility: { type: String, default: "Greater Noida, UP" },
    scheduledPickupAt: Date,
    estimatedCompletionAt: Date,
    recyclingReportUrl: String,
    statusHistory: [
        {
            status: { type: String, enum: EWASTE_TRACKING_STATUSES },
            note: String,
            facility: String,
            changedBy: String,
            changedAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);

async function createUniqueTicketID() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const ticketID = "EW-" + Math.floor(100000 + Math.random() * 900000);
        const existingTicket = await Ticket.exists({ ticketID });
        if (!existingTicket) return ticketID;
    }

    return `EW-${Date.now()}`;
}

async function createUniqueProductId() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const productId = "BINZ-" + Math.floor(10000 + Math.random() * 90000);
        const existingProduct = await Ticket.exists({ productId });
        if (!existingProduct) return productId;
    }

    return `BINZ-${Date.now()}`;
}

app.post("/submit-ticket", requireSession, async (req, res) => {
    try {
        const { eWasteType, productName, productCategory, productImageUrl, description, pickupAddress, scheduledPickupAt } = req.body;
        const user = await User.findById(req.session.sub);
        if (!user || !eWasteType) {
            return res.status(400).json({ message: "An authenticated account and device type are required." });
        }
        const sanitizedEmail = user.email.toLowerCase();

        const ticketID = await createUniqueTicketID();
        const productId = await createUniqueProductId();
        const sanitizedProductName = sanitizeInput(productName || eWasteType);
        const sanitizedProductCategory = sanitizeInput(productCategory || eWasteType);
        const initialStatus = "Ticket Created";
        const initialNote = "Your e-waste ticket has been created.";
        const newTicket = new Ticket({
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: sanitizedEmail,
            eWasteType: sanitizeInput(eWasteType),
            productName: sanitizedProductName,
            productCategory: sanitizedProductCategory,
            productId,
            productImageUrl: sanitizeInput(productImageUrl || ""),
            description: sanitizeInput(description || ""),
            pickupAddress: sanitizeInput(pickupAddress || ""),
            contactPhone: user.phoneNumber || "+91 98765 43210",
            scheduledPickupAt: scheduledPickupAt ? new Date(scheduledPickupAt) : undefined,
            ticketID,
            status: initialStatus,
            statusNote: initialNote,
            statusHistory: [
                {
                    status: initialStatus,
                    note: initialNote,
                    changedBy: "system",
                },
            ],
        });
        await newTicket.save();

        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: sanitizedEmail,
                subject: "E-Waste Ticket Confirmation",
                text: `Hello ${newTicket.name}\n\nYour ticket has been created successfully.\nTicket ID: ${ticketID}\nTrack it at: /track-ewaste/${ticketID}\n\nWe will contact you soon!\n\nThank you!`
            };

            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.error("⚠️ Ticket email failed (ticket still created):", mailError.message);
        }

        res.status(201).json({
            message: "Ticket created successfully!",
            ticketID,
            trackingID: ticketID,
            tracking: buildTrackingResponse(newTicket, { includeCustomer: true }),
        });

    } catch (error) {
        console.error("Error submitting ticket:", error);
        res.status(500).json({ message: "Error submitting ticket" });
    }
});

app.get('/tickets/me', requireSession, async (req, res) => {
    try {
        const user = await User.findById(req.session.sub);
        if (!user) return res.status(401).json({ message: 'Authentication required.' });
        const tickets = await Ticket.find({ email: user.email.toLowerCase() })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ tickets: tickets.map((ticket) => buildTrackingResponse(ticket)) });
    } catch (error) {
        console.error('Error fetching user e-waste tickets:', error);
        res.status(500).json({ message: 'Unable to fetch tickets.' });
    }
});

app.get('/dashboard', requireSession, async (req, res) => {
    try {
        const user = await User.findById(req.session.sub);
        if (!user) return res.status(401).json({ message: 'Authentication required.' });
        const tickets = await Ticket.find({ email: user.email.toLowerCase() }).sort({ createdAt: -1 });
        const co2Saved = tickets.reduce((total, ticket) => total + (ticket.co2Saved || 0), 0);
        res.json({
            account: publicAccount(user),
            impact: {
                co2Saved: Number(co2Saved.toFixed(1)),
                eWasteItems: tickets.length,
                recycledItems: tickets.filter((ticket) => ticket.status === 'Recycled').length,
            },
            tickets: tickets.slice(0, 5).map((ticket) => buildTrackingResponse(ticket)),
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ message: 'Unable to fetch dashboard.' });
    }
});

app.get("/track-ewaste/:ticketID", async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketID: sanitizeInput(req.params.ticketID) });
        if (!ticket) {
            return res.status(404).json({ message: "Tracking ID not found." });
        }

        res.status(200).json({ tracking: buildTrackingResponse(ticket) });
    } catch (error) {
        console.error("Error fetching e-waste tracking:", error);
        res.status(500).json({ message: "Error fetching e-waste tracking" });
    }
});

app.get("/track-ewaste/:ticketID/report", async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketID: sanitizeInput(req.params.ticketID) });
        if (!ticket) {
            return res.status(404).json({ message: "Tracking ID not found." });
        }

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="binz-ewaste-report-${ticket.ticketID}.txt"`);
        res.status(200).send(buildTrackingReport(ticket));
    } catch (error) {
        console.error("Error downloading e-waste report:", error);
        res.status(500).json({ message: "Error downloading e-waste report" });
    }
});
app.get("/admin/ewaste-tickets", requireAdmin, async (req, res) => {
    try {
        const { status, email } = req.query;
        const filter = {};

        const normalizedStatus = status ? normalizeTicketStatus(status) : null;
        if (status && !normalizedStatus) {
            return res.status(400).json({ message: "Invalid status value." });
        }
        if (normalizedStatus) filter.status = normalizedStatus;
        if (email) filter.email = sanitizeInput(email).toLowerCase();

        const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ tickets: tickets.map((ticket) => buildTrackingResponse(ticket, { includeCustomer: true })) });
    } catch (error) {
        console.error("Error fetching admin e-waste tickets:", error);
        res.status(500).json({ message: "Error fetching e-waste tickets" });
    }
});

app.get("/admin/ewaste-tickets/:ticketID", requireAdmin, async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketID: sanitizeInput(req.params.ticketID) });
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found." });
        }

        res.status(200).json({ ticket: buildTrackingResponse(ticket, { includeCustomer: true }) });
    } catch (error) {
        console.error("Error fetching admin e-waste ticket:", error);
        res.status(500).json({ message: "Error fetching e-waste ticket" });
    }
});

app.patch("/admin/ewaste-tickets/:ticketID/status", requireAdmin, async (req, res) => {
    try {
        const status = normalizeTicketStatus(req.body.status);
        if (!status) {
            return res.status(400).json({
                message: "Invalid status value.",
                allowedStatuses: EWASTE_TRACKING_STATUSES,
            });
        }

        const ticket = await Ticket.findOne({ ticketID: sanitizeInput(req.params.ticketID) });
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found." });
        }

        const statusNote = sanitizeInput(req.body.statusNote || req.body.note || "");
        const facility = sanitizeInput(req.body.facility || ticket.facility || "");
        const changedBy = sanitizeInput(req.body.changedBy || "admin");

        ticket.status = status;
        ticket.statusNote = statusNote || ticket.statusNote;
        ticket.facility = facility;
        if (req.body.scheduledPickupAt) ticket.scheduledPickupAt = new Date(req.body.scheduledPickupAt);
        if (req.body.estimatedCompletionAt) ticket.estimatedCompletionAt = new Date(req.body.estimatedCompletionAt);
        if (req.body.recyclingReportUrl) ticket.recyclingReportUrl = sanitizeInput(req.body.recyclingReportUrl);
        if (req.body.productName) ticket.productName = sanitizeInput(req.body.productName);
        if (req.body.productCategory) ticket.productCategory = sanitizeInput(req.body.productCategory);
        if (req.body.productImageUrl) ticket.productImageUrl = sanitizeInput(req.body.productImageUrl);
        ticket.statusHistory.push({
            status,
            note: ticket.statusNote,
            facility: ticket.facility,
            changedBy,
        });

        await ticket.save();
        res.status(200).json({
            message: "Ticket status updated successfully.",
            ticket: buildTrackingResponse(ticket, { includeCustomer: true }),
        });
    } catch (error) {
        console.error("Error updating e-waste ticket status:", error);
        res.status(500).json({ message: "Error updating e-waste ticket status" });
    }
});

// ✅ Unified Server Start
const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
