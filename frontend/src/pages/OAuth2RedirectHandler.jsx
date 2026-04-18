import React, { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storeToken } from '../utils/api';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      storeToken(token, true);
      navigate('/', { replace: true });
      return;
    }

    navigate('/login?error=oauth_redirect_failed', { replace: true });
  }, [location.search, navigate]);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 96px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: 'min(460px, 100%)',
          padding: '32px',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <LoaderCircle size={30} style={{ marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ margin: '0 0 10px' }}>Completing sign-in</h2>
        <p style={{ margin: 0, color: 'rgba(203, 213, 225, 0.88)', lineHeight: 1.7 }}>
          Your Google authentication is being finalized and your secure session is being prepared.
        </p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
