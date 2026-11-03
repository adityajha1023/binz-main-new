import { Button, FormMessage, Input } from './ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BadgeCheck, Clock3, FileWarning, RefreshCw, Sparkles, Trash2, UploadCloud, Video, XCircle } from 'lucide-react';
import { apiUrl } from '../api';
import { fileError } from '../services/fileValidation';
import { requestJson } from '../services/requestJson';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/mpeg'];
const MAX_VIDEO_MB = 50;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
}

function VerificationStatus({ verification }) {
  const config = {
    pending: { icon: Clock3, label: 'Pending verification', tone: 'info' },
    approved: { icon: BadgeCheck, label: 'Approved', tone: 'success' },
    rejected: { icon: XCircle, label: 'Rejected', tone: 'error' },
  }[verification.status] || { icon: FileWarning, label: 'Unknown status', tone: 'error' };
  const Icon = config.icon;
  return <div className={`cleanup-status cleanup-status--${config.tone}`}><Icon size={17} aria-hidden="true" /><strong>{config.label}</strong>{verification.status === 'approved' && <span>{verification.reward} Z-Coins confirmed</span>}{verification.status === 'rejected' && verification.rejectionReason && <span>{verification.rejectionReason}</span>}</div>;
}

function uploadVideo(file, signal, onProgress) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const xhr = new XMLHttpRequest();
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', abort);
      callback(value);
    };
    const abort = () => { xhr.abort(); finish(reject, new DOMException('Cancelled', 'AbortError')); };
    signal.addEventListener('abort', abort, { once: true });
    xhr.open('POST', apiUrl('/uploadVideo'));
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => finish(reject, new Error('Could not connect. Check your connection and try again.'));
    xhr.onload = () => {
      const body = xhr.response || {};
      if (xhr.status < 200 || xhr.status >= 300) {
        finish(reject, new Error(body.message || 'The video could not be uploaded. Please try again.'));
        return;
      }
      finish(resolve, body);
    };
    const data = new FormData();
    data.append('video', file, file.name);
    xhr.send(data);
  });
}

export default function EarnSection({ updateCoins, isSignedIn }) {
  const [file, setFile] = useState(null);
  const [fileErrorMessage, setFileErrorMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [rewardBalance, setRewardBalance] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ tone: 'info', message: '' });
  const inputRef = useRef(null);

  const selectedVerification = useMemo(() => history.find((item) => item.verificationId === selectedId), [history, selectedId]);

  async function loadHistory({ quiet = false } = {}) {
    if (!isSignedIn) {
      setHistory([]);
      setRewardBalance(null);
      return;
    }
    if (quiet) setRefreshing(true); else setLoadingHistory(true);
    try {
      const result = await requestJson('/cleanup-verifications', { credentials: 'include' });
      setHistory(Array.isArray(result.verifications) ? result.verifications : []);
      if (typeof result.rewardBalance === 'number') {
        setRewardBalance(result.rewardBalance);
        updateCoins(result.rewardBalance, { persist: false });
      }
      setFeedback((current) => current.tone === 'error' ? current : { tone: 'info', message: '' });
    } catch (error) {
      setFeedback({ tone: 'error', message: error.message });
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadHistory(); }, [isSignedIn]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function chooseFile(event) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    const error = fileError(nextFile, { types: VIDEO_TYPES, maxMB: MAX_VIDEO_MB, label: 'a cleanup video' });
    setFileErrorMessage(error);
    if (error) {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
      event.target.value = '';
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setFileErrorMessage('');
    setFeedback({ tone: 'info', message: '' });
  }

  function removeFile() {
    setFile(null);
    setFileErrorMessage('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (inputRef.current) inputRef.current.value = '';
  }

  async function submit(event) {
    event.preventDefault();
    if (!isSignedIn) {
      setFeedback({ tone: 'error', message: 'Sign in before uploading cleanup proof.' });
      return;
    }
    const error = fileError(file, { types: VIDEO_TYPES, maxMB: MAX_VIDEO_MB, label: 'a cleanup video' });
    if (error) {
      setFileErrorMessage(error);
      return;
    }
    setUploading(true);
    setProgress(0);
    setFeedback({ tone: 'loading', message: 'Uploading cleanup proof…' });
    try {
      const result = await uploadVideo(file, new AbortController().signal, setProgress);
      const verification = result.verification;
      if (!verification?.verificationId || !verification.status) throw new Error('The server returned an incomplete verification record.');
      setHistory((current) => [verification, ...current.filter((item) => item.verificationId !== verification.verificationId)]);
      setSelectedId(verification.verificationId);
      setFeedback({ tone: 'success', message: `Video uploaded. Verification ID: ${verification.verificationId}` });
      removeFile();
    } catch (error) {
      if (error.name !== 'AbortError') setFeedback({ tone: 'error', message: error.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section id="earn" className="promo-panel cleanup-video-section">
      <div>
        <p className="eyebrow">Good for your wallet. Good for the planet.</p>
        <h2>Upload cleanup proof and earn Z-Coins</h2>
        <p>Upload a real cleanup video. BinZ stores it for verification and only credits rewards after an operator approves the submission.</p>
        <div className="mini-points"><span><Video size={19} /> Video proof</span><span><Sparkles size={19} /> Server verification</span><span><BadgeCheck size={19} /> Confirmed rewards only</span></div>
        {rewardBalance !== null && <p className="cleanup-balance">Confirmed wallet balance: <strong>{rewardBalance} Z-Coins</strong></p>}
      </div>
      <form id="uploadForm" className="upload-card ui-card cleanup-upload-card" onSubmit={submit} aria-busy={uploading}>
        {!isSignedIn && <FormMessage tone="info">Sign in to submit cleanup proof and view your verification history.</FormMessage>}
        <label className={`file-drop${file ? ' has-file' : ''}`} htmlFor="videoInput">
          <UploadCloud size={30} aria-hidden="true" />
          <strong>{file ? file.name : 'Choose cleanup video'}</strong>
          <span>{file ? formatBytes(file.size) : 'Click to upload MP4, WEBM, MOV, OGG or MPEG'}</span>
          <Input ref={inputRef} id="videoInput" name="video" type="file" accept={VIDEO_TYPES.join(',')} onChange={chooseFile} disabled={uploading} aria-invalid={Boolean(fileErrorMessage)} />
        </label>
        {file && <div className="cleanup-file-actions"><span>{file.name} · {formatBytes(file.size)}</span><Button type="button" variant="secondary" size="compact" onClick={removeFile} disabled={uploading}><Trash2 size={16} /> Remove</Button></div>}
        {previewUrl && <video className="cleanup-video-preview" controls preload="metadata" src={previewUrl} aria-label="Selected cleanup video preview" />}
        <small className="ui-field-hint">Maximum {MAX_VIDEO_MB} MB. Your signed-in session identifies the submission.</small>
        {fileErrorMessage && <FormMessage tone="error">{fileErrorMessage}</FormMessage>}
        <Button className="button primary full" type="submit" disabled={!isSignedIn || !file || uploading} loading={uploading} loadingLabel={`Uploading ${progress}%…`}><UploadCloud size={18} /> Upload video</Button>
        <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
      </form>
      <section className="cleanup-history" aria-labelledby="cleanup-history-title">
        <div className="cleanup-history-heading"><div><p className="eyebrow">Verification history</p><h3 id="cleanup-history-title">Your cleanup submissions</h3></div><Button variant="secondary" size="compact" onClick={() => loadHistory({ quiet: true })} disabled={!isSignedIn || loadingHistory || refreshing}><RefreshCw size={16} /> Refresh</Button></div>
        {loadingHistory ? <p className="cleanup-muted">Loading verification history…</p> : !isSignedIn ? <p className="cleanup-muted">Sign in to view previous submissions.</p> : !history.length ? <p className="cleanup-muted">No cleanup videos submitted yet.</p> : <div className="cleanup-history-list">{history.map((verification) => <button type="button" className={`cleanup-history-item${selectedId === verification.verificationId ? ' selected' : ''}`} key={verification.verificationId} onClick={() => setSelectedId(verification.verificationId)}><span><strong>{verification.originalFilename}</strong><small>{verification.verificationId} · {formatDate(verification.submittedAt)}</small></span><VerificationStatus verification={verification} /></button>)}</div>}
        {selectedVerification && <article className="cleanup-detail ui-card"><div className="cleanup-detail-heading"><div><p className="eyebrow">Verification details</p><h4>{selectedVerification.verificationId}</h4></div><VerificationStatus verification={selectedVerification} /></div><p>Submitted {formatDate(selectedVerification.submittedAt)} · {formatBytes(selectedVerification.sizeBytes)}</p></article>}
      </section>
    </section>
  );
}
