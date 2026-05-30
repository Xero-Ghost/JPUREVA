import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

/* ── helpers ─────────────────────────────────────────────────────── */

const extractInstagramId = (url) => {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
};

const FALLBACK_TESTIMONIALS = [
  {
    initials: 'SJ',
    name: 'Sarah Jenkins',
    role: 'Consumer',
    color: 'primary',
    quote:
      '"Knowing that a restaurant has the FoodTrust badge completely changes where we choose to eat. Absolute peace of mind."',
  },
  {
    initials: 'MP',
    name: 'M. Patel',
    role: 'Consumer',
    color: 'secondary',
    quote:
      '"The audit reports linked directly from the menu QR code are brilliant. Transparent and easy to read."',
  },
  {
    initials: 'MT',
    name: 'Marcus Thorne',
    role: 'Partner',
    color: 'tertiary',
    quote:
      '"Achieving the FoodTrust certification wasn\'t easy, but the rigid protocols transformed our kitchen culture."',
  },
];

/* ── breakpoint helper ───────────────────────────────────────────── */

const getVisibleCards = (width) => {
  if (width >= 1024) return 3; // lg
  if (width >= 768) return 2;  // md
  return 1;                    // mobile
};

/* ── component ───────────────────────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  /* ── existing reel state ────────────────────────────────────────── */
  const [weeklyReels, setWeeklyReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);

  /* ── new testimonial state ──────────────────────────────────────── */
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  /* ── carousel state ─────────────────────────────────────────────── */
  const [testimonialSlide, setTestimonialSlide] = useState(0);
  const [reelSlide, setReelSlide] = useState(0);
  const [visibleCards, setVisibleCards] = useState(() => getVisibleCards(window.innerWidth));

  /* ── refs for hover-pause ───────────────────────────────────────── */
  const testimonialHovered = useRef(false);
  const reelHovered = useRef(false);

  /* ── fetch reels (unchanged) ────────────────────────────────────── */
  useEffect(() => {
    fetch(`${API_BASE}/home-config?key=weekly_reels`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setWeeklyReels(data.data);
        }
        setReelsLoading(false);
      })
      .catch(() => setReelsLoading(false));
  }, []);

  /* ── fetch testimonials ─────────────────────────────────────────── */
  useEffect(() => {
    fetch(`${API_BASE}/testimonials?featured=true`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setTestimonials(data.data);
        } else {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
        setTestimonialsLoading(false);
      })
      .catch(() => {
        setTestimonials(FALLBACK_TESTIMONIALS);
        setTestimonialsLoading(false);
      });
  }, []);

  /* ── responsive listener ────────────────────────────────────────── */
  useEffect(() => {
    const onResize = () => setVisibleCards(getVisibleCards(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── carousel navigation helpers ────────────────────────────────── */
  const testimonialCards = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;
  const reelCards = weeklyReels.length > 0 ? weeklyReels : [1, 2, 3, 4];

  const testimonialMaxSlide = Math.max(0, testimonialCards.length - visibleCards);
  const reelMaxSlide = Math.max(0, reelCards.length - visibleCards);

  const prevTestimonial = useCallback(() => setTestimonialSlide(s => Math.max(0, s - 1)), []);
  const nextTestimonial = useCallback(() => setTestimonialSlide(s => Math.min(testimonialMaxSlide, s + 1)), [testimonialMaxSlide]);

  const prevReel = useCallback(() => setReelSlide(s => Math.max(0, s - 1)), []);
  const nextReel = useCallback(() => setReelSlide(s => Math.min(reelMaxSlide, s + 1)), [reelMaxSlide]);

  /* clamp slides when visible cards change */
  useEffect(() => {
    setTestimonialSlide(s => Math.min(s, testimonialMaxSlide));
  }, [testimonialMaxSlide]);

  useEffect(() => {
    setReelSlide(s => Math.min(s, reelMaxSlide));
  }, [reelMaxSlide]);

  /* ── auto-advance testimonials ──────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      if (!testimonialHovered.current) {
        setTestimonialSlide(s => (s >= testimonialMaxSlide ? 0 : s + 1));
      }
    }, 5000);
    return () => clearInterval(id);
  }, [testimonialMaxSlide]);

  /* ── auto-advance reels ─────────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      if (!reelHovered.current) {
        setReelSlide(s => (s >= reelMaxSlide ? 0 : s + 1));
      }
    }, 5000);
    return () => clearInterval(id);
  }, [reelMaxSlide]);

  /* ── slide widths (card + gap) ──────────────────────────────────── */
  const testimonialSlideWidth = 350 + 24; // w-[350px] + gap-6
  const reelSlideWidth = window.innerWidth >= 768 ? 300 + 24 : 280 + 24; // w-[280px] md:w-[300px] + gap-6

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-stack-lg pb-stack-lg md:pt-[120px] md:pb-[100px] px-margin-mobile md:px-margin-desktop overflow-hidden border-b border-surface-variant">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-7 z-10 flex flex-col gap-stack-md">
            <div className="inline-flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Scientific Authority in Dining</span>
            </div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-background">
              Infallible Standards for <br />
              <span className="text-primary italic">Culinary Excellence.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px]">
              We enforce strict hygiene protocols, conduct rigorous lab tests, and verify taste quality. Search for NABL-accredited and certified dining establishments.
            </p>
            {/* Search Bar */}
            <form
              className="mt-4 bg-surface p-2 rounded-xl border border-outline-variant shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-2 max-w-[700px]"
              onSubmit={(e) => { e.preventDefault(); navigate(`/directory${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ''}`); }}
            >
              <div className="flex-grow flex items-center gap-3 px-4 py-3 bg-surface-container-lowest rounded-lg border border-transparent focus-within:border-outline focus-within:ring-2 focus-within:ring-outline/20 transition-all">
                <span className="material-symbols-outlined text-outline">search</span>
                <input
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 font-body-md text-body-md text-on-background placeholder:text-outline p-0"
                  placeholder="Search for Trusted Restaurants by name or ID..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary font-body-md text-body-md px-8 py-3 rounded-lg border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-primary-container transition-colors font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Audit Search
              </button>
            </form>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container flex items-center justify-center overflow-hidden">
                  <img alt="Auditor" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVdOT_0u-M6yoxszVbkRE_Nv5C3F7OXUrQUf5c3msEYYBSfKaEaV-J3qoOAFUP3jNTaSXxbv0T-6WaoKSXnUFJ3IK8QdhSAwxEkZtg-pHNorBj8zOpORgB7qs56UszQ3xPojd5mp2X9mYXWqDc8s9igQF51CCsyaKIDB5reQpOUR0L5lOg3QjNeZNyCYeS75vexoyBcd4EQA0gZ3ohVQm3avW9mZpU5MQqca8i7UD0PxpA2Xx-SReM8c6BVZT-pnOaovIBDbJjig" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container flex items-center justify-center overflow-hidden">
                  <img alt="Auditor" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHNlBlELg1jisaIKfvCmAzPo0RrbUfhOBcLDsWBL_aanfVN8r4_HKhbT9tofF6MzKmD9_I7OiH48fiHUQdUNRYEPzhyK-RJ8MkKwpW8kdR-Se5UxeQ6KIsMH94Q_fJ_QBQERugjs20ka3RSz14qOmtoFk9a8LwZYjDnhbi6ao9l0I_ESFxSiJqh9cp-HjKQHNgzFMqum2O269oZ5-5ICZJGQnoGUUTKjlynM-kJgkzYMtmhJeYPCEPehF5lnosbmGDZYdRF9k9fA" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary text-on-primary flex items-center justify-center font-label-caps text-label-caps">
                  5k+
                </div>
              </div>
              <span className="font-body-md text-body-md text-on-surface-variant">Certified Establishments Nationwide</span>
            </div>
          </div>
          <div className="md:col-span-5 relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <img alt="Cinematic, high-definition photography of a professional chef preparing a gourmet dish" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOChiFbLnXb3WpRdrMjzDQIzCPfOLUO9_NP3CN0cArn91xRBlBsjCwFFJ9Q8dNLk2zI9nGqEzZR7fhU5fmkhidZq4DfQdmtg8y84CZfqXTnC1XSn-075hqQ0JLgEOXw6VMx_u5EAMmnFlGX0EHadUHf_nr4uTHpKgr7FjA532CkeFHSffSvSCGxdpw9rvjuISDUvbg4RCJRAEqKKr_8F96QzclvJzmEiFbK-mvnN1UUuHyNg8mafPWyWi0Mdoqgc6c76u551l-JQ" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur-md p-4 rounded-xl border border-surface-variant flex items-center justify-between">
              <div>
                <div className="font-label-caps text-label-caps text-primary font-bold">STATUS: VERIFIED</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant mt-1">Last Audit: 2h ago</div>
              </div>
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Pillar Model */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-stack-lg flex flex-col items-center gap-4">
            <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider font-semibold border border-primary/20 px-3 py-1 rounded-full bg-primary/5">The Verification Matrix</span>
            <h2 className="font-headline-xl text-headline-xl md:font-display-lg md:text-display-lg text-on-background">Rigorous 3-Pillar Assessment Model</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[700px]">Every certified establishment undergoes continuous, non-negotiable evaluation across three critical vectors of food safety and culinary standard.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Pillar 1 */}
            <div className="bg-surface border-t-4 border-t-primary border border-outline-variant p-8 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-on-background">
                <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>cleaning_services</span>
              </div>
              <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-6 border border-primary/20">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-background mb-3">Hygiene & Sanity</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8 min-h-[72px]">Unannounced surprise audits enforcing clinical sanitation protocols. Compliance is mandatory for baseline certification.</p>
              <div className="flex items-center justify-between border-t border-surface-variant pt-6 mt-auto">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Audit Frequency</span>
                <span className="font-label-caps text-label-caps text-primary font-bold bg-primary/10 px-2 py-1 rounded">BI-WEEKLY</span>
              </div>
            </div>
            {/* Pillar 2 */}
            <div className="bg-surface border-t-4 border-t-secondary border border-outline-variant p-8 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-on-background">
                <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              </div>
              <div className="w-12 h-12 bg-surface-container-high text-on-surface rounded-lg flex items-center justify-center mb-6 border border-outline-variant">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-background mb-3">AI Sentiment & Taste</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8 min-h-[72px]">Algorithmic aggregation of verified culinary experiences, filtering anomalies to establish a definitive taste baseline.</p>
              <div className="flex items-center justify-between border-t border-surface-variant pt-6 mt-auto">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Data Points</span>
                <span className="font-label-caps text-label-caps text-secondary font-bold bg-secondary/10 px-2 py-1 rounded">1M+ REVIEWS</span>
              </div>
            </div>
            {/* Pillar 3 */}
            <div className="bg-surface border-t-4 border-t-tertiary border border-outline-variant p-8 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-on-background">
                <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
              </div>
              <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-lg flex items-center justify-center mb-6 border border-tertiary/20">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-background mb-3">Lab-Tested Quality</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8 min-h-[72px]">Spectrometry and biochemical analysis of ingredient sourcing to guarantee absence of contaminants.</p>
              <div className="flex items-center justify-between border-t border-surface-variant pt-6 mt-auto">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Lab Standard</span>
                <span className="font-label-caps text-label-caps text-tertiary font-bold bg-tertiary/10 px-2 py-1 rounded text-on-tertiary">ISO 17025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-stack-md px-margin-mobile md:px-margin-desktop border-b border-surface-variant bg-surface">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div className="p-8 border border-outline-variant bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <h3 className="font-display-lg text-display-lg text-primary mb-2">5M+</h3>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Connected Customers</p>
          </div>
          <div className="p-8 border border-outline-variant bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <h3 className="font-display-lg text-display-lg text-secondary mb-2">150+</h3>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Connected NABL Labs</p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Weekly Trust Stories — CAROUSEL                               */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto mb-stack-md text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-background">Weekly Trust Stories</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Real experiences verified by science.</p>
        </div>

        <div
          className="max-w-container-max mx-auto relative"
          onMouseEnter={() => { testimonialHovered.current = true; }}
          onMouseLeave={() => { testimonialHovered.current = false; }}
        >
          {/* arrows */}
          <button
            className="carousel-arrow carousel-arrow--left"
            onClick={prevTestimonial}
            disabled={testimonialSlide === 0}
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            className="carousel-arrow carousel-arrow--right"
            onClick={nextTestimonial}
            disabled={testimonialSlide >= testimonialMaxSlide}
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>

          {/* track */}
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${testimonialSlide * testimonialSlideWidth}px)` }}
            >
              {testimonialCards.map((t, index) => {
                const initials = t.initials || (t.name ? t.name.split(' ').map(w => w[0]).join('') : '??');
                const colorClass = t.color || ['primary', 'secondary', 'tertiary'][index % 3];
                return (
                  <div
                    key={(t.name || 'testimonial') + index}
                    className="w-[350px] flex-shrink-0 bg-paper-white border border-surface-variant p-6 rounded-xl flex flex-col shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 bg-${colorClass}/10 rounded-full flex items-center justify-center text-${colorClass} font-bold`}>
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-body-md text-body-md font-semibold text-on-surface">{t.name}</h4>
                        <span className="font-label-caps text-label-caps text-muted-stone">{t.role || 'Consumer'}</span>
                      </div>
                    </div>
                    <p className="font-quote text-quote text-on-surface mb-4 flex-grow">{t.quote || t.text || ''}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* dots */}
          <div className="carousel-dots">
            {Array.from({ length: testimonialMaxSlide + 1 }).map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${i === testimonialSlide ? ' carousel-dot--active' : ''}`}
                onClick={() => setTestimonialSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Weekly Reels — CAROUSEL with Instagram Embeds                 */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface border-t border-surface-variant">
        <div className="max-w-container-max mx-auto mb-stack-md text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-background">FoodTrust Weekly Reels</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Catch up on our latest kitchen tours and lab insights.</p>
        </div>

        <div
          className="max-w-container-max mx-auto relative"
          onMouseEnter={() => { reelHovered.current = true; }}
          onMouseLeave={() => { reelHovered.current = false; }}
        >
          {/* arrows */}
          <button
            className="carousel-arrow carousel-arrow--left"
            onClick={prevReel}
            disabled={reelSlide === 0}
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            className="carousel-arrow carousel-arrow--right"
            onClick={nextReel}
            disabled={reelSlide >= reelMaxSlide}
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>

          {/* track */}
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${reelSlide * reelSlideWidth}px)` }}
            >
              {reelCards.map((item, index) => {
                const reelName = typeof item === 'object' ? item.name : `Instagram Reel ${item}`;
                const reelUrl = typeof item === 'object' ? item.url : null;
                const reelId = extractInstagramId(reelUrl);
                const isVideoUrl = reelUrl && /\.(mp4|webm|ogg)(\?|$)/i.test(reelUrl);

                return (
                  <div
                    key={(reelName || 'reel') + index}
                    className="w-[280px] md:w-[300px] flex-shrink-0"
                  >
                    {/* Instagram embed */}
                    {reelId && (
                      <div className="reel-embed-container h-[480px] rounded-xl overflow-hidden border border-surface-variant">
                        <iframe
                          src={`https://www.instagram.com/reel/${reelId}/embed/`}
                          title={reelName || 'Instagram Reel'}
                          className="w-full h-full border-0"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Regular video */}
                    {!reelId && isVideoUrl && (
                      <div className="reel-embed-container h-[480px] rounded-xl overflow-hidden border border-surface-variant bg-surface-container-high">
                        <video
                          src={reelUrl}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      </div>
                    )}

                    {/* Fallback preview card */}
                    {!reelId && !isVideoUrl && (
                      <div className="reel-preview-card h-[480px] rounded-xl overflow-hidden relative group flex items-center justify-center border border-surface-variant"
                        style={{
                          background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
                        }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
                          <span className="material-symbols-outlined text-[48px] mb-4 drop-shadow-lg">play_circle</span>
                          <p className="font-label-caps text-label-caps uppercase tracking-wider mb-3 drop-shadow">{reelName || 'Instagram Reel'}</p>
                          {reelUrl && (
                            <a
                              href={reelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-xs uppercase tracking-widest rounded-full border border-white/30 hover:bg-white/30 transition-colors"
                            >
                              Watch Reel
                            </a>
                          )}
                          {!reelUrl && !reelsLoading && (
                            <span className="text-xs text-white/70">Admin will add the reel link soon.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* dots */}
          <div className="carousel-dots">
            {Array.from({ length: reelMaxSlide + 1 }).map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${i === reelSlide ? ' carousel-dot--active' : ''}`}
                onClick={() => setReelSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Safety Override System */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-paper-white border-t border-surface-variant">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center gap-stack-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4 border-b border-surface-variant w-max pb-2">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <span className="font-label-caps text-label-caps text-error">Safety Override System</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4">See Something Unsafe?</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-md max-w-xl">
              Our AI emergency trigger system evaluates reports in real-time. If you observe a critical breach of food safety standards at a verified partner, report it immediately for an automated, rapid-response audit.
            </p>
            <Link to="/consumer/dashboard" className="bg-error text-paper-white px-8 py-3 font-body-md text-body-md font-semibold hover:bg-on-error-container transition-colors flex items-center gap-2 uppercase tracking-wider text-sm">
              Report a Concern
            </Link>
          </div>
          <div className="w-full md:w-1/3 border-l md:border-surface-variant md:pl-stack-lg pt-stack-md md:pt-0 border-t md:border-t-0 border-surface-variant mt-stack-md md:mt-0">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-4 border-b border-surface-variant pb-2">Recent Trigger Status</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                <div>
                  <span className="block font-body-md text-body-md font-semibold text-on-surface">Case #492-A • Resolved</span>
                  <span className="block font-label-caps text-label-caps text-muted-stone mt-1">Re-audit passed on 10/24</span>
                </div>
              </li>
              <li className="flex items-start gap-3 opacity-60">
                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                <div>
                  <span className="block font-body-md text-body-md font-semibold text-on-surface">Case #488-B • Resolved</span>
                  <span className="block font-label-caps text-label-caps text-muted-stone mt-1">Minor infraction corrected</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Want to Connect Form */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-surface-variant">
        <div className="max-w-2xl mx-auto bg-surface border border-outline-variant p-8 md:p-12 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <h2 className="font-headline-xl text-headline-xl text-on-background">Want to Connect?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Have questions about our certification process? Reach out to us.</p>
          </div>
          <form className="flex flex-col gap-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            fetch(`${API_BASE}/connect`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
              if (data.status === 'success') {
                alert('Message sent successfully!');
                e.target.reset();
              } else {
                alert('Failed to send message: ' + data.message);
              }
            })
            .catch((error) => {
              console.error(error);
              alert('Error sending message.');
            });
          }}>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Name</label>
              <input name="name" required className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="John Doe" type="text" />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Email</label>
              <input name="email" required className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="john@example.com" type="email" />
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Message</label>
              <textarea name="message" required className="w-full bg-surface-container-lowest border border-outline-variant text-on-background font-body-md p-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[120px]" placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary font-body-md font-semibold py-4 rounded-lg shadow-md hover:bg-primary-container hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
              Submit Request <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </section>
    </>
  );
}