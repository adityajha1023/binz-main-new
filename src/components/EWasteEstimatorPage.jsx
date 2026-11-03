import { Button, FormMessage, Input } from './ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSubmission } from '../hooks/useSubmission';
import { fileError } from '../services/fileValidation';
import {
  ArrowRight,
  BatteryCharging,
  Cable,
  CalendarCheck,
  Calculator,
  CircuitBoard,
  Cog,
  ImageUp,
  Laptop,
  Monitor,
  Package,
  RotateCcw,
  UploadCloud,
  Weight,
  X,
} from 'lucide-react';

const categories = [
  { name: 'CRT', Icon: Monitor },
  { name: 'LCD', Icon: Laptop },
  { name: 'PCB', Icon: CircuitBoard },
  { name: 'Cables', Icon: Cable },
  { name: 'Batteries', Icon: BatteryCharging },
  { name: 'Motors', Icon: Cog },
  { name: 'Plastic', Icon: Package },
  { name: 'Others', Icon: Package },
];

function EstimatorResultCard({ result, onSchedulePickup }) {
  if (!result) return null;

  const materials = Array.isArray(result.recoverableMaterials)
    ? result.recoverableMaterials
    : [];

  return (
    <section className="estimator-result-card ui-card" aria-labelledby="estimator-result-title">
      <div className="result-value-block">
        <p className="eyebrow">Estimated Recovery Value</p>
        <h2 id="estimator-result-title">{result.estimatedValue || '₹ --'}</h2>
      </div>

      <dl className="result-detail-grid">
        <div>
          <dt>Category:</dt>
          <dd>{result.category || '--'}</dd>
        </div>
        <div>
          <dt>Approximate Weight:</dt>
          <dd>{result.weight || '--'}</dd>
        </div>
        <div>
          <dt>Estimated Value:</dt>
          <dd>{result.estimatedValue || '--'}</dd>
        </div>
      </dl>

      <div className="materials-panel">
        <h3>Potential Recoverable Materials</h3>
        <div className="material-list" aria-label="Recoverable materials">
          {(materials.length ? materials : ['Material', 'Material', 'Material']).map((material, index) => (
            <span key={`${material}-${index}`}>{material}</span>
          ))}
        </div>
      </div>

      <div className="recovery-potential-card">
        <h3>Recovery Potential</h3>
        <p>{result.recoveryPotential || '--'}</p>
      </div>

      <div className="estimator-next-action">
        <div>
          <h3>Ready to recycle?</h3>
          <p>Recycle responsibly with BinZ and earn Z-Coins.</p>
        </div>
        <Button as="a" className="button primary" href="/#home" onClick={onSchedulePickup}>
          <CalendarCheck size={18} aria-hidden="true" /> Schedule Pickup
        </Button>
      </div>
    </section>
  );
}

export default function EWasteEstimatorPage({ estimateMaterial }) {
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [weight, setWeight] = useState('');
  const { pending, feedback, run, clear } = useSubmission();
  const [uploadError, setUploadError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [prepared, setPrepared] = useState(false);
  const weightRef = useRef(null);
  const [estimateResult, setEstimateResult] = useState(null);

  const canEstimate = Boolean(imageFile && !uploadError && selectedCategory && Number.isFinite(Number(weight)) && Number(weight) >= 0.01 && !weightError);

  const uploadedFileMeta = useMemo(() => {
    if (!imageFile) return '';
    const sizeInMb = imageFile.size / (1024 * 1024);
    return `${imageFile.name} - ${sizeInMb.toFixed(sizeInMb >= 1 ? 1 : 2)} MB`;
  }, [imageFile]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return undefined;
    }

    const nextPreview = URL.createObjectURL(imageFile);
    setImagePreview(nextPreview);

    return () => {
      URL.revokeObjectURL(nextPreview);
    };
  }, [imageFile]);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleImageSelection(file) {
    if (!file || pending) return;
    const error = fileError(file, { types: ['image/png', 'image/jpeg', 'image/webp'], maxMB: 10, label: 'an image' });
    setUploadError(error);
    if (error) return;

    setImageFile(file);
    setEstimateResult(null);
    setPrepared(false);
    clear();
  }

  function handleInputChange(event) {
    handleImageSelection(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleImageSelection(event.dataTransfer.files?.[0]);
  }

  function removeImage() {
    setImageFile(null);
    setEstimateResult(null);
    setUploadError('');
    setPrepared(false);
    clear();
  }

  function handleWeightChange(event) {
    const nextValue = event.target.value;
    setWeight(nextValue);
    setWeightError(event.currentTarget.validity.valid ? '' : 'Enter a weight of at least 0.01 kg, in steps of 0.01.');
    setEstimateResult(null);
    setPrepared(false);
    clear();
  }

  function handleWeightKeyDown(event) {
    if (['-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
    }
  }

  function handleEstimate() {
    if (!canEstimate || prepared || pending) return;
    if (!weightRef.current?.reportValidity()) return;
    run({
      pendingMessage: estimateMaterial ? 'Estimating recovery value…' : 'Checking material details…',
      operation: async (signal) => {
        if (!estimateMaterial) return null;
        const result = await estimateMaterial({ imageFile, category: selectedCategory, weight: Number(weight) }, { signal });
        if (!result?.estimatedValue) throw new Error('An estimate could not be calculated. Please try again; your image and details are still here.');
        return result;
      },
      successTone: estimateMaterial ? 'success' : 'info',
      successMessage: estimateMaterial ? 'Estimate ready. Review the result below; final rates depend on inspection.' : 'Your material details are ready. Value estimates are not available yet; no image has been uploaded.',
      onSuccess: (result) => { setEstimateResult(result); setPrepared(!estimateMaterial); },
    });
  }

  function handleSchedulePickup(event) {
    event.preventDefault();
    window.location.href = '/#home';
  }

  return (
    <main className="ewaste-estimator-page">
      <section className="estimator-hero">
        <p className="eyebrow">BinZ material estimate</p>
        <h1>Material Value Estimator</h1>
        <p>Upload your material details to estimate its potential recycling value.</p>
      </section>

      <div className="estimator-flow" aria-label="Estimator steps">
        {['Upload Image', 'Select Category', 'Enter Approximate Weight', 'Estimate Value', 'Future Result', 'Schedule Pickup'].map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>

      <section className="estimator-layout" aria-label="Material estimator form" aria-busy={pending}>
        <div className="estimator-form-card">
          <fieldset className="ui-pending-fields" disabled={pending}>
          <section className="estimator-step-card ui-card">
            <div className="estimator-step-heading">
              <span><ImageUp size={22} aria-hidden="true" /></span>
              <div>
                <h2>Upload Material Image</h2>
                <p>Upload a clear picture of the item you want to evaluate.</p>
              </div>
            </div>

            <button
              className={`estimator-upload-zone${isDragging ? ' dragging' : ''}${imagePreview ? ' has-preview' : ''}`}
              type="button"
              onClick={openFilePicker}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Uploaded material preview" />
              ) : (
                <span className="upload-empty-state">
                  <UploadCloud size={38} aria-hidden="true" />
                  <strong>Click to upload or drag image here</strong>
                  <small>PNG, JPG or WEBP; maximum 10 MB</small>
                </span>
              )}
            </button>

            <Input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-invalid={Boolean(uploadError)}
              aria-describedby={uploadError ? 'estimateImageError' : undefined}
              onChange={handleInputChange}
            />
            {uploadError && <FormMessage id="estimateImageError" tone="error">{uploadError}</FormMessage>}

            {imageFile && (
              <div className="upload-actions-row">
                <span>{uploadedFileMeta}</span>
                <div>
                  <Button className="button secondary compact-button" type="button" onClick={openFilePicker}>
                    <RotateCcw size={16} aria-hidden="true" /> Replace
                  </Button>
                  <Button className="button secondary compact-button" type="button" onClick={removeImage}>
                    <X size={16} aria-hidden="true" /> Remove
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="estimator-step-card ui-card">
            <div className="estimator-step-heading">
              <span><CircuitBoard size={22} aria-hidden="true" /></span>
              <div>
                <h2>Select Category</h2>
              </div>
            </div>

            <div className="estimator-category-grid" role="radiogroup" aria-label="Material category">
              {categories.map(({ name, Icon }) => (
                <button
                  key={name}
                  className={`estimator-category-card${selectedCategory === name ? ' selected' : ''}`}
                  type="button"
                  role="radio"
                  aria-checked={selectedCategory === name}
                  tabIndex={selectedCategory === name || (!selectedCategory && name === categories[0].name) ? 0 : -1}
                  onKeyDown={(event) => {
                    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
                    if (!direction && !['Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const next = event.key === 'Home' ? 0 : event.key === 'End' ? categories.length - 1 : (categories.findIndex((item) => item.name === name) + direction + categories.length) % categories.length;
                    setSelectedCategory(categories[next].name); setPrepared(false); setEstimateResult(null); clear();
                    event.currentTarget.parentElement.querySelectorAll('[role="radio"]')[next]?.focus();
                  }}
                  onClick={() => {
                    setSelectedCategory(name);
                    setEstimateResult(null);
                    setPrepared(false);
                    clear();
                  }}
                >
                  <Icon size={26} aria-hidden="true" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="estimator-step-card ui-card">
            <div className="estimator-step-heading">
              <span><Weight size={22} aria-hidden="true" /></span>
              <div>
                <h2>Approximate Weight</h2>
                <p>An approximate value is fine if you do not know the exact weight.</p>
              </div>
            </div>

            <label className="weight-input-wrap">
              <span className="sr-only">Approximate weight in kg</span>
              <Input
                ref={weightRef}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                placeholder="Enter approximate weight"
                value={weight}
                onChange={handleWeightChange}
                onKeyDown={handleWeightKeyDown}
                aria-invalid={Boolean(weightError)}
                aria-describedby="estimateWeightHelp"
              />
              <span>kg</span>
            </label>
            <small id="estimateWeightHelp" className={weightError ? 'ui-field-error' : 'ui-field-hint'}>{weightError || 'Minimum 0.01 kg; use up to two decimal places.'}</small>
          </section>

          <section className="estimate-action-card ui-card">
            <Button
              className="button primary full estimate-button"
              type="button"
              disabled={!canEstimate || prepared}
              loading={pending}
              loadingLabel="Estimating value…"
              aria-describedby="estimateRequirements"
              onClick={handleEstimate}
            >
              <Calculator size={18} aria-hidden="true" /> Estimate Value
            </Button>
            <p id="estimateRequirements" className="ui-unavailable-note">Choose an image, a category and a valid weight to continue.</p>
          </section>
          </fieldset>
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </div>
      </section>

      <EstimatorResultCard result={estimateResult} onSchedulePickup={handleSchedulePickup} />
    </main>
  );
}
