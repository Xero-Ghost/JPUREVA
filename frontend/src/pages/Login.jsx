import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

function getPasswordStrength(password) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  score = Object.values(checks).filter(Boolean).length;
  if (score <= 1) return { label: 'Very Weak', color: 'bg-red-500', width: 'w-1/5', textColor: 'text-red-500' };
  if (score === 2) return { label: 'Weak', color: 'bg-orange-400', width: 'w-2/5', textColor: 'text-orange-400' };
  if (score === 3) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-3/5', textColor: 'text-yellow-500' };
  if (score === 4) return { label: 'Strong', color: 'bg-lime-500', width: 'w-4/5', textColor: 'text-lime-600' };
  return { label: 'Very Strong', color: 'bg-green-600', width: 'w-full', textColor: 'text-green-600' };
}

export default function Login() {
  const [role, setRole] = useState('consumer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = isRegistering && password ? getPasswordStrength(password) : null;

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    const endpoint = isRegistering ? `${API_BASE}/register` : `${API_BASE}/login`;
    if (isRegistering) {
      if (!email) return setError('Email is required for registration');
      const pwdError = validatePassword(password);
      if (pwdError) return setError(pwdError);
      if (confirmPassword !== password) return setError('Passwords do not match');
    }
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegistering ? { username, password, role, email, confirmPassword } : { email, password })
      });
      const data = await response.json();

      if (response.ok) {
        if (isRegistering) {
          setInfoMessage('Registered successfully! Please check your email to verify your account before logging in.');
          setIsRegistering(false);
        } else {
          login(data.user, data.token);
          if (data.user.role === 'admin') navigate('/admin');
          else if (data.user.role === 'partner') navigate('/partner/dashboard');
          else navigate('/consumer/dashboard');
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please ensure backend is running.');
    }
  };

  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    if (!resetEmail) return setError('Please enter your email');
    try {
      const res = await fetch(`${API_BASE}/password-reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const d = await res.json();
      setInfoMessage(d.message || 'If this email exists, a reset link has been sent.');
      setForgotPassword(false);
      setResetEmail('');
    } catch (err) {
      console.error(err);
      setError('Network error while requesting password reset');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-beige/95 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.4fr_1fr] gap-8 bg-white/95 backdrop-blur-xl border border-surface-container-high shadow-[0_30px_80px_rgba(56,74,47,0.08)] rounded-[32px] overflow-hidden">
        <div className="hidden lg:flex flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(56,74,47,0.12),transparent_28%),linear-gradient(180deg,#fdf7eb_0%,#f3e8d0_100%)] p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary text-xs font-semibold uppercase tracking-[0.2em] px-3 py-2 mb-6">
              JPureva Secure Access
            </span>
            <h2 className="font-display-lg text-display-lg text-deep-olive mb-4">
              Welcome to the trusted food network
            </h2>
            <p className="font-body-lg text-on-surface-variant leading-relaxed max-w-lg">
              Access verified dashboards, audits, and reviews with confidence. Our platform is designed for a calm, premium experience that feels both modern and approachable.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-surface border border-surface-variant/70 p-5">
              <p className="text-label-caps text-label-caps uppercase tracking-[0.2em] text-olive mb-2">Fast access</p>
              <p className="text-body-sm text-on-surface-variant">Login securely and continue managing your trusted food reputation.</p>
            </div>
            <div className="rounded-3xl bg-surface border border-surface-variant/70 p-5">
              <p className="text-label-caps text-label-caps uppercase tracking-[0.2em] text-olive mb-2">Verified & Safe</p>
              <p className="text-body-sm text-on-surface-variant">Email verification and strong password protection keep your account safe.</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-label-caps text-label-caps uppercase tracking-[0.2em] text-sage font-semibold mb-2">
                  {isRegistering ? 'New account' : 'Welcome back'}
                </p>
                <h1 className="font-display-lg text-display-lg text-deep-olive">
                  {isRegistering ? 'Create your JPureva account' : 'Login to JPureva'}
                </h1>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-surface-variant px-4 py-2 text-sm font-semibold text-deep-olive bg-surface-container-lowest">
                {isRegistering ? 'Register' : 'Sign in'}
              </span>
            </div>
            <p className="font-body-md text-on-surface-variant max-w-xl">
              {isRegistering ? 'Register to access partner and consumer features, with secure role-based access for your account.' : 'Enter your credentials to access partner, consumer, or admin dashboards with trusted security.'}
            </p>
          </div>

          {infoMessage && (
            <div className="bg-surface-container-lowest text-on-surface p-4 rounded-3xl text-sm mb-6 border border-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>{infoMessage}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-error/10 text-error p-4 rounded-3xl text-sm mb-6 border border-error/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {forgotPassword ? (
            <form onSubmit={handlePasswordResetRequest} className="flex flex-col gap-5">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
              <button type="submit" className="w-full bg-deep-olive text-paper-white font-body-md font-semibold py-4 rounded-3xl shadow-[0_15px_40px_rgba(56,74,47,0.14)] hover:bg-primary transition-colors">
                Send reset link
              </button>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setForgotPassword(false)} className="text-primary font-semibold">Back to login</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {isRegistering && (
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  >
                    <option value="consumer">Consumer (Leave Reviews)</option>
                    <option value="partner">Partner (Shop Owner)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {isRegistering && (
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
              )}

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {strength && (
                  <div className="mt-2">
                    <div className="w-full bg-surface-container-high rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs font-semibold ${strength.textColor}`}>{strength.label}</p>
                      <p className="text-xs text-on-surface-variant">Min 8 chars, A-Z, 0-9, symbol</p>
                    </div>
                  </div>
                )}
              </div>

              {isRegistering && (
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Confirm password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition pr-12"
                  />
                  {confirmPassword && (
                    <p className={`text-xs mt-1 font-semibold ${confirmPassword === password ? 'text-green-600' : 'text-red-500'}`}>
                      {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              )}

              <button type="submit" className="w-full bg-deep-olive text-paper-white font-body-md font-semibold py-4 rounded-3xl shadow-[0_15px_40px_rgba(56,74,47,0.14)] hover:bg-primary transition-colors">
                {isRegistering ? 'Create account' : 'Continue'}
              </button>

              {!isRegistering && (
                <div className="mt-2 text-right">
                  <button type="button" onClick={() => setForgotPassword(true)} className="text-sm text-primary font-semibold hover:underline">Forgot password?</button>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-surface-variant"></div>
                <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-surface-variant"></div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 border border-outline-variant bg-surface text-on-surface font-body-md font-semibold py-4 rounded-3xl hover:bg-surface-container-low transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Continue with Google
              </button>
            </form>
          )}

          <div className="mt-8 text-center border-t border-surface-variant pt-6">
            <p className="font-body-sm text-on-surface-variant">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-primary font-semibold hover:underline"
              >
                {isRegistering ? 'Login here' : 'Register here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
