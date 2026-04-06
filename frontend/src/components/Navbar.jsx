import { Link } from 'react-router-dom';

export default function Navbar() {
  
  // මේකෙන් Backend එකේ Logout ලින්ක් එකට කතා කරනවා
  const handleLogout = () => {
    window.location.href = 'http://localhost:8080/api/auth/logout';
  };

  return (
    <nav style={{ padding: '15px', backgroundColor: '#282c34', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0 }}>Smart Campus</h2>
      <div>
        <Link to="/" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>Home</Link>
        <Link to="/notifications" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>Notifications</Link>
        
        <button onClick={handleLogout} style={{ 
          backgroundColor: '#f44336', color: 'white', border: 'none', 
          padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}