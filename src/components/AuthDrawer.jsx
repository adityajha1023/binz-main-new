import { Button, FormMessage, FormField } from './ui';
import React, { useRef, useState } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { accountFrom, requestJson } from '../services/requestJson';

export default function AuthDrawer({ isOpen, onClose, updateCoins, setFirstName }) {
  const [mode, setMode] = useState('login');
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusTone, setStatusTone] = useState('info');
  const submitting = useRef(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setStatusTone('loading');
    setStatus('Checking your account…');
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const body = mode === 'login'
        ? { email: normalizedEmail, password }
        : {
            firstName: fName.trim(),
            lastName: lName.trim(),
            email: normalizedEmail,
            password,
            state: state.trim(),
          };
      const result = await requestJson(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const account = accountFrom(result);
      const accountName = account.firstName || fName.trim();
      setFirstName(accountName);
      setFName(account.firstName || '');
      setLName(account.lastName || '');
      setEmail(account.email || normalizedEmail);
      setState(account.state || state);
      localStorage.setItem('firstName', accountName);
      localStorage.setItem('lastName', account.lastName || lName.trim());
      localStorage.setItem('email', account.email || normalizedEmail);
      localStorage.setItem('state', account.state || state.trim());
      updateCoins(Number(account.coins), { persist: false });
      setStatusTone('success');
      setStatus(`Welcome, ${accountName}. Your wallet has ${account.coins} Z-Coins.`);
    } catch (error) {
      setStatusTone('error');
      setStatus(error.message || 'Unable to connect to the account service.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <aside
      className={`drawer${isOpen ? ' open' : ''}`}
      id="authPanel"
      aria-hidden={!isOpen}
      aria-label="Account panel"
      role="dialog"
      aria-modal={isOpen || undefined}
      inert={!isOpen}
    >
      <div className="drawer-head">
        <div>
          <p className="eyebrow">Account</p>
          <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        </div>
        <button className="icon-button" type="button" aria-label="Close account" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="auth-modes" role="tablist" aria-label="Account access mode">
        <Button
          className={`button${mode === 'login' ? ' primary' : ''}`}
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          variant={mode === 'login' ? 'primary' : 'secondary'}
          disabled={isSubmitting}
          onClick={() => { setMode('login'); setStatus(''); }}
        >
          <LogIn size={16} /> Sign in
        </Button>
        <Button
          className={`button${mode === 'register' ? ' primary' : ''}`}
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          variant={mode === 'register' ? 'primary' : 'secondary'}
          disabled={isSubmitting}
          onClick={() => { setMode('register'); setStatus(''); }}
        >
          <UserPlus size={16} /> Register
        </Button>
      </div>
      <form id="authForm" className="stacked-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <fieldset className="ui-pending-fields" disabled={isSubmitting}>
        {mode === 'register' && <>
          <FormField label="First name" autoComplete="given-name"
            id="firstName"
            type="text"
            placeholder="First name"
            required
            value={fName}
            onChange={(e) => setFName(e.target.value)}
          />
          <FormField label="Last name" autoComplete="family-name"
            id="lastName"
            type="text"
            placeholder="Last name"
            required
            value={lName}
            onChange={(e) => setLName(e.target.value)}
          />
        </>}
        <FormField label="Email" autoComplete="email"
          id="email"
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField label="Password"
          id="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          type="password"
          placeholder="Password"
          required
          minLength={8}
          hint={mode === 'register' ? 'At least 8 characters, including uppercase, lowercase, a number and a special character.' : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === 'register' && <FormField label="State" autoComplete="address-level1"
          id="state"
          type="text"
          placeholder="State"
          required
          value={state}
          onChange={(e) => setState(e.target.value)}
        />}
        <Button className="button primary full" type="submit" loading={isSubmitting} loadingLabel="Please wait…">
          {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
        </fieldset>
        <FormMessage id="authStatus" tone={statusTone}>{status}</FormMessage>
      </form>
    </aside>
  );
}
