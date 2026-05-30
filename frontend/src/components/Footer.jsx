export default function Footer() {
  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left - Brand */}
        <div className="text-center md:text-left">
          <h3 className="font-headline-lg text-xl font-bold text-on-background tracking-wide">JPUREVA</h3>
          <p className="text-sm text-on-surface/60 mt-1">© 2026 JPureva. All rights reserved.</p>
        </div>
        
        {/* Right - Social Media */}
        <div className="flex items-center gap-5">
          {/* Instagram */}
          <a href="https://www.instagram.com/jpureva/" target="_blank" rel="noopener noreferrer" 
             className="text-on-surface/50 hover:text-[#E4405F] transition-colors duration-300" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          {/* Facebook */}
          <a href="https://www.facebook.com/jpureva/" target="_blank" rel="noopener noreferrer"
             className="text-on-surface/50 hover:text-[#1877F2] transition-colors duration-300" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          {/* YouTube */}
          <a href="https://www.youtube.com/@jpureva" target="_blank" rel="noopener noreferrer"
             className="text-on-surface/50 hover:text-[#FF0000] transition-colors duration-300" aria-label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
