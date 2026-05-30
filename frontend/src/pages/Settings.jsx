import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

export default function Settings() {
  const { user, login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setProfileImage(user.profile_image_url || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    const payload = { username, email, profile_image_url: profileImage };
    if (password.trim() !== '') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setIsSubmitting(false);
        return;
      }
      payload.password = password;
    }

    try {
      const response = await fetch(`${API_BASE}/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Settings updated successfully!');
        // Update auth context with new user data
        login(data.user, token);
        setPassword('');
      } else {
        setError(data.message || 'Failed to update settings');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant">Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <h1 className="font-headline-lg text-3xl font-bold text-deep-olive mb-2">Account Settings</h1>
        <p className="text-on-surface-variant mb-8">Update your profile details and settings here.</p>

        <div className="bg-surface p-8 rounded-[32px] border border-outline-variant shadow-sm">
          {message && <div className="mb-6 p-4 bg-lime-100 text-lime-800 rounded-xl">{message}</div>}
          {error && <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Profile Image Preview & Input */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-high border-2 border-outline-variant flex-shrink-0 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-outline">person</span>
                )}
              </div>
              <div className="flex-grow w-full">
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Profile Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
                <p className="text-sm text-on-surface/50 mt-2">Paste a direct link to an image to use as your avatar.</p>
              </div>
            </div>

            <div className="border-t border-outline-variant my-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">New Password (Optional)</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-primary text-on-primary font-body-md font-semibold px-8 py-4 rounded-2xl hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
