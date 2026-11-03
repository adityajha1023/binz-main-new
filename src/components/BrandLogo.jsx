import React from 'react';

/** Keep the approved artwork, intrinsic proportions and accessible home link together. */
export default function BrandLogo({ variant = 'header', onClick }) {
  return (
    <a className={`brand brand--${variant}`} href="/#home" aria-label="BinZ home" onClick={onClick}>
      <span className="logo-shell">
        <img
          src="/assets/binz-logo.webp"
          alt="BinZ"
          width={800}
          height={450}
          decoding="async"
          loading={variant === 'footer' ? 'lazy' : 'eager'}
          fetchPriority={variant === 'footer' ? 'low' : 'high'}
        />
      </span>
    </a>
  );
}
