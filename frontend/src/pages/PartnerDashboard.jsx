import { useRef, useState } from 'react';
import { API_BASE } from '../config';

export default function PartnerPortal() {
  const roiRef = useRef(null);
  const auditRef = useRef(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [upliftPercent, setUpliftPercent] = useState('10');
  const [auditName, setAuditName] = useState('');
  const [auditCategory, setAuditCategory] = useState('');
  const [auditContact, setAuditContact] = useState('');
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const estimatedMonthly = () => {
    const revenue = Number(monthlyRevenue);
    const uplift = Number(upliftPercent);
    if (Number.isNaN(revenue) || Number.isNaN(uplift)) return 0;
    return (revenue * uplift) / 100;
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingAudit(true);
    try {
      const res = await fetch(`${API_BASE}/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: auditName,
          category: auditCategory,
          contact: auditContact
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Baseline audit request submitted. Our team will reach out shortly.');
        setAuditName('');
        setAuditCategory('');
        setAuditContact('');
      } else {
        alert(data.message || 'Failed to submit audit request.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  return (
    <div className="w-full relative bg-editorial-cream">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-stack-lg flex flex-col md:flex-row gap-stack-lg items-center">
        <div className="flex-1 space-y-stack-md py-12">
          <div className="inline-flex items-center space-x-2 border-b border-primary pb-2">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">For Elite Operators</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-charcoal-black italic">
            Turn Trust into Revenue
          </h1>
          <p className="font-quote text-quote text-on-surface-variant max-w-2xl leading-relaxed">
            Demonstrate uncompromising safety standards. Our NABL-accredited scientific data backing translates directly into consumer confidence, premium pricing power, and measurable ROI for your esteemed legacy.
          </p>
          <div className="flex gap-6 pt-6 border-t border-outline-variant mt-8">
            <button
              className="bg-deep-olive text-paper-white border border-transparent shadow-sm px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-tint transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-2 rounded-none"
              onClick={() => scrollToSection(roiRef)}
            >
              Calculate ROI
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              className="bg-transparent text-charcoal-black border border-charcoal-black px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-container-low transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-none"
              onClick={() => scrollToSection(auditRef)}
            >
              Start Baseline Audit
            </button>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <div className="w-full h-[600px] bg-surface-container overflow-hidden border border-outline relative shadow-xl rounded-none grayscale hover:grayscale-0 transition-all duration-700">
            <img alt="Premium Business Heritage" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdXlpdogq6eqVvfaNU5sCSO004uJcgTOMWlNT5ejpHL7bmMMVFhuOMk3W2zX0W4TmDE0hJJZQNMHyzWpsjzTbgwn9hHHUKBsM-6p6syJuQYDny95hGX4jhuIqqvZnByYzzVxJg69tPkQaXoc3px6vve9OZ7g7QsHBq0ieQUTwQmkJGdnc9PsG1PNdl0W0r0Vx6zIq-r-f1mz5td4t5hqGe9zDbg2H0B8AqAnPTbH4FDzozudNnlwpUAyFJuOgKVJsqxd3xqfKZLw" />
          </div>
          {/* Floating Plaque Overlay */}
          <div className="absolute bottom-8 left-8 bg-paper-white border border-outline p-6 shadow-2xl flex items-center gap-6 rounded-none z-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="w-1 h-full bg-safety-green absolute left-0 top-0 bottom-0"></div>
            <span className="material-symbols-outlined text-charcoal-black text-4xl" style={{ fontVariationSettings: "'wght' 300" }}>monitoring</span>
            <div>
              <p className="font-label-caps text-label-caps text-muted-stone uppercase tracking-widest mb-1">Verified Lift</p>
              <p className="font-headline-xl text-headline-xl text-charcoal-black">+35%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition (Bento Grid) */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-stack-lg border-t border-outline-variant">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Smart-Plaque Card 1 */}
          <div className="bg-transparent border-t border-charcoal-black pt-8 flex flex-col relative group">
            <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-charcoal-black text-[40px]" style={{ fontVariationSettings: "'wght' 200" }}>storefront</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-charcoal-black mb-4 group-hover:text-secondary transition-colors">The Conversion Surge</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant flex-grow mb-8">
              Displaying FoodTrust verified badges at point-of-sale immediately removes consumer hesitation, leading to a proven increase in basket size across elite establishments.
            </p>
            <div className="mt-auto pt-6 border-t border-outline-variant flex items-baseline gap-4">
              <span className="font-headline-xl text-headline-xl text-charcoal-black">+35%</span>
              <span className="font-label-caps text-label-caps text-muted-stone uppercase tracking-widest">Avg. Conversion Increase</span>
            </div>
          </div>
          {/* Smart-Plaque Card 2 */}
          <div className="bg-transparent border-t border-charcoal-black pt-8 flex flex-col relative group">
            <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-charcoal-black text-[40px]" style={{ fontVariationSettings: "'wght' 200" }}>account_balance</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-charcoal-black mb-4 group-hover:text-secondary transition-colors">Premium Pricing Power</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant flex-grow mb-8">
              Consumers are willing to pay a premium for guaranteed safety. Our clinical, scientifically-backed data allows you to confidently position your brand in the highest pricing tier.
            </p>
            <div className="mt-auto pt-6 border-t border-outline-variant">
              <span className="inline-block font-label-caps text-label-caps bg-safety-green text-charcoal-black px-4 py-2 uppercase tracking-widest">Market Authority</span>
            </div>
          </div>
          {/* Smart-Plaque Card 3 */}
          <div className="bg-transparent border-t border-charcoal-black pt-8 flex flex-col relative group">
            <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-charcoal-black text-[40px]" style={{ fontVariationSettings: "'wght' 200" }}>workspace_premium</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-charcoal-black mb-4 group-hover:text-secondary transition-colors">Loyalty Multiplier</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant flex-grow mb-8">
              Transparency breeds loyalty. By linking directly to laboratory results via our portal, you build a long-term, unshakeable heritage of trust with a discerning customer base.
            </p>
            <div className="mt-auto pt-6 border-t border-outline-variant">
              <span className="font-label-caps text-label-caps text-charcoal-black uppercase tracking-widest">Retention Rate: <span className="bg-charcoal-black text-paper-white px-2 py-1 ml-2">Elite</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section ref={roiRef} className="max-w-container-max mx-auto px-margin-desktop py-stack-lg border-t border-outline-variant">
        <div className="bg-surface border border-outline-variant p-8 rounded-xl shadow-sm">
          <h2 className="font-headline-lg text-headline-lg text-charcoal-black mb-4">ROI Estimator</h2>
          <p className="font-body-md text-body-md text-muted-stone mb-6">Estimate the monthly lift from FoodTrust verification.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label-caps uppercase text-muted-stone mb-2">Monthly Revenue (INR)</label>
              <input
                type="number"
                min="0"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(e.target.value)}
                className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                placeholder="e.g., 500000"
              />
            </div>
            <div>
              <label className="block text-label-caps uppercase text-muted-stone mb-2">Expected Uplift (%)</label>
              <input
                type="number"
                min="0"
                value={upliftPercent}
                onChange={(e) => setUpliftPercent(e.target.value)}
                className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                placeholder="10"
              />
            </div>
          </div>
          <div className="mt-6 border-t border-outline-variant pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="block text-label-caps uppercase text-muted-stone mb-1">Estimated Monthly Lift</span>
              <span className="font-headline-lg text-headline-lg text-charcoal-black">INR {estimatedMonthly().toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="block text-label-caps uppercase text-muted-stone mb-1">Estimated Annual Lift</span>
              <span className="font-headline-lg text-headline-lg text-charcoal-black">INR {(estimatedMonthly() * 12).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Baseline Audit Request */}
      <section ref={auditRef} className="max-w-container-max mx-auto px-margin-desktop py-stack-lg border-t border-outline-variant">
        <div className="bg-surface border border-outline-variant p-8 rounded-xl shadow-sm">
          <h2 className="font-headline-lg text-headline-lg text-charcoal-black mb-4">Start a Baseline Audit</h2>
          <p className="font-body-md text-body-md text-muted-stone mb-6">Share your details to initiate the FoodTrust audit process.</p>
          <form onSubmit={handleAuditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label-caps uppercase text-muted-stone mb-2">Restaurant Name</label>
              <input
                type="text"
                required
                value={auditName}
                onChange={(e) => setAuditName(e.target.value)}
                className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                placeholder="The Artisan Loaf"
              />
            </div>
            <div>
              <label className="block text-label-caps uppercase text-muted-stone mb-2">Category</label>
              <input
                type="text"
                required
                value={auditCategory}
                onChange={(e) => setAuditCategory(e.target.value)}
                className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                placeholder="Cafe / Fine Dining"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-label-caps uppercase text-muted-stone mb-2">Contact (Email or Phone)</label>
              <input
                type="text"
                required
                value={auditContact}
                onChange={(e) => setAuditContact(e.target.value)}
                className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                placeholder="owner@restaurant.com"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-charcoal-black text-paper-white px-6 py-3 rounded-lg uppercase tracking-widest font-label-caps text-sm hover:bg-surface-tint transition-colors"
                disabled={isSubmittingAudit}
              >
                {isSubmittingAudit ? 'Submitting...' : 'Request Baseline Audit'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}