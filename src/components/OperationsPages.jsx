import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Check,
  ClipboardCheck,
  FileText,
  FileWarning,
  Filter,
  Leaf,
  MoreHorizontal,
  PackageCheck,
  RefreshCw,
  Truck,
  UploadCloud,
  Users,
} from 'lucide-react';
import { Button, FormField, FormMessage, Input, Select, Textarea } from './ui';
import { requestJson } from '../services/requestJson';

const initialApplications = [
  { id: 'APP-1042', name: 'GreenLoop Recycling', city: 'Greater Noida', materials: 'PCB, batteries, cables', submitted: 'Today, 09:14', status: 'Pending review' },
  { id: 'APP-1041', name: 'EcoCircuit Works', city: 'Noida', materials: 'Laptops, mobile phones', submitted: 'Yesterday, 16:40', status: 'Pending review' },
  { id: 'APP-1038', name: 'Reclaim Metals', city: 'Ghaziabad', materials: 'Motors, metal, plastic', submitted: 'Oct 31, 11:20', status: 'Needs documents' },
];

const initialAssignments = [
  { id: 'BZ-4821', material: 'Mixed electronics', customer: 'Aarav Sharma', area: 'Sector 137, Noida', date: 'Nov 04, 10:00–12:00', recycler: 'EcoCircuit Works', status: 'Awaiting pickup' },
  { id: 'BZ-4817', material: 'Laptop + accessories', customer: 'Meera Joshi', area: 'Knowledge Park II', date: 'Nov 04, 14:00–16:00', recycler: 'GreenLoop Recycling', status: 'Assigned' },
  { id: 'BZ-4809', material: 'Batteries', customer: 'Rohan Verma', area: 'Alpha 1, Greater Noida', date: 'Nov 03, 12:00–14:00', recycler: 'Reclaim Metals', status: 'Evidence submitted' },
];

const progressSteps = ['Assigned', 'Accepted', 'En route', 'Collected', 'At facility', 'Processed'];

function StatusPill({ children, tone = 'default' }) {
  return <span className={`ops-status ops-status--${tone}`}>{children}</span>;
}

function OperationsHeader({ eyebrow, title, description, icon: Icon }) {
  return (
    <header className="ops-page-header">
      <div className="ops-heading-icon"><Icon size={28} aria-hidden="true" /></div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  );
}

function Metric({ label, value, detail, icon: Icon }) {
  return <article className="ops-metric ui-card"><span className="ops-metric-icon"><Icon size={20} aria-hidden="true" /></span><strong>{value}</strong><span>{label}</span>{detail && <small>{detail}</small>}</article>;
}

export function OperatorPage() {
  const [applications, setApplications] = useState(initialApplications);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [cleanupReviews, setCleanupReviews] = useState([]);
  const [cleanupReasons, setCleanupReasons] = useState({});
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');
  const filteredApplications = applications.filter((application) => filter === 'All' || application.status === filter);

  useEffect(() => {
    requestJson('/cleanup-verifications', { credentials: 'include' })
      .then((result) => setCleanupReviews(Array.isArray(result.verifications) ? result.verifications : []))
      .catch(() => setCleanupReviews([]));
  }, []);

  function updateApplication(id, status) {
    setApplications((current) => current.map((application) => application.id === id ? { ...application, status } : application));
    setMessage(status === 'Approved' ? 'Application approved and added to the recycler directory.' : 'Application marked for follow-up. The applicant will need to provide more documents.');
  }

  function updateAssignment(id, field, value) {
    setAssignments((current) => current.map((assignment) => assignment.id === id ? { ...assignment, [field]: value } : assignment));
    setMessage(`Assignment ${id} updated.`);
  }

  async function reviewCleanup(verificationId, status) {
    const rejectionReason = cleanupReasons[verificationId]?.trim();
    if (status === 'rejected' && !rejectionReason) {
      setMessage('Add a rejection reason before rejecting a cleanup video.');
      return;
    }
    try {
      const result = await requestJson(`/cleanup-verifications/${verificationId}/review`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(status === 'rejected' ? { rejectionReason } : {}) }),
      });
      setCleanupReviews((current) => current.map((item) => item.verificationId === verificationId ? result.verification : item));
      setMessage(`Cleanup verification ${verificationId} marked ${status}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="operations-page">
      <OperationsHeader eyebrow="Operator console · Demo workspace" title="Keep every collection moving." description="Review recycler applications, assign verified partners, and monitor the evidence trail from one place." icon={ClipboardCheck} />
      <div className="ops-metrics">
        <Metric label="Applications to review" value={applications.filter((item) => item.status === 'Pending review').length} detail="Needs your attention" icon={Users} />
        <Metric label="Open assignments" value={assignments.filter((item) => item.status !== 'Evidence submitted').length} detail="Across Greater Noida" icon={Truck} />
        <Metric label="Evidence submitted" value={assignments.filter((item) => item.status === 'Evidence submitted').length} detail="Ready for verification" icon={BadgeCheck} />
      </div>
      <FormMessage tone={message && !message.includes('required') ? 'success' : 'info'}>{message || 'Cleanup verification records come from the authenticated backend. Pickup cards remain demonstration data until dispatch APIs are connected.'}</FormMessage>

      <section className="ops-section" aria-labelledby="cleanup-review-title">
        <div className="ops-section-heading"><div><p className="eyebrow">Video verification</p><h2 id="cleanup-review-title">Cleanup proof queue</h2></div><StatusPill tone="info">{cleanupReviews.filter((item) => item.status === 'pending').length} pending</StatusPill></div>
        {!cleanupReviews.length ? <p className="ops-muted">No cleanup submissions are available for this signed-in operator.</p> : <div className="ops-assignment-grid">{cleanupReviews.map((verification) => <article className="ops-assignment-card ui-card" key={verification.verificationId}><div className="ops-card-top"><div><span className="eyebrow">{verification.verificationId}</span><h3>{verification.originalFilename}</h3></div><StatusPill tone={verification.status === 'approved' ? 'success' : verification.status === 'rejected' ? 'warning' : 'info'}>{verification.status}</StatusPill></div><p className="ops-muted">{new Date(verification.submittedAt).toLocaleString()} · {Math.round(verification.sizeBytes / 1024)} KB</p>{verification.status === 'pending' ? <><FormField label="Rejection reason" value={cleanupReasons[verification.verificationId] || ''} placeholder="Required only when rejecting" onChange={(event) => setCleanupReasons((current) => ({ ...current, [verification.verificationId]: event.target.value }))} /><div className="ops-actions"><Button size="compact" onClick={() => reviewCleanup(verification.verificationId, 'approved')}><Check size={16} /> Approve</Button><Button size="compact" variant="secondary" onClick={() => reviewCleanup(verification.verificationId, 'rejected')}><FileWarning size={16} /> Reject</Button></div></> : <p className="ops-muted">{verification.status === 'approved' ? `${verification.reward} Z-Coins confirmed and credited.` : verification.rejectionReason}</p>}</article>)}</div>}
      </section>

      <section className="ops-section" aria-labelledby="applications-title">
        <div className="ops-section-heading"><div><p className="eyebrow">Partner onboarding</p><h2 id="applications-title">Recycler applications</h2></div><FormField className="ops-filter" label="Show" as={Select} value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Pending review</option><option>Needs documents</option><option>Approved</option></FormField></div>
        <div className="ops-table-wrap">
          <table className="ops-table"><caption className="sr-only">Recycler applications awaiting operator review</caption><thead><tr><th>Applicant</th><th>Coverage</th><th>Submitted</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
            {filteredApplications.map((application) => <tr key={application.id}><td><strong>{application.name}</strong><span>{application.id} · {application.city}</span></td><td>{application.materials}</td><td>{application.submitted}</td><td><StatusPill tone={application.status === 'Approved' ? 'success' : application.status === 'Needs documents' ? 'warning' : 'info'}>{application.status}</StatusPill></td><td><div className="ops-actions">{application.status === 'Pending review' ? <><Button size="compact" onClick={() => updateApplication(application.id, 'Approved')}><Check size={16} /> Approve</Button><Button size="compact" variant="secondary" onClick={() => updateApplication(application.id, 'Needs documents')}><FileText size={16} /> Request docs</Button></> : <Button size="compact" variant="secondary" onClick={() => updateApplication(application.id, application.status === 'Approved' ? 'Pending review' : 'Approved')}><RefreshCw size={16} /> {application.status === 'Approved' ? 'Reopen' : 'Review again'}</Button>}</div></td></tr>)}
          </tbody></table>
        </div>
      </section>

      <section className="ops-section" aria-labelledby="assignments-title">
        <div className="ops-section-heading"><div><p className="eyebrow">Daily dispatch</p><h2 id="assignments-title">Pickup assignments</h2></div><Button variant="secondary" size="compact" onClick={() => setMessage('New pickup intake is ready to connect to the customer booking queue.')}><Filter size={16} /> Filter queue</Button></div>
        <div className="ops-assignment-grid">{assignments.map((assignment) => <article className="ops-assignment-card ui-card" key={assignment.id}><div className="ops-card-top"><div><span className="eyebrow">{assignment.id}</span><h3>{assignment.material}</h3></div><StatusPill tone={assignment.status === 'Evidence submitted' ? 'success' : 'info'}>{assignment.status}</StatusPill></div><dl className="ops-details"><div><dt>Customer</dt><dd>{assignment.customer}</dd></div><div><dt>Area</dt><dd>{assignment.area}</dd></div><div><dt>Window</dt><dd>{assignment.date}</dd></div></dl><FormField label="Assigned recycler" as={Select} value={assignment.recycler} onChange={(event) => updateAssignment(assignment.id, 'recycler', event.target.value)}><option>EcoCircuit Works</option><option>GreenLoop Recycling</option><option>Reclaim Metals</option></FormField><FormField label="Progress" as={Select} value={assignment.status} onChange={(event) => updateAssignment(assignment.id, 'status', event.target.value)}><option>Awaiting pickup</option><option>Assigned</option><option>Accepted</option><option>En route</option><option>Collected</option><option>At facility</option><option>Evidence submitted</option></FormField></article>)}</div>
      </section>
    </main>
  );
}

const initialRecyclerAssignments = [
  { id: 'BZ-4817', customer: 'Meera Joshi', area: 'Knowledge Park II', window: 'Today · 14:00–16:00', material: 'Laptop + accessories', status: 'Assigned', note: '' },
  { id: 'BZ-4802', customer: 'Kabir Singh', area: 'Sector 62, Noida', window: 'Tomorrow · 09:00–11:00', material: 'Mixed electronics', status: 'Assigned', note: '' },
];

export function RecyclerPage() {
  const [assignments, setAssignments] = useState(initialRecyclerAssignments);
  const [selectedId, setSelectedId] = useState(initialRecyclerAssignments[0].id);
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState('');
  const selected = assignments.find((assignment) => assignment.id === selectedId) || assignments[0];
  const completed = useMemo(() => assignments.filter((assignment) => assignment.status === 'Evidence submitted').length, [assignments]);

  function updateStatus(status) {
    setAssignments((current) => current.map((assignment) => assignment.id === selectedId ? { ...assignment, status } : assignment));
    setMessage(`${selectedId} is now marked “${status}”.`);
  }

  function submitEvidence(event) {
    event.preventDefault();
    if (!files[selectedId]) {
      setMessage('Choose a photo or document before submitting evidence.');
      return;
    }
    setAssignments((current) => current.map((assignment) => assignment.id === selectedId ? { ...assignment, status: 'Evidence submitted' } : assignment));
    setMessage(`Evidence uploaded for ${selectedId}. The operator can now verify the completion record.`);
  }

  return (
    <main className="operations-page recycler-workspace">
      <OperationsHeader eyebrow="Recycler workspace · Demo workspace" title="Your next pickup, clearly in view." description="Accept work, keep the customer updated, and attach proof of responsible handling when the job is complete." icon={PackageCheck} />
      <div className="ops-metrics"><Metric label="Assigned pickups" value={assignments.length - completed} detail="Ready for action" icon={Truck} /><Metric label="Completed this week" value={completed} detail="Evidence uploaded" icon={BadgeCheck} /><Metric label="Impact tracked" value="86 kg" detail="Material diverted" icon={Leaf} /></div>
      <FormMessage tone={message.includes('Choose') ? 'error' : message ? 'success' : 'info'}>{message || 'Select a pickup to accept it and update its progress.'}</FormMessage>
      <div className="recycler-workspace-grid">
        <section className="ops-section ops-queue" aria-labelledby="queue-title"><div className="ops-section-heading"><div><p className="eyebrow">My queue</p><h2 id="queue-title">Assigned pickups</h2></div><span className="ops-count">{assignments.length} jobs</span></div><div className="ops-queue-list">{assignments.map((assignment) => <button type="button" className={`ops-queue-item ${assignment.id === selectedId ? 'selected' : ''}`} key={assignment.id} onClick={() => setSelectedId(assignment.id)}><span className="ops-queue-item-icon"><Truck size={20} /></span><span><strong>{assignment.material}</strong><small>{assignment.id} · {assignment.window}</small></span><StatusPill tone={assignment.status === 'Evidence submitted' ? 'success' : 'info'}>{assignment.status}</StatusPill></button>)}</div></section>
        <section className="ops-detail-panel ui-card" aria-labelledby="pickup-title"><div className="ops-card-top"><div><p className="eyebrow">{selected.id}</p><h2 id="pickup-title">{selected.material}</h2></div><StatusPill tone={selected.status === 'Evidence submitted' ? 'success' : 'info'}>{selected.status}</StatusPill></div><dl className="ops-details ops-details--large"><div><dt>Customer</dt><dd>{selected.customer}</dd></div><div><dt>Pickup area</dt><dd>{selected.area}</dd></div><div><dt>Time window</dt><dd>{selected.window}</dd></div></dl><div className="ops-progress" aria-label="Pickup progress">{['Assigned', 'Accepted', 'En route', 'Collected', 'At facility'].map((step, index) => <div className={selected.status === 'Evidence submitted' || progressSteps.indexOf(selected.status) >= index ? 'complete' : ''} key={step}><span>{index + 1}</span><small>{step}</small></div>)}</div><div className="ops-detail-actions">{selected.status === 'Assigned' ? <Button onClick={() => updateStatus('Accepted')}><Check size={18} /> Accept assignment</Button> : <Button onClick={() => updateStatus(selected.status === 'Accepted' ? 'En route' : selected.status === 'En route' ? 'Collected' : 'At facility')} disabled={selected.status === 'At facility' || selected.status === 'Evidence submitted'}><Truck size={18} /> Update progress</Button>}<Button variant="secondary" onClick={() => setMessage('Customer notification queued for this demo pickup.')}><MoreHorizontal size={18} /> Notify customer</Button></div><form className="ops-evidence-form" onSubmit={submitEvidence}><div><p className="eyebrow">Completion evidence</p><h3>Upload proof for this pickup</h3><p className="ops-muted">Add a facility receipt, weighing slip, or photo. The file stays local in this demonstration.</p></div><label className="ops-upload-zone"><UploadCloud size={24} aria-hidden="true" /><strong>{files[selected.id]?.name || 'Choose a file'}</strong><span>JPG, PNG or PDF · up to 10 MB</span><Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => setFiles((current) => ({ ...current, [selected.id]: event.target.files?.[0] }))} /></label><FormField label="Evidence note" as={Textarea} placeholder="What was collected or processed?" value={selected.note} onChange={(event) => setAssignments((current) => current.map((assignment) => assignment.id === selectedId ? { ...assignment, note: event.target.value } : assignment))} /><Button type="submit"><UploadCloud size={18} /> Submit evidence</Button></form></section>
      </div>
    </main>
  );
}
