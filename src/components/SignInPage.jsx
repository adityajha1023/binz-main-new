import { Button, FormMessage, FormField } from './ui';
import React, { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { accountFrom, requestJson } from '../services/requestJson';
import { useSubmission } from '../hooks/useSubmission';

export default function SignInPage({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { pending: isSubmitting, feedback, run } = useSubmission();

  async function handleSubmit(event) {
    event.preventDefault();
    run({
      pendingMessage: 'Signing in…',
      operation: async (signal) => accountFrom(await requestJson('/login', {
        signal,
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })),
      successMessage: 'Signed in. Opening your account…',
      onSuccess: onAuthenticated,
    });
  }

  return (
    <main className="auth-page">
      <a className="auth-back-link" href="#home">
        <ArrowLeft size={16} /> Back to BinZ
      </a>
      <section className="auth-card ui-card" aria-labelledby="sign-in-title">
        <p className="eyebrow">Welcome back</p>
        <h1 id="sign-in-title">Sign in to BinZ</h1>
        <p className="auth-intro">Continue managing your pickups, rewards, and recycling impact.</p>
        <form className="stacked-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <fieldset className="ui-pending-fields" disabled={isSubmitting}>
          <FormField label="Email" autoComplete="email" id="signInEmail" type="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <FormField label="Password" autoComplete="current-password" id="signInPassword" type="password" placeholder="Enter your password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          <Button className="button primary full" type="submit" loading={isSubmitting} loadingLabel="Signing in…">
            <LogIn size={18} /> Sign in
          </Button>
          </fieldset>
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </form>
        <p className="auth-switch">
          New to BinZ? <a href="#signup">Sign up</a>
        </p>
      </section>
    </main>
  );
}
