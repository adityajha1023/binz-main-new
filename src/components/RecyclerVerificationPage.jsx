import { Button, FormMessage, Input, Textarea, FormField } from './ui';
import React, { useState } from 'react';
import { useSubmission } from '../hooks/useSubmission';
import { fileError } from '../services/fileValidation';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ExternalLink,
  Factory,
  FileCheck2,
  FilePenLine,
  Link as LinkIcon,
  Mail,
  MapPinned,
  Phone,
  Send,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';

const recyclerCategories = [
  'CRT',
  'LCD',
  'PCB',
  'Cables',
  'Batteries',
  'Motors',
  'Plastic',
  'Other E-Waste',
];

const initialFormData = {
  registrationNumber: '',
  registrationStatus: '',
  registrationValidity: '',
  recyclerType: '',
  recyclerName: '',
  companyName: '',
  ownerName: '',
  businessType: '',
  yearEstablished: '',
  officeAddress: '',
  facilityAddress: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  recyclingMethods: '',
  pickupAvailable: '',
  facilityCapacity: '',
  serviceArea: '',
};

function DetailItem({ label, value = '--' }) {
  return (
    <div className="verification-detail-item">
      <dt>{label}</dt>
      <dd>{value || '--'}</dd>
    </div>
  );
}

function RequiredLabel({ children, required = false }) {
  return (
    <span>
      {children}
      {required && <span className="required-marker" aria-label="required"> *</span>}
    </span>
  );
}

function RegistrationField({ label, name, value, onChange, placeholder, type = 'text', wide = false, required = false, ...props }) {
  return (
    <FormField
      {...props}
      className={wide ? 'registration-field registration-wide' : 'registration-field'}
      label={label}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  );
}

function CertificateUploadCard({ certificateFile, onCertificateChange, error, pending, onInvalid }) {
  return (
    <aside className="verification-trust-card certificate-upload-card ui-card ui-card--brand" aria-label="Recycler certificate upload">
      <span className="certificate-upload-icon"><FileCheck2 size={30} aria-hidden="true" /></span>
      <div className="certificate-upload-copy">
        <p className="eyebrow">Certificate Upload</p>
        <h2>
          <span>Upload CPCB</span>
          <span>certificate</span>
          <span className="required-marker" aria-label="required"> *</span>
        </h2>
        <p>Upload your CPCB registration certificate so BinZ can review your assured partner application.</p>
      </div>

      <label className="certificate-upload-zone">
        <UploadCloud size={24} aria-hidden="true" />
        <span>{certificateFile ? certificateFile.name : 'Click to upload certificate'}</span>
        <small>PDF, JPG, PNG or WEBP; maximum 10 MB</small>
        <Input
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          onChange={onCertificateChange}
          id="recyclerCertificate"
          form="recyclerRegistrationForm"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'recyclerCertificateError' : undefined}
          disabled={pending}
          onInvalid={onInvalid}
          required
        />
      </label>
      {error && <FormMessage id="recyclerCertificateError" tone="error">{error}</FormMessage>}
    </aside>
  );
}

function RecyclerRegistrationForm({
  formData,
  selectedMaterials,
  onFieldChange,
  onMaterialToggle,
  onSubmit,
  status,
  pending,
  statusTone,
  materialError,
  completed,
}) {
  return (
    <form id="recyclerRegistrationForm" className="recycler-search-card recycler-registration-form ui-card" onSubmit={onSubmit} aria-busy={pending}>
      <fieldset className="ui-pending-fields" disabled={pending}>
      <div className="verification-card-heading">
        <span><FilePenLine size={22} aria-hidden="true" /></span>
        <div>
          <h2>Recycler Partner Registration</h2>
          <p>Register your recycling company with BinZ for assured partner verification.</p>
        </div>
      </div>

      <div className="registration-form-section">
        <h3>Registration Details</h3>
        <div className="registration-form-grid">
          <RegistrationField
            label="CPCB Registration Number"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={onFieldChange}
            placeholder="CPCB-XXXXXXXX"
            required
          />
          <RegistrationField
            label="Registration Status"
            name="registrationStatus"
            value={formData.registrationStatus}
            onChange={onFieldChange}
            placeholder="Enter status"
            required
          />
          <RegistrationField
            label="Registration Validity"
            name="registrationValidity"
            value={formData.registrationValidity}
            onChange={onFieldChange}
            placeholder="Enter validity"
            required
          />
          <RegistrationField
            label="Recycler Type"
            name="recyclerType"
            value={formData.recyclerType}
            onChange={onFieldChange}
            placeholder="Enter recycler type"
            required
          />
        </div>
      </div>

      <div className="registration-form-section">
        <h3>Company Information</h3>
        <div className="registration-form-grid">
          <RegistrationField
            label="Recycler Name"
            name="recyclerName"
            value={formData.recyclerName}
            onChange={onFieldChange}
            placeholder="Enter recycler name"
            required
          />
          <RegistrationField
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={onFieldChange}
            placeholder="Enter company name"
            required
          />
          <RegistrationField
            label="Owner / Authorized Person"
            name="ownerName"
            value={formData.ownerName}
            onChange={onFieldChange}
            placeholder="Enter authorized person"
            required
          />
          <RegistrationField
            label="Business Type"
            name="businessType"
            value={formData.businessType}
            onChange={onFieldChange}
            placeholder="Enter business type"
          />
          <RegistrationField
            label="Year Established"
            name="yearEstablished"
            value={formData.yearEstablished}
            onChange={onFieldChange}
            placeholder="Enter year"
          />
        </div>
      </div>

      <div className="registration-form-section">
        <h3>Office & Facility Location</h3>
        <div className="registration-form-grid">
          <RegistrationField
            label="Registered Office"
            name="officeAddress"
            value={formData.officeAddress}
            onChange={onFieldChange}
            placeholder="Enter registered office address"
            wide
            required
          />
          <RegistrationField
            label="Recycling Facility Address"
            name="facilityAddress"
            value={formData.facilityAddress}
            onChange={onFieldChange}
            placeholder="Enter facility address"
            wide
            required
          />
          <RegistrationField label="City" name="city" value={formData.city} onChange={onFieldChange} placeholder="Enter city" required />
          <RegistrationField label="State" name="state" value={formData.state} onChange={onFieldChange} placeholder="Enter state" required />
          <RegistrationField label="PIN Code" name="pincode" inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} hint="Enter a six-digit PIN code." value={formData.pincode} onChange={onFieldChange} placeholder="Enter PIN code" required />
        </div>
      </div>

      <div className="registration-form-section">
        <h3>Contact Information</h3>
        <div className="registration-form-grid">
          <RegistrationField label="Phone" name="phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} hint="10-digit Indian mobile number." value={formData.phone} onChange={onFieldChange} placeholder="Enter phone" required />
          <RegistrationField label="Email" name="email" value={formData.email} onChange={onFieldChange} placeholder="Enter email" type="email" required />
          <RegistrationField label="Website" name="website" type="url" hint="Include https:// if provided." value={formData.website} onChange={onFieldChange} placeholder="https://example.com" />
        </div>
      </div>

      <div className="registration-form-section">
        <h3>
          Recycling Operations
          <span className="required-marker" aria-label="required"> *</span>
        </h3>
        <div id="recyclerMaterials" className="registration-material-grid" role="group" aria-label="Material categories accepted" aria-describedby="recyclerMaterialHelp" aria-invalid={Boolean(materialError)}>
          {recyclerCategories.map((category) => (
            <label key={category}>
              <Input
                type="checkbox"
                checked={selectedMaterials.includes(category)}
                onChange={() => onMaterialToggle(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
        <small id="recyclerMaterialHelp" className={materialError ? 'ui-field-error' : 'ui-field-hint'}>{materialError || 'Select at least one accepted material.'}</small>

        <label className="registration-field registration-wide">
          <RequiredLabel required>Processing / Recycling Methods</RequiredLabel>
          <Textarea
            name="recyclingMethods"
            value={formData.recyclingMethods}
            onChange={onFieldChange}
            placeholder="Enter methods, separated by commas"
            required
          />
        </label>

        <div className="registration-form-grid">
          <RegistrationField
            label="Collection / Pickup Available"
            name="pickupAvailable"
            value={formData.pickupAvailable}
            onChange={onFieldChange}
            placeholder="Yes / No / On request"
          />
          <RegistrationField
            label="Facility Capacity"
            name="facilityCapacity"
            value={formData.facilityCapacity}
            onChange={onFieldChange}
            placeholder="Enter capacity"
          />
          <RegistrationField
            label="Service Area"
            name="serviceArea"
            value={formData.serviceArea}
            onChange={onFieldChange}
            placeholder="Enter service area"
          />
        </div>
      </div>

      <Button className="button primary full" type="submit" disabled={completed} loading={pending} loadingLabel="Preparing registration…">
        <Send size={18} aria-hidden="true" /> Submit Registration
      </Button>

      </fieldset>
      <FormMessage tone={statusTone}>{status}</FormMessage>
    </form>
  );
}

function RecyclerIdentityCard({ recycler }) {
  return (
    <section className="verification-card identity-card ui-card" aria-labelledby="recycler-identity-title">
      <div className="identity-card-top">
        <div>
          <p className="eyebrow">Assured Partner Review</p>
          <h2 id="recycler-identity-title">{recycler?.recyclerName || '--'}</h2>
        </div>
        <span className="verification-badge">
          <BadgeCheck size={16} aria-hidden="true" />
          {recycler?.submitted ? 'Received for BinZ review' : recycler ? 'Preview — not submitted' : 'Application status'}
        </span>
      </div>

      <div className="registered-status-panel">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <strong>CPCB Registration + BinZ Verification</strong>
          <span>Registration details and partner approval status will be reviewed by BinZ after backend submission.</span>
        </div>
      </div>

      <dl className="verification-detail-grid">
        <DetailItem label="CPCB Registration No.:" value={recycler?.registrationNumber} />
        <DetailItem label="Registration Status:" value={recycler?.registrationStatus} />
        <DetailItem label="Registration Validity:" value={recycler?.registrationValidity} />
        <DetailItem label="Recycler Type:" value={recycler?.recyclerType} />
        <DetailItem label="Certificate Uploaded:" value={recycler?.certificateName} />
      </dl>
    </section>
  );
}

function CompanyInformationCard({ recycler }) {
  return (
    <section className="verification-card ui-card" aria-labelledby="company-info-title">
      <div className="verification-section-heading">
        <Building2 size={21} aria-hidden="true" />
        <h2 id="company-info-title">Company Information</h2>
      </div>
      <dl className="verification-detail-grid two-column">
        <DetailItem label="Company Name:" value={recycler?.companyName} />
        <DetailItem label="Owner / Authorized Person:" value={recycler?.ownerName} />
        <DetailItem label="Business Type:" value={recycler?.businessType} />
        <DetailItem label="Year Established:" value={recycler?.yearEstablished} />
      </dl>
    </section>
  );
}

function RecyclerLocationCard({ recycler }) {
  return (
    <section className="verification-card ui-card" aria-labelledby="facility-info-title">
      <div className="verification-section-heading">
        <MapPinned size={21} aria-hidden="true" />
        <h2 id="facility-info-title">Office & Facility</h2>
      </div>
      <dl className="verification-detail-grid two-column">
        <DetailItem label="Registered Office:" value={recycler?.officeAddress} />
        <DetailItem label="Recycling Facility Address:" value={recycler?.facilityAddress} />
        <DetailItem label="City:" value={recycler?.city} />
        <DetailItem label="State:" value={recycler?.state} />
        <DetailItem label="PIN Code:" value={recycler?.pincode} />
      </dl>
      <Button className="button secondary compact-button" type="button" disabled aria-describedby="recycler-map-help">
        <ExternalLink size={16} aria-hidden="true" /> View on Map
      </Button>
      <p id="recycler-map-help" className="ui-unavailable-note">Map viewing is not available yet.</p>
    </section>
  );
}

function RecyclerContactCard({ recycler }) {
  return (
    <section className="verification-card ui-card" aria-labelledby="contact-info-title">
      <div className="verification-section-heading">
        <Phone size={21} aria-hidden="true" />
        <h2 id="contact-info-title">Contact Information</h2>
      </div>
      <div className="contact-link-grid">
        <span><Phone size={16} aria-hidden="true" /><strong>Phone:</strong> {recycler?.phone || '--'}</span>
        <span><Mail size={16} aria-hidden="true" /><strong>Email:</strong> {recycler?.email || '--'}</span>
        <span><LinkIcon size={16} aria-hidden="true" /><strong>Website:</strong> {recycler?.website || '--'}</span>
      </div>
    </section>
  );
}

function RecyclerOperationsCard({ recycler }) {
  const materials = Array.isArray(recycler?.materialsAccepted) ? recycler.materialsAccepted : [];
  const methods = Array.isArray(recycler?.recyclingMethods) ? recycler.recyclingMethods : [];

  return (
    <section className="verification-card operations-card ui-card" aria-labelledby="operations-info-title">
      <div className="verification-section-heading">
        <Factory size={21} aria-hidden="true" />
        <h2 id="operations-info-title">How They Recycle</h2>
      </div>

      <div className="operations-block">
        <h3>Materials Accepted:</h3>
        <div className="placeholder-lines" aria-label="Materials accepted">
          {(materials.length ? materials : ['--', '--', '--']).map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <div className="operations-block">
        <h3>Processing / Recycling Methods:</h3>
        <div className="placeholder-lines" aria-label="Recycling methods">
          {(methods.length ? methods : ['--', '--']).map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <dl className="verification-detail-grid three-column">
        <DetailItem label="Collection / Pickup Available:" value={recycler?.pickupAvailable} />
        <DetailItem label="Facility Capacity:" value={recycler?.facilityCapacity} />
        <DetailItem label="Service Area:" value={recycler?.serviceArea} />
      </dl>

      <div className="verification-category-panel">
        <h3>Material Categories</h3>
        <div className="verification-category-chips">
          {recyclerCategories.map((category) => (
            <span className={materials.includes(category) ? 'selected' : ''} key={category}>{category}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function BinZConnectionCard({ recycler }) {
  return (
    <section className="verification-card binz-connection-card ui-card ui-card--brand" aria-labelledby="binz-connection-title">
      <div>
        <p className="eyebrow">BinZ Assured Partner</p>
        <h2 id="binz-connection-title">Partner Registration Review</h2>
        <p>
          Recyclers can register with BinZ to become verified assured partners. Once approved, customers can view the
          recycler location, company details, accepted materials, and recycling operations before material is routed.
        </p>
      </div>
      <dl className="verification-detail-grid three-column">
        <DetailItem label="BinZ Partner Status:" value={recycler?.submitted ? 'Received for review; verification pending' : recycler ? 'Preview only; not submitted' : '--'} />
        <DetailItem label="Pickup / Transfer Available:" value={recycler?.pickupAvailable} />
        <DetailItem label="Materials BinZ Can Route Here:" value={recycler?.materialsAccepted?.join(', ')} />
      </dl>
    </section>
  );
}

function RecyclerProfileCard({ recycler }) {
  return (
    <section className="verification-results" aria-label="Recycler registration review preview">
      <RecyclerIdentityCard recycler={recycler} />
      <div className="verification-two-column">
        <CompanyInformationCard recycler={recycler} />
        <RecyclerContactCard recycler={recycler} />
      </div>
      <RecyclerLocationCard recycler={recycler} />
      <RecyclerOperationsCard recycler={recycler} />
      <BinZConnectionCard recycler={recycler} />
    </section>
  );
}

export default function RecyclerVerificationPage({ registerRecycler }) {
  const [formData, setFormData] = useState(initialFormData);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [certificateFile, setCertificateFile] = useState(null);
  const { pending, feedback, run, clear, setFeedback } = useSubmission();
  const [certificateError, setCertificateError] = useState('');
  const [materialError, setMaterialError] = useState('');
  const [submittedRecycler, setSubmittedRecycler] = useState(null);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    clear();
    setSubmittedRecycler(null);
  }

  function handleCertificateChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const error = fileError(file, { types: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'], maxMB: 10, label: 'a certificate' });
    setCertificateError(error);
    setCertificateFile(error ? null : file);
    if (error) event.target.value = '';
    clear();
    setSubmittedRecycler(null);
  }

  function handleMaterialToggle(category) {
    setSelectedMaterials((current) => (
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    ));
    clear();
    setMaterialError('');
    setSubmittedRecycler(null);
  }

  function handleRecyclerRegistration(event) {
    event.preventDefault();
    if (pending || submittedRecycler) return;

    if (!certificateFile) {
      setCertificateError('Please upload the CPCB certificate before submitting.');
      document.getElementById('recyclerCertificate')?.focus();
      return;
    }

    if (!selectedMaterials.length) {
      setMaterialError('Please select at least one accepted material category.');
      setFeedback({ tone: 'error', message: 'Choose at least one accepted material before continuing.' });
      document.querySelector('#recyclerMaterials input')?.focus();
      return;
    }

    const details = {
      ...formData,
      certificateName: certificateFile?.name || '',
      materialsAccepted: selectedMaterials,
      recyclingMethods: formData.recyclingMethods
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };
    run({
      pendingMessage: registerRecycler ? 'Sending registration…' : 'Preparing registration preview…',
      operation: async (signal) => registerRecycler?.({ ...details, certificateFile }, { signal }),
      successTone: registerRecycler ? 'success' : 'info',
      successMessage: registerRecycler ? 'Registration received for review. Partner verification is pending.' : 'Registration preview ready below. Your application has not been submitted; online registration is not available yet.',
      onSuccess: (result) => setSubmittedRecycler({ ...details, submitted: Boolean(registerRecycler), reference: result?.reference }),
    });
  }

  return (
    <main className="recycler-verification-page">
      <a className="auth-back-link" href="#learn">
        <ArrowLeft size={16} /> Back to Know More
      </a>

      <section className="verification-hero" aria-labelledby="verification-title">
        <p className="eyebrow">Recycler Partner Registration</p>
        <h1 id="verification-title">Register as a BinZ Assured Recycler</h1>
        <p>
          Share your CPCB registration, company, facility, contact, and recycling operation details so BinZ can review
          your recycler profile for verification.
        </p>
      </section>

      <section className="verification-search-layout registration-layout" aria-label="Recycler partner registration">
        <RecyclerRegistrationForm
          formData={formData}
          selectedMaterials={selectedMaterials}
          onFieldChange={handleFieldChange}
          onMaterialToggle={handleMaterialToggle}
          onSubmit={handleRecyclerRegistration}
          status={feedback.message}
          statusTone={feedback.tone}
          pending={pending}
          materialError={materialError}
          completed={Boolean(submittedRecycler)}
        />
        <CertificateUploadCard
          certificateFile={certificateFile}
          onCertificateChange={handleCertificateChange}
          pending={pending}
          error={certificateError}
          onInvalid={(event) => setCertificateError(event.currentTarget.validationMessage)}
        />
      </section>

      <RecyclerProfileCard recycler={submittedRecycler} />

      <section className="transparency-panel ui-card" aria-labelledby="transparency-title">
        <span><ShieldCheck size={22} aria-hidden="true" /></span>
        <div>
          <h2 id="transparency-title">Why This Matters</h2>
          <p>
            BinZ verifies recycler partners so customers can understand which company may receive their recyclable
            material, where it may be processed, and what type of recycling work the facility performs.
          </p>
        </div>
      </section>
    </main>
  );
}
