import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="font-headline-lg text-headline-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            FoodTrust
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-xs">
            Definitive Regulatory Authority for Culinary Standards. Enforcing hygiene, safety, and excellence.
          </p>
          <div className="mt-4 font-label-caps text-label-caps text-on-surface-variant">
            © 2024 FoodTrust Regulatory Body. All scientific data is NABL-accredited.
          </div>
        </div>
        {/* Links Column */}
        <div className="flex flex-col gap-4 md:col-start-3">
          <h4 className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider font-bold mb-2">Protocol & Guidelines</h4>
          <ul className="flex flex-col gap-3">
            <li><Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:underline hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded">Regulatory Disclaimers</Link></li>
            <li><Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:underline hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded">Partner Network</Link></li>
            <li><Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:underline hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded">Privacy Policy</Link></li>
            <li><Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:underline hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded">Audit Standards</Link></li>
            <li><Link to="#" className="font-body-md text-body-md text-on-surface-variant hover:underline hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded">Lab Methodology</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
