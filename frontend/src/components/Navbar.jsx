import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-surface shadow-sm docked full-width sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto">
        {/* Brand */}
        <Link to="/" className="font-headline-lg text-headline-lg font-bold text-primary flex items-center gap-3">
          <img src="/logo.jpeg" alt="JPUREVA logo" className="w-12 h-12 rounded-2xl border border-surface-variant bg-white p-1 shadow-sm object-contain" />
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
          {user ? (
            <button onClick={logout} className="bg-surface-variant text-on-surface-variant font-body-md text-body-md px-6 py-2 rounded-lg border border-transparent hover:bg-outline-variant transition-colors font-semibold">
              Logout ({user.username})
            </button>
          ) : (
            <Link to="/login" className="bg-primary text-on-primary font-body-md text-body-md px-6 py-2 rounded-lg border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-primary-container transition-colors font-semibold">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
