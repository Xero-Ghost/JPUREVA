import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE } from '../config';

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetch(`${API_BASE}/restaurants`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setRestaurants(data.data || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Sync URL params when search changes
  useEffect(() => {
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [searchTerm, setSearchParams]);

  // Filter restaurants by search + status
  const filtered = restaurants.filter(r => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.address && r.address.toLowerCase().includes(q)) ||
      (r.slug && r.slug.toLowerCase().includes(q)) ||
      String(r.id).includes(q);

    const matchesStatus = filterStatus === 'all' ||
      (r.certification_status && r.certification_status.toLowerCase() === filterStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status) => {
    const map = {
      'Verified': 'bg-primary/10 text-primary border-primary/20',
      'Approved': 'bg-secondary/10 text-secondary border-secondary/20',
      'Pending Audit': 'bg-amber-100 text-amber-700 border-amber-200',
      'Suspended': 'bg-red-100 text-red-700 border-red-200',
    };
    return map[status] || 'bg-surface-container-high text-on-surface/60 border-outline-variant';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop border-b border-surface-variant">
        <div className="max-w-container-max mx-auto">
          <span className="inline-block font-label-caps text-primary bg-primary/5 px-4 py-1.5 rounded-full mb-6 border border-primary/20">
            Audit Directory
          </span>
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-4">
            Certified Establishments
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-xl">
            Search and verify NABL-accredited and certified dining establishments across India.
          </p>

          {/* Search + Filter Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-3 max-w-3xl">
            <div className="flex-grow flex items-center gap-3 px-4 py-3 bg-surface border border-outline-variant rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 font-body-md text-on-background placeholder:text-outline p-0"
                placeholder="Search by restaurant name, category, or ID..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus={!!initialQuery}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-on-surface/40 hover:text-on-surface transition-colors"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 min-w-[150px] sm:min-w-[200px] bg-surface border border-outline-variant rounded-xl font-body-md text-on-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Approved">Approved</option>
              <option value="Pending Audit">Pending Audit</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-on-surface/50">
              {loading ? 'Loading...' : `${filtered.length} establishment${filtered.length !== 1 ? 's' : ''} found`}
            </span>
            {searchTerm && !loading && (
              <span className="text-sm text-on-surface/40">
                for &ldquo;{searchTerm}&rdquo;
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="max-w-container-max mx-auto">
          {loading ? (
            /* Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-surface-container-high rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-on-surface/20 mb-4 block">search_off</span>
              <h3 className="font-headline-lg text-xl text-on-surface/50 mb-2">No Establishments Found</h3>
              <p className="text-on-surface/40 mb-6">
                {searchTerm
                  ? `No results match "${searchTerm}". Try a different search term.`
                  : 'No establishments are registered yet.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            /* Restaurant Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {filtered.map(r => (
                <Link
                  key={r.id}
                  to={r.slug ? `/${r.slug}` : `/directory`}
                  className="group bg-surface border border-outline-variant rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-surface-container-high overflow-hidden">
                    {(r.cover_image_url || r.image_url) ? (
                      <img
                        src={r.cover_image_url || r.image_url}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface/15">storefront</span>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-label-caps uppercase tracking-wider border ${statusBadge(r.certification_status)}`}>
                      {r.certification_status || 'Unknown'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-headline-lg text-lg text-on-background mb-1 group-hover:text-primary transition-colors">
                      {r.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      {r.category && (
                        <span className="text-xs text-on-surface/50 bg-surface-container-high px-2 py-0.5 rounded-full">
                          {r.category}
                        </span>
                      )}
                      <span className="text-xs text-on-surface/40">ID: {r.id}</span>
                    </div>

                    {r.address && (
                      <div className="flex items-start gap-1.5 mb-3">
                        <span className="material-symbols-outlined text-sm text-on-surface/40 mt-0.5">location_on</span>
                        <p className="text-sm text-on-surface/60 line-clamp-1">{r.address}</p>
                      </div>
                    )}

                    {/* Audit Info */}
                    {r.latest_audit ? (
                      <div className="flex items-center justify-between pt-3 border-t border-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-sm ${r.latest_audit.result === 'Pass' ? 'text-primary' : r.latest_audit.result === 'Fail' ? 'text-red-500' : 'text-amber-500'}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {r.latest_audit.result === 'Pass' ? 'check_circle' : r.latest_audit.result === 'Fail' ? 'cancel' : 'schedule'}
                          </span>
                          <span className="text-xs text-on-surface/50">
                            {r.latest_audit.result || 'Pending'} — {r.latest_audit.date}
                          </span>
                        </div>
                        {r.latest_audit.overall_rating && (
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {r.latest_audit.overall_rating}/10
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-surface-variant">
                        <span className="text-xs text-on-surface/40">No audit data available</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}