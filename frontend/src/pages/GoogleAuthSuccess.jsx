import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleAuthSuccess() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const role = params.get('role');
    const username = params.get('username');
    const id = params.get('id') ? Number(params.get('id')) : null;
    if (token && role && username) {
      login({ id, role, username }, token);
      if (role === 'admin') navigate('/admin');
      else if (role === 'partner') navigate('/partner/dashboard');
      else navigate('/consumer/dashboard');
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige/95">
      <p className="text-deep-olive font-semibold text-lg">Signing you in with Google...</p>
    </div>
  );
}
