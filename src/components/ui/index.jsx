import React, { useId, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, LoaderCircle } from 'lucide-react';

function classes(...values) {
  return values.filter(Boolean).join(' ');
}

/** Shared action geometry, including anchors that navigate rather than submit. */
export function Button({ as: Element = 'button', variant, size = 'default', loading = false, loadingLabel, disabled = false, className = '', children, onClick, type = 'button', ...props }) {
  const appearance = variant || (className.split(/\s+/).includes('secondary') ? 'secondary' : 'primary');
  const unavailable = disabled || loading;
  return (
    <Element
      {...props}
      className={classes('button ui-button', `ui-button--${appearance}`, size === 'compact' && 'ui-button--compact', className)}
      {...(Element === 'button' ? { type, disabled: unavailable } : { 'aria-disabled': unavailable || undefined, tabIndex: unavailable ? -1 : props.tabIndex })}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (unavailable) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {loading && <LoaderCircle className="ui-spinner" aria-hidden="true" />}
      {loading ? loadingLabel || children : children}
    </Element>
  );
}

export function Input({ className, error, type = 'text', ...props }) {
  const choice = type === 'checkbox' || type === 'radio';
  const controlClass = choice ? 'ui-choice-control' : type === 'file' ? 'ui-file-control' : type === 'hidden' ? '' : 'ui-control';
  return <input {...props} type={type} className={classes(controlClass, className)} aria-invalid={error ? true : props['aria-invalid']} />;
}

export function Select({ className, error, ...props }) {
  return <select {...props} className={classes('ui-control ui-select', className)} aria-invalid={error ? true : props['aria-invalid']} />;
}

export function Textarea({ className, error, ...props }) {
  return <textarea {...props} className={classes('ui-control ui-textarea', className)} aria-invalid={error ? true : props['aria-invalid']} />;
}

/** Visible label, helper text and a field-linked validation message. */
export function FormField({ id, label, hint, error, as: Control = Input, className, required, onInvalid, onChange, ...props }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const [nativeError, setNativeError] = useState('');
  const message = error || nativeError;
  const describedBy = [props['aria-describedby'], hint && `${fieldId}-hint`, message && `${fieldId}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={classes('ui-field', className)}>
      <label htmlFor={fieldId}>
        {label}{required && <span className="ui-required"> (required)</span>}
      </label>
      <Control
        {...props}
        id={fieldId}
        required={required}
        error={message}
        aria-describedby={describedBy}
        onInvalid={(event) => {
          setNativeError(event.currentTarget.validationMessage);
          onInvalid?.(event);
        }}
        onChange={(event) => {
          if (nativeError) setNativeError(event.currentTarget.validity.valid ? '' : event.currentTarget.validationMessage);
          onChange?.(event);
        }}
      />
      {hint && <small id={`${fieldId}-hint`} className="ui-field-hint">{hint}</small>}
      {message && <small id={`${fieldId}-error`} className="ui-field-error">{message}</small>}
    </div>
  );
}

export function FormMessage({ tone = 'info', children, className, ...props }) {
  if (!children) return null;
  const Icon = tone === 'error' ? AlertCircle : tone === 'success' ? CheckCircle2 : tone === 'loading' ? LoaderCircle : Info;
  return (
    <div {...props} className={classes('form-status ui-message', `ui-message--${tone}`, className)} role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'}>
      <Icon className={tone === 'loading' ? 'ui-spinner' : undefined} aria-hidden="true" /><span>{children}</span>
    </div>
  );
}
