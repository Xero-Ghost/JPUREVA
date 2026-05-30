import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  const [labName, setLabName] = useState('');
  const [labAddress, setLabAddress] = useState('');
  const [labEmail, setLabEmail] = useState('');
  const [labPhone, setLabPhone] = useState('');
  const [weeklyReels, setWeeklyReels] = useState([
    { name: '', url: '' },
    { name: '', url: '' },
    { name: '', url: '' },
    { name: '', url: '' }
  ]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [overview, setOverview] = useState(null);
  const [onboardingRequests, setOnboardingRequests] = useState([]);
  const [auditRequests, setAuditRequests] = useState([]);
  const [shops, setShops] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [shopForm, setShopForm] = useState({
    name: '',
    category: '',
    address: '',
    owner_name: '',
    owner_phone: '',
    working_hours: '',
    about: '',
    cover_image_url: '',
    gallery_images: '',
    videos: '',
    reels: ''
  });
  const [auditCompletion, setAuditCompletion] = useState({});
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: 'Consumer', content: '', avatar_url: '', is_featured: false });
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [storyBlocks, setStoryBlocks] = useState([]);
  const [newBlockType, setNewBlockType] = useState('testimonial');
  const [newBlockConfig, setNewBlockConfig] = useState({});

  const loadOverview = () => {
    fetch(`${API_BASE}/admin/overview`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setOverview(data.data.counts);
          setOnboardingRequests(data.data.onboarding_requests || []);
          setAuditRequests(data.data.audit_requests || []);
        }
      })
      .catch(() => {});
  };

  const loadNotifications = () => {
    fetch(`${API_BASE}/admin/notifications?role=admin`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setNotifications(data.data || []);
        }
      })
      .catch(() => {});
  };

  const loadShops = () => {
    fetch(`${API_BASE}/restaurants`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setShops(data.data || []);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadOverview();
    loadShops();
    loadNotifications();
    fetch(`${API_BASE}/home-config?key=weekly_reels`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setWeeklyReels((prev) => (
            data.data.length > 0
              ? data.data.map((item) => ({ name: item.name || '', url: item.url || '' }))
              : prev
          ));
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/testimonials`)
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(err => console.error('Failed to load testimonials', err));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/trust-stories`)
      .then(res => res.json())
      .then(data => setStoryBlocks(data))
      .catch(err => console.error('Failed to load trust stories', err));
  }, []);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  const handleAddLab = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/labs`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: labName, address: labAddress, email: labEmail, phone: labPhone })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Lab added successfully!');
        setLabName(''); setLabAddress(''); setLabEmail(''); setLabPhone('');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const updateReelField = (index, field, value) => {
    setWeeklyReels((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addReelRow = () => {
    setWeeklyReels((prev) => [...prev, { name: '', url: '' }]);
  };

  const removeReelRow = (index) => {
    setWeeklyReels((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateHomeConfig = async (e) => {
    e.preventDefault();
    const payload = weeklyReels
      .map((reel) => ({ name: reel.name.trim(), url: reel.url.trim() }))
      .filter((reel) => reel.name && reel.url);

    setIsSavingConfig(true);
    try {
      const res = await fetch(`${API_BASE}/admin/home-config`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ key: 'weekly_reels', value: payload })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Home page updated successfully.');
      } else {
        alert(data.message || 'Failed to update home page.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleApproveOnboarding = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/onboarding/approve`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ request_id: requestId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Onboarding approved.');
        loadOverview();
        loadShops();
        loadNotifications();
      } else {
        alert(data.message || 'Failed to approve onboarding.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleRejectOnboarding = async (requestId) => {
    const reason = window.prompt('Reason for rejection (optional):');
    try {
      const res = await fetch(`${API_BASE}/admin/onboarding/reject`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ request_id: requestId, reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Onboarding rejected.');
        loadOverview();
        loadNotifications();
      } else {
        alert(data.message || 'Failed to reject onboarding.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleApproveAudit = async (auditId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/audit/approve`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ audit_id: auditId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Audit request approved.');
        loadOverview();
        loadNotifications();
      } else {
        alert(data.message || 'Failed to approve audit.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const updateAuditCompletion = (auditId, field, value) => {
    setAuditCompletion((prev) => ({
      ...prev,
      [auditId]: { ...prev[auditId], [field]: value }
    }));
  };

  const handleCompleteAudit = async (auditId) => {
    const payload = auditCompletion[auditId] || {};
    try {
      const res = await fetch(`${API_BASE}/admin/audit/complete`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ audit_id: auditId, ...payload })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Audit completed.');
        loadOverview();
        loadNotifications();
      } else {
        alert(data.message || 'Failed to complete audit.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleSelectShop = (shopId) => {
    setSelectedShopId(shopId);
    const shop = shops.find((item) => String(item.id) === String(shopId));
    if (shop) {
      setShopForm({
        name: shop.name || '',
        category: shop.category || '',
        address: shop.address || '',
        owner_name: shop.owner_name || '',
        owner_phone: shop.owner_phone || '',
        working_hours: shop.working_hours || '',
        about: shop.about || '',
        cover_image_url: shop.cover_image_url || shop.image_url || '',
        gallery_images: (shop.gallery_images || []).join(', '),
        videos: (shop.videos || []).join(', '),
        reels: (shop.reels || []).join(', ')
      });
    }
  };

  const handleShopFormChange = (field, value) => {
    setShopForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateShop = async (e) => {
    e.preventDefault();
    if (!selectedShopId) return;
    const payload = {
      restaurant_id: selectedShopId,
      ...shopForm,
      gallery_images: shopForm.gallery_images.split(',').map((item) => item.trim()).filter(Boolean),
      videos: shopForm.videos.split(',').map((item) => item.trim()).filter(Boolean),
      reels: shopForm.reels.split(',').map((item) => item.trim()).filter(Boolean)
    };
    try {
      const res = await fetch(`${API_BASE}/admin/shop/update`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Shop updated.');
        loadShops();
      } else {
        alert(data.message || 'Failed to update shop.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data.url;
  };

  const handleCreateTestimonial = async () => {
    if (!newTestimonial.name || !newTestimonial.content) return alert('Name and content are required');
    const res = await fetch(`${API_BASE}/admin/testimonials`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newTestimonial)
    });
    if (res.ok) {
      const data = await res.json();
      setTestimonials(prev => [{ ...newTestimonial, id: data.id, created_at: new Date().toISOString() }, ...prev]);
      setNewTestimonial({ name: '', role: 'Consumer', content: '', avatar_url: '', is_featured: false });
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateTestimonial = async (id) => {
    const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(editingTestimonial)
    });
    if (res.ok) {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...editingTestimonial } : t));
      setEditingTestimonial(null);
    }
  };

  const handleAddBlock = async () => {
    const config = { ...newBlockConfig };
    const res = await fetch(`${API_BASE}/admin/trust-stories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ block_type: newBlockType, config })
    });
    if (res.ok) {
      const data = await res.json();
      setStoryBlocks(prev => [...prev, { id: data.id, block_type: newBlockType, config, position: prev.length }]);
      setNewBlockConfig({});
    }
  };

  const handleDeleteBlock = async (id) => {
    if (!confirm('Remove this block?')) return;
    const res = await fetch(`${API_BASE}/admin/trust-stories/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) setStoryBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleMoveBlock = async (index, direction) => {
    const newBlocks = [...storyBlocks];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    const reordered = newBlocks.map((b, i) => ({ ...b, position: i }));
    setStoryBlocks(reordered);
    await fetch(`${API_BASE}/admin/trust-stories/reorder`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(reordered.map(b => ({ id: b.id, position: b.position })))
    });
  };

  const handleBlockFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setNewBlockConfig(prev => ({ ...prev, [field]: url }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      handleShopFormChange('cover_image_url', url);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadFile(file));
      }
      const existing = shopForm.gallery_images.split(',').map((item) => item.trim()).filter(Boolean);
      handleShopFormChange('gallery_images', [...existing, ...urls].join(', '));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadFile(file));
      }
      const existing = shopForm.videos.split(',').map((item) => item.trim()).filter(Boolean);
      handleShopFormChange('videos', [...existing, ...urls].join(', '));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      <div className="mb-8 border-b border-surface-variant pb-6">
        <h1 className="font-display-lg text-display-lg text-charcoal-black">Admin Command Center</h1>
        <p className="font-body-md text-body-md text-muted-stone">Manage platform configurations and data.</p>
      </div>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-outline-variant p-4 rounded-xl">
            <span className="block text-label-caps uppercase text-muted-stone">Onboarding Requests</span>
            <span className="text-3xl font-display-lg text-charcoal-black">{overview.onboarding_requests}</span>
          </div>
          <div className="bg-surface border border-outline-variant p-4 rounded-xl">
            <span className="block text-label-caps uppercase text-muted-stone">Audit Requests</span>
            <span className="text-3xl font-display-lg text-charcoal-black">{overview.audit_requests}</span>
          </div>
          <div className="bg-surface border border-outline-variant p-4 rounded-xl">
            <span className="block text-label-caps uppercase text-muted-stone">Total Shops</span>
            <span className="text-3xl font-display-lg text-charcoal-black">{overview.total_shops}</span>
          </div>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="bg-surface border border-outline-variant p-4 rounded-xl mb-8">
          <h2 className="font-headline-lg text-headline-lg mb-3">Latest Notifications</h2>
          <div className="space-y-2">
            {notifications.map((notice) => (
              <div key={notice.id} className="text-sm text-charcoal-black flex justify-between gap-4">
                <span>{notice.message}</span>
                <span className="text-muted-stone">{notice.created_at}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Lab Panel */}
        <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">science</span>
            Add Trusted Lab
          </h2>
          <form onSubmit={handleAddLab} className="flex flex-col gap-4">
            <input type="text" placeholder="Lab Name" required value={labName} onChange={(e) => setLabName(e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
            <input type="text" placeholder="Address" required value={labAddress} onChange={(e) => setLabAddress(e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
            <input type="email" placeholder="Email" required value={labEmail} onChange={(e) => setLabEmail(e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
            <input type="text" placeholder="Phone" required value={labPhone} onChange={(e) => setLabPhone(e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
            <button type="submit" className="bg-deep-olive text-paper-white py-3 rounded-lg hover:bg-surface-tint transition-colors uppercase tracking-widest font-label-caps text-sm mt-2">
              Save Lab
            </button>
          </form>
        </div>

        {/* Onboarding Requests */}
        <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">assignment</span>
            Onboarding Requests
          </h2>
          {onboardingRequests.length === 0 ? (
            <p className="text-muted-stone">No onboarding requests.</p>
          ) : (
            <div className="space-y-4">
              {onboardingRequests.map((request) => (
                <div key={request.id} className="border border-outline-variant p-4 rounded-lg">
                  <p className="font-body-md text-charcoal-black font-semibold">{request.name}</p>
                  <p className="text-sm text-muted-stone">{request.category} • {request.contact}</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => handleApproveOnboarding(request.id)}
                      className="bg-primary text-on-primary py-2 px-4 rounded-lg text-sm uppercase tracking-widest font-label-caps"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectOnboarding(request.id)}
                      className="bg-transparent border border-outline-variant text-muted-stone py-2 px-4 rounded-lg text-sm uppercase tracking-widest font-label-caps"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Requests */}
        <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">storefront</span>
            Audit Requests
          </h2>
          {auditRequests.length === 0 ? (
            <p className="text-muted-stone">No audit requests.</p>
          ) : (
            <div className="space-y-6">
              {auditRequests.map((audit) => (
                <div key={audit.id} className="border border-outline-variant p-4 rounded-lg">
                  <p className="font-body-md text-charcoal-black font-semibold">{audit.restaurant_name}</p>
                  <p className="text-sm text-muted-stone">Status: {audit.status}</p>
                  {audit.status === 'Pending Approval' && (
                    <button
                      onClick={() => handleApproveAudit(audit.id)}
                      className="mt-3 bg-primary text-on-primary py-2 px-4 rounded-lg text-sm uppercase tracking-widest font-label-caps"
                    >
                      Approve Request
                    </button>
                  )}
                  {audit.status === 'Audit Pending' && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={auditCompletion[audit.id]?.result || ''}
                        onChange={(e) => updateAuditCompletion(audit.id, 'result', e.target.value)}
                        className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                      >
                        <option value="">Result</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Overall rating"
                        value={auditCompletion[audit.id]?.overall_rating || ''}
                        onChange={(e) => updateAuditCompletion(audit.id, 'overall_rating', e.target.value)}
                        className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                      />
                      <input
                        type="number"
                        placeholder="Hygiene rating"
                        value={auditCompletion[audit.id]?.hygiene_rating || ''}
                        onChange={(e) => updateAuditCompletion(audit.id, 'hygiene_rating', e.target.value)}
                        className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                      />
                      <input
                        type="number"
                        placeholder="Taste rating"
                        value={auditCompletion[audit.id]?.taste_rating || ''}
                        onChange={(e) => updateAuditCompletion(audit.id, 'taste_rating', e.target.value)}
                        className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                      />
                      <input
                        type="number"
                        placeholder="Quality rating"
                        value={auditCompletion[audit.id]?.quality_rating || ''}
                        onChange={(e) => updateAuditCompletion(audit.id, 'quality_rating', e.target.value)}
                        className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                      />
                      <input
                        type="url"
                        placeholder="Report URL"
                        value={auditCompletion[audit.id]?.report_url || ''}
                        onChange={(e) => updateAuditCompletion(audit.id, 'report_url', e.target.value)}
                        className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                      />
                      <textarea
                        placeholder="Notes"
                        value={auditCompletion[audit.id]?.notes || ''}
                        onChange={(e) => updateAuditCompletion(audit.id, 'notes', e.target.value)}
                        className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest md:col-span-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleCompleteAudit(audit.id)}
                        className="md:col-span-2 bg-charcoal-black text-paper-white py-2 rounded-lg uppercase tracking-widest font-label-caps text-sm"
                      >
                        Complete Audit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shop Editor */}
        <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm md:col-span-2">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">edit</span>
            Shop Editor
          </h2>
          <form onSubmit={handleUpdateShop} className="space-y-4">
            <select
              className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
              value={selectedShopId}
              onChange={(e) => handleSelectShop(e.target.value)}
            >
              <option value="">Select Store...</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Name" value={shopForm.name} onChange={(e) => handleShopFormChange('name', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
              <input type="text" placeholder="Category" value={shopForm.category} onChange={(e) => handleShopFormChange('category', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
              <input type="text" placeholder="Owner Name" value={shopForm.owner_name} onChange={(e) => handleShopFormChange('owner_name', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
              <input type="text" placeholder="Owner Phone" value={shopForm.owner_phone} onChange={(e) => handleShopFormChange('owner_phone', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
              <input type="text" placeholder="Working Hours" value={shopForm.working_hours} onChange={(e) => handleShopFormChange('working_hours', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
              <input type="text" placeholder="Address" value={shopForm.address} onChange={(e) => handleShopFormChange('address', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" />
              <input type="url" placeholder="Cover Image URL" value={shopForm.cover_image_url} onChange={(e) => handleShopFormChange('cover_image_url', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest md:col-span-2" />
              <div className="md:col-span-2">
                <label className="block text-label-caps uppercase text-muted-stone mb-2">Upload Cover Image</label>
                <input type="file" accept="image/*" onChange={handleCoverUpload} />
              </div>
              <textarea placeholder="About" value={shopForm.about} onChange={(e) => handleShopFormChange('about', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest md:col-span-2" />
              <input type="text" placeholder="Gallery Images (comma separated URLs)" value={shopForm.gallery_images} onChange={(e) => handleShopFormChange('gallery_images', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest md:col-span-2" />
              <div className="md:col-span-2">
                <label className="block text-label-caps uppercase text-muted-stone mb-2">Upload Gallery Images</label>
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
              </div>
              <input type="text" placeholder="Videos (comma separated URLs)" value={shopForm.videos} onChange={(e) => handleShopFormChange('videos', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest md:col-span-2" />
              <div className="md:col-span-2">
                <label className="block text-label-caps uppercase text-muted-stone mb-2">Upload Videos</label>
                <input type="file" accept="video/*" multiple onChange={handleVideoUpload} />
              </div>
              <input type="text" placeholder="Reels (comma separated URLs)" value={shopForm.reels} onChange={(e) => handleShopFormChange('reels', e.target.value)} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest md:col-span-2" />
            </div>
            <button type="submit" className="bg-deep-olive text-paper-white py-3 rounded-lg hover:bg-surface-tint transition-colors uppercase tracking-widest font-label-caps text-sm">
              Save Shop Changes
            </button>
          </form>
        </div>

        {/* Manage Testimonials */}
        <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm md:col-span-2">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">format_quote</span>
            Manage Testimonials
            <span className="ml-auto text-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{testimonials.length}</span>
          </h2>

          {/* Add New Testimonial Form */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 mb-6">
            <h3 className="text-sm font-label-caps uppercase text-muted-stone mb-3">Add New Testimonial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={newTestimonial.name}
                onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
              />
              <select
                value={newTestimonial.role}
                onChange={(e) => setNewTestimonial(prev => ({ ...prev, role: e.target.value }))}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
              >
                <option value="Consumer">Consumer</option>
                <option value="Partner">Partner</option>
                <option value="Critic">Critic</option>
              </select>
              <textarea
                placeholder="Testimonial content..."
                value={newTestimonial.content}
                onChange={(e) => setNewTestimonial(prev => ({ ...prev, content: e.target.value }))}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest md:col-span-2"
                rows={3}
              />
              <input
                type="url"
                placeholder="Avatar URL (optional)"
                value={newTestimonial.avatar_url}
                onChange={(e) => setNewTestimonial(prev => ({ ...prev, avatar_url: e.target.value }))}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
              />
              <label className="flex items-center gap-2 p-3">
                <input
                  type="checkbox"
                  checked={newTestimonial.is_featured}
                  onChange={(e) => setNewTestimonial(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-charcoal-black">Featured</span>
              </label>
            </div>
            <button
              type="button"
              onClick={handleCreateTestimonial}
              className="mt-3 bg-primary text-on-primary py-2 px-6 rounded-lg text-sm uppercase tracking-widest font-label-caps hover:bg-primary-container transition-colors"
            >
              Create Testimonial
            </button>
          </div>

          {/* Existing Testimonials */}
          <div className="space-y-3">
            {testimonials.length === 0 ? (
              <p className="text-muted-stone text-center py-6">No testimonials yet.</p>
            ) : (
              testimonials.map((t) => (
                <div key={t.id} className="border border-outline-variant rounded-lg p-4">
                  {editingTestimonial && editingTestimonial.id === t.id ? (
                    /* Inline Edit Form */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editingTestimonial.name}
                          onChange={(e) => setEditingTestimonial(prev => ({ ...prev, name: e.target.value }))}
                          className="p-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm"
                          placeholder="Name"
                        />
                        <select
                          value={editingTestimonial.role}
                          onChange={(e) => setEditingTestimonial(prev => ({ ...prev, role: e.target.value }))}
                          className="p-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm"
                        >
                          <option value="Consumer">Consumer</option>
                          <option value="Partner">Partner</option>
                          <option value="Critic">Critic</option>
                        </select>
                      </div>
                      <textarea
                        value={editingTestimonial.content}
                        onChange={(e) => setEditingTestimonial(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateTestimonial(t.id)}
                          className="bg-primary text-on-primary py-1.5 px-4 rounded-lg text-xs uppercase tracking-widest font-label-caps"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTestimonial(null)}
                          className="border border-outline-variant text-muted-stone py-1.5 px-4 rounded-lg text-xs uppercase tracking-widest font-label-caps"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-body-md text-charcoal-black font-semibold">{t.name}</span>
                          <span className="text-xs text-muted-stone bg-surface-container-high px-2 py-0.5 rounded-full">{t.role}</span>
                          {t.is_featured && (
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">star</span> Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-stone line-clamp-2">{t.content}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingTestimonial({ id: t.id, name: t.name, role: t.role, content: t.content, avatar_url: t.avatar_url, is_featured: t.is_featured })}
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="text-sm text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trust Stories Page Builder */}
        <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm md:col-span-2">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">auto_stories</span>
            Trust Stories Page Builder
            <span className="ml-auto text-sm bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full">{storyBlocks.length} blocks</span>
          </h2>

          {/* Add Block Form */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 mb-6">
            <h3 className="text-sm font-label-caps uppercase text-muted-stone mb-3">Add New Block</h3>
            <div className="space-y-3">
              <select
                value={newBlockType}
                onChange={(e) => { setNewBlockType(e.target.value); setNewBlockConfig({}); }}
                className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest w-full"
              >
                <option value="testimonial">Testimonial</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="text">Text</option>
                <option value="document">Document</option>
              </select>

              {/* Dynamic config fields based on type */}
              {newBlockType === 'testimonial' && (
                <select
                  value={newBlockConfig.testimonial_id || ''}
                  onChange={(e) => setNewBlockConfig({ testimonial_id: parseInt(e.target.value) })}
                  className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest w-full"
                >
                  <option value="">Select a testimonial...</option>
                  {testimonials.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.content?.substring(0, 60)}...</option>
                  ))}
                </select>
              )}

              {newBlockType === 'image' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newBlockConfig.image_url || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, image_url: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                  />
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={newBlockConfig.caption || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, caption: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-label-caps uppercase text-muted-stone mb-2">Upload Image</label>
                    <input type="file" accept="image/*" onChange={(e) => handleBlockFileUpload(e, 'image_url')} />
                  </div>
                </div>
              )}

              {newBlockType === 'video' && (
                <div className="space-y-3">
                  <input
                    type="url"
                    placeholder="Video URL"
                    value={newBlockConfig.video_url || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, video_url: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest w-full"
                  />
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={newBlockConfig.caption || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, caption: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest w-full"
                  />
                  <p className="text-xs text-muted-stone flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Supports Instagram & YouTube links
                  </p>
                </div>
              )}

              {newBlockType === 'text' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newBlockConfig.title || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest w-full"
                  />
                  <textarea
                    placeholder="Body text..."
                    value={newBlockConfig.body || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, body: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest w-full"
                    rows={4}
                  />
                </div>
              )}

              {newBlockType === 'document' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="Document URL"
                    value={newBlockConfig.document_url || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, document_url: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={newBlockConfig.title || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newBlockConfig.description || ''}
                    onChange={(e) => setNewBlockConfig(prev => ({ ...prev, description: e.target.value }))}
                    className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest md:col-span-2"
                    rows={2}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-label-caps uppercase text-muted-stone mb-2">Upload Document</label>
                    <input type="file" onChange={(e) => handleBlockFileUpload(e, 'document_url')} />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddBlock}
                className="bg-secondary text-on-primary py-2 px-6 rounded-lg text-sm uppercase tracking-widest font-label-caps hover:opacity-90 transition-opacity"
              >
                Add Block
              </button>
            </div>
          </div>

          {/* Current Blocks List */}
          <div className="space-y-2">
            {storyBlocks.length === 0 ? (
              <p className="text-muted-stone text-center py-6">No blocks added yet. Add blocks above to build the Trust Stories page.</p>
            ) : (
              storyBlocks.map((block, index) => {
                const typeBadgeColors = {
                  testimonial: 'bg-primary/10 text-primary',
                  image: 'bg-secondary/10 text-secondary',
                  video: 'bg-tertiary/10 text-tertiary',
                  text: 'bg-on-surface/10 text-on-surface/60',
                  document: 'bg-blue-100 text-blue-700'
                };
                const badgeColor = typeBadgeColors[block.block_type] || 'bg-surface-container-high text-muted-stone';
                let preview = '';
                if (block.block_type === 'testimonial' && block.testimonial) {
                  preview = `${block.testimonial.name}: "${block.testimonial.content?.substring(0, 50)}..."`;
                } else if (block.config) {
                  preview = block.config.caption || block.config.title || block.config.image_url || block.config.video_url || block.config.document_url || '';
                  if (preview.length > 60) preview = preview.substring(0, 60) + '...';
                }
                return (
                  <div key={block.id} className="flex items-center gap-3 border border-outline-variant rounded-lg p-3">
                    <span className="text-sm text-muted-stone w-6 text-center">#{index + 1}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-label-caps uppercase ${badgeColor}`}>
                      {block.block_type}
                    </span>
                    <span className="flex-1 text-sm text-charcoal-black truncate">{preview}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveBlock(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-muted-stone hover:text-charcoal-black disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <span className="material-symbols-outlined text-base">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBlock(index, 1)}
                        disabled={index === storyBlocks.length - 1}
                        className="p-1 text-muted-stone hover:text-charcoal-black disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <span className="material-symbols-outlined text-base">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete block"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Home Page Config */}
        <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm md:col-span-2">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">dashboard_customize</span>
            Home Page Configuration
          </h2>
          <form onSubmit={handleUpdateHomeConfig} className="space-y-6">
            <div>
              <label className="block text-label-caps uppercase text-muted-stone mb-2">Weekly Reels (Name + URL)</label>
              <div className="space-y-4">
                {weeklyReels.map((reel, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
                    <input
                      type="text"
                      placeholder="Reel title"
                      value={reel.name}
                      onChange={(e) => updateReelField(index, 'name', e.target.value)}
                      className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                    />
                    <input
                      type="url"
                      placeholder="https://instagram.com/reel/..."
                      value={reel.url}
                      onChange={(e) => updateReelField(index, 'url', e.target.value)}
                      className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest"
                    />
                    <button
                      type="button"
                      onClick={() => removeReelRow(index)}
                      className="border border-outline-variant text-muted-stone px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors"
                      disabled={weeklyReels.length <= 1}
                    >
                      Remove
                    </button>
                    {reel.url && reel.url.includes('instagram.com') && (
                      <div className="mt-2 rounded-xl overflow-hidden" style={{ maxWidth: '200px', aspectRatio: '9/16' }}>
                        <iframe
                          src={`https://www.instagram.com/reel/${reel.url.match(/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/)?.[1]}/embed/`}
                          className="w-full h-full border-none"
                          title="Reel Preview" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addReelRow}
                className="mt-4 border border-charcoal-black text-charcoal-black px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors uppercase tracking-widest font-label-caps text-xs"
              >
                Add Reel
              </button>
            </div>
            <div className="mt-4 text-right">
              <button
                type="submit"
                className="bg-primary text-on-primary py-3 px-8 rounded-lg hover:bg-primary-container transition-colors uppercase tracking-widest font-label-caps text-sm"
                disabled={isSavingConfig}
              >
                {isSavingConfig ? 'Updating...' : 'Update Home Page'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}