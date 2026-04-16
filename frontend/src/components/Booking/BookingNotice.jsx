function BookingNotice({ type = 'info', message, onClose }) {
  if (!message) return null;

  const variants = {
    success: {
      background: 'rgba(16, 185, 129, 0.12)',
      border: '1px solid rgba(16, 185, 129, 0.28)',
      color: '#d1fae5',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.28)',
      color: '#fecaca',
    },
    info: {
      background: 'rgba(59, 130, 246, 0.12)',
      border: '1px solid rgba(59, 130, 246, 0.28)',
      color: '#dbeafe',
    },
  };

  const variant = variants[type] || variants.info;

  return (
    <div
      style={{
        ...variant,
        borderRadius: '18px',
        padding: '0.95rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
        lineHeight: '1.6',
      }}
    >
      <div>{message}</div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: 0,
            lineHeight: 1,
          }}
        >
          x
        </button>
      ) : null}
    </div>
  );
}

export default BookingNotice;
