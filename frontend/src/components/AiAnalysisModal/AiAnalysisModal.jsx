import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, RotateCw, TriangleAlert } from 'lucide-react';
import './AiAnalysisModal.css';

/**
 * Popup that drops in from the top with the AI analysis.
 * Props: open, title, loading, error, text, onClose, onRetry
 */
export default function AiAnalysisModal({ open, title, loading, error, text, onClose, onRetry }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="ai-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="ai-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-modal-title"
            initial={{ y: '-120%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-120%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.9 }}
          >
            <div className="ai-modal-head">
              <span className="icon-tile accent"><Sparkles size={20} /></span>
              <div className="ai-modal-heading">
                <h3 id="ai-modal-title">AI analysis</h3>
                <p className="ai-modal-sub">{title}</p>
              </div>
              <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="ai-modal-body" aria-live="polite">
              {loading && (
                <div className="ai-loading">
                  <div className="ai-loading-row"><span className="spinner" /> Analyzing with AI…</div>
                  <div className="ai-skeleton" style={{ width: '100%' }} />
                  <div className="ai-skeleton" style={{ width: '92%' }} />
                  <div className="ai-skeleton" style={{ width: '70%' }} />
                </div>
              )}

              {!loading && error && (
                <div className="ai-error">
                  <TriangleAlert size={18} />
                  <p>{error}</p>
                  <button className="btn btn-secondary" onClick={onRetry}><RotateCw size={15} /> Try again</button>
                </div>
              )}

              {!loading && !error && text && (
                <p className="ai-text" dir="auto">{text}</p>
              )}
            </div>

            <p className="ai-disclaimer">AI-generated analysis. It is not betting or financial advice.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
