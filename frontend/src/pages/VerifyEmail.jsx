import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Verifying your email...');
  const token = searchParams.get('token');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }
    
    if (hasFetched.current) return;
    hasFetched.current = true;

    const verify = async () => {
      try {
        const response = await fetch(`${API_BASE}/verify-email/${token}`);
        const data = await response.json();
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully. You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Unable to verify email. Please try again later.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-beige/95 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white/95 p-10 rounded-[32px] shadow-[0_30px_80px_rgba(56,74,47,0.08)] border border-surface-container-high">
        <h1 className="font-display-lg text-display-lg text-deep-olive mb-4">Email Verification</h1>
        <p className={`mb-6 ${status === 'success' ? 'text-success' : 'text-error'}`}>{message}</p>
        <div className="grid gap-4">
          <Link to="/login" className="inline-flex justify-center py-4 px-6 rounded-3xl bg-deep-olive text-paper-white font-semibold hover:bg-primary transition">
            Return to login
          </Link>
          <p className="text-sm text-on-surface-variant">If the link does not work, copy the email verification link from your message and open it again.</p>
        </div>
      </div>
    </div>
  );
}
