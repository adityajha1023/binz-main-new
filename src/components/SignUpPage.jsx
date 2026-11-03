import { Button, FormMessage, FormField } from './ui';
import React, { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { accountFrom, requestJson } from '../services/requestJson';
import { useSubmission } from '../hooks/useSubmission';

export default function SignUpPage({ onAuthenticated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { pending: isSubmitting, feedback, run } = useSubmission();

  async function handleSubmit(event) {
    event.preventDefault();
    run({
      pendingMessage: 'Creating your account…',
      operation: async (signal) => accountFrom(await requestJson('/register', {
        signal,
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: name.trim(),
          lastName: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          state: 'Uttar Pradesh',
        }),
      })),
      successMessage: 'Account created. Opening your account…',
      onSuccess: onAuthenticated,
    });
  }

  return (
    <main className="auth-page">
      <a className="auth-back-link" href="#home">
        <ArrowLeft size={16} /> Back to BinZ
      </a>
      <section className="auth-card ui-card" aria-labelledby="sign-up-title">
        <p className="eyebrow">Join BinZ</p>
        <h1 id="sign-up-title">Create your account</h1>
        <p className="auth-intro">Start managing your pickups, rewards, and recycling impact.</p>
        <form className="stacked-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <fieldset className="ui-pending-fields" disabled={isSubmitting}>
          <FormField label="Name" autoComplete="name" id="signUpName" type="text" placeholder="Your name" required value={name} onChange={(event) => setName(event.target.value)} />
          <FormField label="Email" autoComplete="email" id="signUpEmail" type="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <FormField label="Password" autoComplete="new-password" id="signUpPassword" type="password" placeholder="Create a password" hint="At least 8 characters, including uppercase, lowercase, a number and a special character." required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          <Button className="button primary full" type="submit" loading={isSubmitting} loadingLabel="Creating account…">
            <UserPlus size={18} /> Sign up
          </Button>
          </fieldset>
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </form>
        <p className="auth-switch">
          Already have an account? <a href="#signin">Sign in</a>
        </p>
      </section>
    </main>
  );
}
