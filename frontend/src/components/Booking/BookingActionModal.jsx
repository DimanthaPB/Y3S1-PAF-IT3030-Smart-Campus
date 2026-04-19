import { useEffect, useState } from 'react';

function BookingActionModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Enter a reason',
  confirmTone = 'default',
  busy = false,
  busyLabel = 'Please wait...',
  externalError = '',
  children,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const confirmStyles = {
    default: {
      background: 'rgba(59, 130, 246, 0.20)',
      border: '1px solid rgba(59, 130, 246, 0.35)',
      color: '#dbeafe',
    },
    success: {
      background: 'rgba(16, 185, 129, 0.20)',
      border: '1px solid rgba(16, 185, 129, 0.35)',
      color: '#d1fae5',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.20)',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      color: '#fecaca',
    },
    neutral: {
      background: 'rgba(107, 114, 128, 0.22)',
      border: '1px solid rgba(156, 163, 175, 0.35)',
      color: '#e5e7eb',
    },
  };

  const handleConfirm = () => {
    const trimmedReason = reason.trim();

    if (requireReason && !trimmedReason) {
      setError(`${reasonLabel} is required.`);
      return;
    }

    setError('');
    onConfirm(trimmedReason);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '28px',
          padding: '1.75rem',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          color: '#f8fafc',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#ffffff' }}>{title}</h3>
        {description ? (
          <p style={{ marginTop: '0.85rem', marginBottom: 0, color: '#cbd5e1', lineHeight: '1.7' }}>
            {description}
          </p>
        ) : null}

        {children ? <div style={{ marginTop: '1.25rem' }}>{children}</div> : null}

        {requireReason ? (
          <div style={{ marginTop: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: '#dbe4f0',
                fontWeight: '600',
                marginBottom: '0.65rem',
              }}
            >
              {reasonLabel}
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              rows="4"
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.95rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '18px',
                color: '#ffffff',
                outline: 'none',
                resize: 'vertical',
                minHeight: '120px',
              }}
            />
            {error ? (
              <div style={{ marginTop: '0.6rem', color: '#fca5a5', fontSize: '0.92rem' }}>
                {error}
              </div>
            ) : null}
            {externalError ? (
              <div style={{ marginTop: '0.6rem', color: '#fca5a5', fontSize: '0.92rem' }}>
                {externalError}
              </div>
            ) : null}
          </div>
        ) : externalError ? (
          <div style={{ marginTop: '1rem', color: '#fca5a5', fontSize: '0.92rem' }}>
            {externalError}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              padding: '0.8rem 1.1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              cursor: busy ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            style={{
              ...confirmStyles[confirmTone],
              padding: '0.8rem 1.1rem',
              borderRadius: '12px',
              cursor: busy ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              opacity: busy ? 0.65 : 1,
            }}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingActionModal;
