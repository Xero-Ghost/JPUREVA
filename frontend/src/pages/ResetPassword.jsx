import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Reset token is missing.');
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token) return setError('Reset token is missing.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Password updated successfully.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Unable to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige/95 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white/95 p-10 rounded-[32px] shadow-[0_30px_80px_rgba(56,74,47,0.08)] border border-surface-container-high">
        <h1 className="font-display-lg text-display-lg text-deep-olive mb-4">Reset Password</h1>
        {error && <p className="mb-4 text-error">{error}</p>}
        {message && <p className="mb-4 text-success">{message}</p>}
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label className="block font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant mb-2">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant mb-2">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deep-olive text-paper-white font-body-md font-semibold py-4 rounded-3xl shadow-[0_15px_40px_rgba(56,74,47,0.14)] hover:bg-primary transition-colors"
          >
            {loading ? 'Updating password…' : 'Set new password'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary font-semibold hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
