import React from 'react';
import { Loader2 } from 'lucide-react';

/** Brand mark: a monogram R with a single accent node. */
export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M10 22V10h7a4 4 0 0 1 0 8h-7m6 0 6 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="9" r="2.2" fill="var(--neon)" />
    </svg>
  );
}

/** Brand glyph for X / Twitter (lucide no longer ships brand icons). */
export function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <Loader2 size={22} className="spin-anim" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="state">
      {Icon && <span className="icon-tile"><Icon size={20} /></span>}
      {title && <div className="state-title">{title}</div>}
      {children && <p>{children}</p>}
    </div>
  );
}
