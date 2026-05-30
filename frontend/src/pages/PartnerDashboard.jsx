import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function PartnerDashboard() {
  const { user, token } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedShop, setExpandedShop] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [requestingAudit, setRequestingAudit] = useState(null);

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  if (!user || user.role !== 'partner') {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = () => {
    fetch(`${API_BASE}/partner/shops?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setShops(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleExpand = (shop) => {
    if (expandedShop === shop.id) {
      setExpandedShop(null);
      return;
    }
    setExpandedShop(shop.id);
    setEditForm({
      name: shop.name || '',
      category: shop.category || '',
      address: shop.address || '',
      owner_name: shop.owner_name || '',
      owner_phone: shop.owner_phone || '',
      working_hours: shop.working_hours || '',
      about: shop.about || '',
      cover_image_url: shop.cover_image_url || '',
      gallery_images: (shop.gallery_images || []).join(', '),
      videos: (shop.videos || []).join(', '),
      reels: (shop.reels || []).join(', ')
    });
  };

  const handleSave = async (shopId) => {
    setSaving(true);
    try {
      const payload = {
        restaurant_id: shopId,
        user_id: user.id,
        ...editForm,
        gallery_images: editForm.gallery_images.split(',').map(s => s.trim()).filter(Boolean),
        videos: editForm.videos.split(',').map(s => s.trim()).filter(Boolean),
        reels: editForm.reels.split(',').map(s => s.trim()).filter(Boolean)
      };
      const res = await fetch(`${API_BASE}/partner/shop/update`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Shop updated successfully!');
        loadShops();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update shop.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestAudit = async (shopId) => {
    setRequestingAudit(shopId);
    try {
      const res = await fetch(`${API_BASE}/partner/request-audit`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ restaurant_id: shopId, user_id: user.id, audit_type: 'Hygiene' })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Audit request submitted!');
        loadShops();
      } else {
        alert(data.message || 'Failed to request audit.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setRequestingAudit(null);
    }
  };

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
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      {/* Header */}
      <div className="mb-8 border-b border-surface-variant pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <h1 className="font-display-lg text-display-lg text-charcoal-black">Partner Dashboard</h1>
        </div>
        <p className="font-body-md text-body-md text-muted-stone">Welcome back, <strong>{user.username}</strong>. Manage your establishments and track audit progress.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {[1, 2].map(i => <div key={i} className="bg-surface-container-high rounded-2xl h-64 animate-pulse" />)}
        </div>
      ) : shops.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-surface border border-outline-variant rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-on-surface/20 mb-4 block">store</span>
          <h3 className="font-headline-lg text-xl text-on-surface/50 mb-2">No Establishments Yet</h3>
          <p className="text-on-surface/40 mb-6 max-w-md mx-auto">
            You haven&apos;t been onboarded yet. Visit the Partner Portal to request a baseline audit.
          </p>
          <Link
            to="/partner-portal"
            className="inline-flex items-center gap-2 bg-deep-olive text-paper-white px-6 py-3 rounded-lg font-label-caps text-sm uppercase tracking-widest hover:bg-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            Go to Partner Portal
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {shops.map(shop => (
            <div key={shop.id} className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              {/* Shop Card Header */}
              <div
                className="flex flex-col md:flex-row gap-4 p-6 cursor-pointer hover:bg-surface-container-lowest transition-colors"
                onClick={() => handleExpand(shop)}
              >
                {/* Image */}
                <div className="w-full md:w-40 h-32 md:h-28 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                  {shop.cover_image_url ? (
                    <img src={shop.cover_image_url} alt={shop.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface/15">storefront</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-headline-lg text-lg text-on-background">{shop.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-on-surface/50 bg-surface-container-high px-2 py-0.5 rounded-full">{shop.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(shop.certification_status)}`}>
                          {shop.certification_status}
                        </span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-on-surface/40 transition-transform ${expandedShop === shop.id ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                  {shop.address && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-on-surface/50">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {shop.address}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-on-surface/40">
                      <strong>{shop.audits?.length || 0}</strong> audit{(shop.audits?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    {shop.audits?.length > 0 && (
                      <span className="text-xs text-on-surface/40">
                        Latest: <strong className={shop.audits[shop.audits.length - 1]?.result === 'Pass' ? 'text-primary' : 'text-error'}>
                          {shop.audits[shop.audits.length - 1]?.result || 'Pending'}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedShop === shop.id && (
                <div className="border-t border-surface-variant">
                  {/* Audit History */}
                  {shop.audits && shop.audits.length > 0 && (
                    <div className="p-6 border-b border-surface-variant">
                      <h4 className="font-headline-lg text-base text-on-background mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">fact_check</span>
                        Audit History
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-surface-variant text-left">
                              <th className="py-2 pr-4 font-label-caps text-label-caps text-muted-stone">Date</th>
                              <th className="py-2 pr-4 font-label-caps text-label-caps text-muted-stone">Result</th>
                              <th className="py-2 pr-4 font-label-caps text-label-caps text-muted-stone">Status</th>
                              <th className="py-2 pr-4 font-label-caps text-label-caps text-muted-stone">Overall</th>
                              <th className="py-2 pr-4 font-label-caps text-label-caps text-muted-stone">Hygiene</th>
                              <th className="py-2 pr-4 font-label-caps text-label-caps text-muted-stone">Taste</th>
                              <th className="py-2 font-label-caps text-label-caps text-muted-stone">Quality</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shop.audits.map((a, i) => (
                              <tr key={i} className="border-b border-surface-variant/50">
                                <td className="py-2 pr-4 text-on-surface">{a.date}</td>
                                <td className="py-2 pr-4">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${a.result === 'Pass' ? 'bg-primary/10 text-primary' : a.result === 'Fail' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {a.result || 'Pending'}
                                  </span>
                                </td>
                                <td className="py-2 pr-4 text-on-surface/60">{a.status}</td>
                                <td className="py-2 pr-4 text-on-surface font-semibold">{a.overall_rating ?? '—'}</td>
                                <td className="py-2 pr-4 text-on-surface">{a.hygiene_rating ?? '—'}</td>
                                <td className="py-2 pr-4 text-on-surface">{a.taste_rating ?? '—'}</td>
                                <td className="py-2 text-on-surface">{a.quality_rating ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Request Audit */}
                  <div className="p-6 border-b border-surface-variant flex items-center justify-between">
                    <div>
                      <h4 className="font-body-md font-semibold text-on-background">Request a New Audit</h4>
                      <p className="text-xs text-on-surface/50">Submit a request for a hygiene, taste, or quality audit.</p>
                    </div>
                    <button
                      onClick={() => handleRequestAudit(shop.id)}
                      disabled={requestingAudit === shop.id}
                      className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-caps text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">add_circle</span>
                      {requestingAudit === shop.id ? 'Submitting...' : 'Request Audit'}
                    </button>
                  </div>

                  {/* Edit Form */}
                  <div className="p-6">
                    <h4 className="font-headline-lg text-base text-on-background mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-lg">edit</span>
                      Edit Shop Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'name', label: 'Restaurant Name', type: 'text' },
                        { key: 'category', label: 'Category', type: 'text' },
                        { key: 'address', label: 'Address', type: 'text' },
                        { key: 'owner_name', label: 'Owner Name', type: 'text' },
                        { key: 'owner_phone', label: 'Owner Phone', type: 'text' },
                        { key: 'working_hours', label: 'Working Hours', type: 'text' },
                        { key: 'cover_image_url', label: 'Cover Image URL', type: 'text' },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label className="block text-label-caps uppercase text-muted-stone mb-1 text-xs">{label}</label>
                          <input
                            type={type}
                            value={editForm[key] || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <label className="block text-label-caps uppercase text-muted-stone mb-1 text-xs">About</label>
                      <textarea
                        value={editForm.about || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, about: e.target.value }))}
                        className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm min-h-[80px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {[
                        { key: 'gallery_images', label: 'Gallery Image URLs (comma separated)' },
                        { key: 'videos', label: 'Video URLs (comma separated)' },
                        { key: 'reels', label: 'Reel URLs (comma separated)' }
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-label-caps uppercase text-muted-stone mb-1 text-xs">{label}</label>
                          <input
                            type="text"
                            value={editForm[key] || ''}
                            onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => handleSave(shop.id)}
                        disabled={saving}
                        className="bg-deep-olive text-paper-white px-6 py-3 rounded-lg font-label-caps text-sm uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">save</span>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}