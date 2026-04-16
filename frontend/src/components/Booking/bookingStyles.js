export const glassCardStyle = {
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '28px',
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
};

export const infoCardStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '18px',
  color: '#e2e8f0',
  lineHeight: '1.7',
};

export const summaryCardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  padding: '1.5rem',
};

export const getStatusBadgeStyle = (status) => ({
  display: 'inline-block',
  padding: '0.45rem 0.95rem',
  borderRadius: '999px',
  fontSize: '0.85rem',
  fontWeight: '600',
  letterSpacing: '0.04em',
  background:
    status === 'APPROVED'
      ? 'rgba(16, 185, 129, 0.18)'
      : status === 'REJECTED'
      ? 'rgba(239, 68, 68, 0.18)'
      : status === 'CANCELLED'
      ? 'rgba(107, 114, 128, 0.22)'
      : 'rgba(245, 158, 11, 0.18)',
  border:
    status === 'APPROVED'
      ? '1px solid rgba(16, 185, 129, 0.35)'
      : status === 'REJECTED'
      ? '1px solid rgba(239, 68, 68, 0.35)'
      : status === 'CANCELLED'
      ? '1px solid rgba(156, 163, 175, 0.35)'
      : '1px solid rgba(245, 158, 11, 0.35)',
  color:
    status === 'APPROVED'
      ? '#d1fae5'
      : status === 'REJECTED'
      ? '#fecaca'
      : status === 'CANCELLED'
      ? '#e5e7eb'
      : '#fde68a',
});

export const getActionButtonStyle = ({
  tone = 'neutral',
  disabled = false,
}) => {
  const tones = {
    approve: {
      background: 'rgba(16, 185, 129, 0.22)',
      border: '1px solid rgba(16, 185, 129, 0.35)',
      color: '#d1fae5',
    },
    reject: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      color: '#fecaca',
    },
    cancel: {
      background: 'rgba(107, 114, 128, 0.22)',
      border: '1px solid rgba(156, 163, 175, 0.35)',
      color: '#e5e7eb',
    },
    neutral: {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#ffffff',
    },
  };

  const palette = tones[tone] || tones.neutral;

  return {
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    background: palette.background,
    border: palette.border,
    color: palette.color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    transition: '0.2s ease',
    opacity: disabled ? 0.55 : 0.9,
  };
};

export const inProgressNoticeStyle = {
  marginTop: '1rem',
  padding: '0.85rem 1rem',
  borderRadius: '16px',
  background: 'rgba(125, 211, 252, 0.08)',
  border: '1px solid rgba(125, 211, 252, 0.18)',
  color: '#c7e8ff',
  fontSize: '0.95rem',
  fontWeight: '600',
};
