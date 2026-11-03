import { Button, FormMessage, Input, FormField } from './ui';
import React, { useEffect, useRef, useState } from 'react';
import { Video, Sparkles, Database, UploadCloud, Coins } from 'lucide-react';
import { useSubmission } from '../hooks/useSubmission';
import { fileError } from '../services/fileValidation';

export default function EarnSection({ coins, updateCoins, verifyCleanup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fileLabel, setFileLabel] = useState('Choose cleanup video');
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [completed, setCompleted] = useState(false);
  const { pending: isProcessing, feedback, run, clear } = useSubmission();
  const processingTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(processingTimer.current), []);

  function handleSubmit(e) {
    e.preventDefault();
    if (completed) return;
    const error = fileError(file, { types: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/mpeg'], maxMB: 50, label: 'a cleanup video' });
    if (error) { setUploadError(error); return; }
    run({
      pendingMessage: verifyCleanup ? 'Uploading cleanup proof…' : 'Running demo video check…',
      operation: (signal) => {
        if (verifyCleanup) return verifyCleanup({ name: name.trim(), email: email.trim(), file }, { signal });
        return new Promise((resolve, reject) => {
          const cancel = () => { window.clearTimeout(processingTimer.current); reject(new DOMException('Cancelled', 'AbortError')); };
          signal.addEventListener('abort', cancel, { once: true });
          processingTimer.current = window.setTimeout(() => { signal.removeEventListener('abort', cancel); resolve({ reward: Math.floor(Math.random() * 6) + 5 }); }, 1500);
        });
      },
      successTone: verifyCleanup ? 'success' : 'info',
      successMessage: (result) => verifyCleanup ? `Cleanup proof received.${typeof result?.reward === 'number' ? ` Reward confirmed: ${result.reward} Z-Coins.` : ' Reward verification is pending.'}` : `Demo check complete: ${result.reward} demo Z-Coins. No video was uploaded or verified.`,
      onSuccess: (result) => {
        setCompleted(true);
        if (!verifyCleanup) updateCoins(coins + result.reward, { persist: false });
        else if (typeof result?.coins === 'number') updateCoins(result.coins, { persist: false });
      },
    });
  }

  function handleFileChange(e) {
    const nextFile = e.target.files[0];
    if (!nextFile) return;
    const error = fileError(nextFile, { types: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/mpeg'], maxMB: 50, label: 'a cleanup video' });
    setUploadError(error);
    setFile(error ? null : nextFile);
    setFileLabel(error ? 'Choose cleanup video' : nextFile.name);
    if (error) e.target.value = '';
    setCompleted(false);
    clear();
  }

  return (
    <section id="earn" className="promo-panel">
      <div>
        <p className="eyebrow">Good for your wallet. Good for the planet.</p>
        <h2>Upload cleanup proof and earn Z-Coins</h2>
        <p>
          For the prototype, video verification is simulated in the browser. In the full stack,
          this connects to the detector and reward API described in the README.
        </p>
        <div className="mini-points">
          <span><Video size={19} /> Video proof</span>
          <span><Sparkles size={19} /> Instant reward state</span>
          <span><Database size={19} /> API-ready flow</span>
        </div>
      </div>
      <form id="uploadForm" className="upload-card ui-card" onSubmit={handleSubmit} aria-busy={isProcessing} onChange={() => { if (!isProcessing) { setCompleted(false); clear(); } }}>
        <fieldset className="ui-pending-fields" disabled={isProcessing}>
        <FormField label="Your name" id="cleanupName" autoComplete="name"
          name="name"
          type="text"
          placeholder="Your name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField label="Email for reward" id="cleanupEmail" autoComplete="email"
          name="email"
          type="email"
          placeholder="Email for reward"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="file-drop" htmlFor="videoInput">
          <UploadCloud size={30} />
          <span id="fileLabel">{fileLabel}</span>
          <Input
            id="videoInput"
            name="video"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/ogg,video/mpeg"
            aria-invalid={Boolean(uploadError)}
            aria-describedby="videoHelp videoError"
            onInvalid={(event) => setUploadError(event.currentTarget.validationMessage)}
            required
            onChange={handleFileChange}
          />
        </label>
        <small id="videoHelp" className="ui-field-hint">MP4, WEBM, MOV, OGG or MPEG; maximum 50 MB.</small>
        <small id="videoError" className="ui-field-error" role={uploadError ? 'alert' : undefined}>{uploadError}</small>
        <Button className="button primary full" type="submit" disabled={completed} loading={isProcessing} loadingLabel="Processing proof…">
          <Coins size={18} /> Upload video
        </Button>
        </fieldset>
        <FormMessage id="uploadStatus" tone={feedback.tone}>
          {feedback.message}
        </FormMessage>
      </form>
    </section>
  );
}
