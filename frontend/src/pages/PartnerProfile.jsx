import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function PartnerProfile() {
  const { partnerSlug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/shops/slug/${partnerSlug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') setRestaurant(data.data);
        else setError(true);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [partnerSlug]);

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="h-80 bg-surface-container-high rounded-2xl animate-pulse mb-8" />
        <div className="h-8 bg-surface-container-high rounded w-1/3 animate-pulse mb-4" />
        <div className="h-4 bg-surface-container-high rounded w-2/3 animate-pulse mb-2" />
        <div className="h-4 bg-surface-container-high rounded w-1/2 animate-pulse" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <span className="material-symbols-outlined text-7xl text-on-surface/15 mb-6">search_off</span>
        <h1 className="font-headline-xl text-2xl text-on-surface/50 mb-2">Restaurant Not Found</h1>
        <p className="text-on-surface/40 mb-6">The restaurant you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link to="/directory" className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Directory
        </Link>
      </div>
    );
  }

  const r = restaurant;
  const audit = r.latest_audit;

  const statusColor = {
    'Verified': 'bg-primary/10 text-primary border-primary/20',
    'Approved': 'bg-secondary/10 text-secondary border-secondary/20',
    'Pending Audit': 'bg-amber-100 text-amber-700 border-amber-200',
    'Suspended': 'bg-red-100 text-red-700 border-red-200',
  }[r.certification_status] || 'bg-surface-container-high text-on-surface/60 border-outline-variant';

  const RatingBar = ({ label, value, icon }) => (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-lg text-on-surface/40" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <div className="flex-grow">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-on-surface/70">{label}</span>
          <span className="text-sm font-semibold text-on-background">{value ?? '—'}/10</span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: value ? `${(value / 10) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[350px] md:h-[450px] overflow-hidden">
        {(r.cover_image_url || r.image_url) ? (
          <img src={r.cover_image_url || r.image_url} alt={r.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-8xl text-on-surface/10">storefront</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-black/80 via-charcoal-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-container-max mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs px-3 py-1 rounded-full border font-label-caps uppercase tracking-wider ${statusColor}`}>
              {r.certification_status}
            </span>
            {r.category && (
              <span className="text-xs text-paper-white/70 bg-paper-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                {r.category}
              </span>
            )}
          </div>
          <h1 className="font-display-lg text-display-lg text-paper-white mb-1">{r.name}</h1>
          {r.address && (
            <div className="flex items-center gap-1.5 text-paper-white/70 text-sm mt-2">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {r.address}
            </div>
          )}
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-surface border-b border-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex flex-wrap gap-6 text-sm">
          {r.working_hours && (
            <div className="flex items-center gap-2 text-on-surface/70">
              <span className="material-symbols-outlined text-lg text-primary">schedule</span>
              <span>{r.working_hours}</span>
            </div>
          )}
          {r.owner_name && (
            <div className="flex items-center gap-2 text-on-surface/70">
              <span className="material-symbols-outlined text-lg text-primary">person</span>
              <span>{r.owner_name}</span>
            </div>
          )}
          {r.owner_phone && (
            <a href={`tel:${r.owner_phone}`} className="flex items-center gap-2 text-on-surface/70 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg text-primary">phone</span>
              <span>{r.owner_phone}</span>
            </a>
          )}
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* About */}
            {r.about && (
              <section className="bg-surface border border-outline-variant rounded-2xl p-6 md:p-8">
                <h2 className="font-headline-lg text-lg text-on-background mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  About
                </h2>
                <p className="font-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">{r.about}</p>
              </section>
            )}

            {/* Gallery */}
            {r.gallery_images && r.gallery_images.length > 0 && (
              <section className="bg-surface border border-outline-variant rounded-2xl p-6 md:p-8">
                <h2 className="font-headline-lg text-lg text-on-background mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">photo_library</span>
                  Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {r.gallery_images.map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-square bg-surface-container-high">
                      <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {r.reviews && r.reviews.length > 0 && (
              <section className="bg-surface border border-outline-variant rounded-2xl p-6 md:p-8">
                <h2 className="font-headline-lg text-lg text-on-background mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">reviews</span>
                  Reviews ({r.reviews.length})
                </h2>
                <div className="flex flex-col gap-4">
                  {r.reviews.map(review => (
                    <div key={review.id} className="border border-surface-variant rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {review.reviewer_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <span className="font-body-md font-semibold text-on-surface block text-sm">{review.reviewer_name}</span>
                            <span className="text-xs text-on-surface/40">{review.reviewer_type}</span>
                          </div>
                        </div>
                        <span className="text-xs text-on-surface/40">{review.created_at}</span>
                      </div>
                      <p className="text-sm text-on-surface/70 leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — Audit Report */}
          <div className="flex flex-col gap-6">
            {audit ? (
              <section className="bg-surface border border-outline-variant rounded-2xl p-6 sticky top-24">
                <h2 className="font-headline-lg text-lg text-on-background mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Audit Report
                </h2>
                <p className="text-xs text-on-surface/40 mb-5">{audit.date} • {audit.status}</p>

                {/* Overall Rating */}
                <div className="text-center mb-6 p-5 bg-surface-container-lowest border border-outline-variant rounded-xl">
                  <p className="text-xs text-on-surface/40 uppercase tracking-wider mb-1">Overall Rating</p>
                  <p className="text-5xl font-bold text-primary">{audit.overall_rating ?? '—'}</p>
                  <p className="text-xs text-on-surface/40 mt-1">out of 10</p>
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${audit.result === 'Pass' ? 'bg-primary/10 text-primary' : audit.result === 'Fail' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {audit.result || 'Pending'}
                  </span>
                </div>

                {/* Individual Ratings */}
                <div className="flex flex-col gap-4">
                  <RatingBar label="Hygiene" value={audit.hygiene_rating} icon="health_and_safety" />
                  <RatingBar label="Taste" value={audit.taste_rating} icon="restaurant" />
                  <RatingBar label="Quality" value={audit.quality_rating} icon="science" />
                </div>

                {/* Notes */}
                {audit.notes && (
                  <div className="mt-5 pt-5 border-t border-surface-variant">
                    <p className="text-xs text-on-surface/40 uppercase tracking-wider mb-2">Auditor Notes</p>
                    <p className="text-sm text-on-surface/70">{audit.notes}</p>
                  </div>
                )}
              </section>
            ) : (
              <div className="bg-surface border border-outline-variant rounded-2xl p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface/15 mb-3 block">pending</span>
                <p className="text-sm text-on-surface/40">No audit report available yet.</p>
              </div>
            )}

            {/* Quick Link */}
            <Link
              to="/directory"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors border border-outline-variant rounded-xl p-3"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}