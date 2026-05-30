import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <nav className="bg-surface shadow-sm docked full-width sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto">
        {/* Brand */}
        <Link to="/" className="font-headline-lg text-headline-lg font-bold text-primary flex items-center gap-3">
          <img src="/logo.jpg" alt="JPUREVA logo" className="w-12 h-12 rounded-2xl border border-surface-variant bg-white p-1 shadow-sm object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-xl text-deep-olive">JPUREVA</span>
            <small className="text-[12px] text-on-surface-variant uppercase tracking-[0.18em]">Verified Hygiene</small>
          </div>
        </Link>
        {/* Navigation Links (Desktop) */}
        <ul className="hidden md:flex gap-gutter items-center">
          <li>
            <Link to="/directory" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200">
              Audit Directory
            </Link>
          </li>
          <li>
            <Link to="/lab-hub" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200">
              Lab Hub
            </Link>
          </li>
          <li>
            <Link to="/partner-portal" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200">
              Partner Portal
            </Link>
          </li>
          <li>
            <Link to="/trust-stories" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200">
              Trust Stories
            </Link>
          </li>
          {user && (
            <li>
              <Link 
                to={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner/dashboard' : '/consumer/dashboard'} 
                className="text-primary font-body-md text-body-md font-bold hover:text-primary-container transition-colors duration-200">
                Dashboard
              </Link>
            </li>
          )}
        </ul>
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-on-surface hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          {/* Desktop Login/Logout */}
          <div className="hidden md:block relative">
            {user ? (
              <div className="relative">
                <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center gap-2 bg-surface hover:bg-surface-container-high px-1 py-1 rounded-full border border-outline-variant transition-colors pr-3">
                  {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-body-md text-on-surface font-medium pr-1">{user.username}</span>
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg py-2 z-50">
                    <Link to="/settings" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-high text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-xl">settings</span>
                      Settings
                    </Link>
                    <button onClick={() => { logout(); setProfileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface-container-high text-on-surface transition-colors text-left">
                      <span className="material-symbols-outlined text-xl">logout</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-primary text-on-primary font-body-md text-body-md px-6 py-2 rounded-lg border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-primary-container transition-colors font-semibold">
                Login
              </Link>
            )}
          </div>
          {/* Hamburger Button (Mobile) */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute left-0 right-0 bg-surface-container-highest shadow-lg z-40 mobile-menu-enter ${mobileMenuOpen ? 'mobile-menu-enter-active' : ''}`}
      >
        <div className="max-w-container-max mx-auto px-margin-mobile py-4 flex flex-col gap-1">
          <Link to="/directory" onClick={() => setMobileMenuOpen(false)}
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary hover:bg-surface-container-high px-4 py-3 rounded-xl transition-colors duration-200">
            Audit Directory
          </Link>
          <Link to="/lab-hub" onClick={() => setMobileMenuOpen(false)}
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary hover:bg-surface-container-high px-4 py-3 rounded-xl transition-colors duration-200">
            Lab Hub
          </Link>
          <Link to="/partner-portal" onClick={() => setMobileMenuOpen(false)}
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary hover:bg-surface-container-high px-4 py-3 rounded-xl transition-colors duration-200">
            Partner Portal
          </Link>
          <Link to="/trust-stories" onClick={() => setMobileMenuOpen(false)}
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary hover:bg-surface-container-high px-4 py-3 rounded-xl transition-colors duration-200">
            Trust Stories
          </Link>
          {user && (
            <Link
              to={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner/dashboard' : '/consumer/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
              className="text-primary font-body-md text-body-md font-bold hover:bg-surface-container-high px-4 py-3 rounded-xl transition-colors duration-200">
              Dashboard
            </Link>
          )}
          <div className="border-t border-outline-variant my-2"></div>
          {user ? (
            <>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-left text-on-surface-variant font-body-md text-body-md font-semibold hover:bg-surface-container-high px-4 py-3 rounded-xl transition-colors duration-200">
                <span className="material-symbols-outlined">settings</span>
                Settings
              </Link>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 text-left text-on-surface-variant font-body-md text-body-md font-semibold hover:bg-surface-container-high px-4 py-3 rounded-xl transition-colors duration-200">
                <span className="material-symbols-outlined">logout</span>
                Logout ({user.username})
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}
              className="bg-primary text-on-primary font-body-md text-body-md px-4 py-3 rounded-xl text-center font-semibold transition-colors hover:bg-primary-container">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
