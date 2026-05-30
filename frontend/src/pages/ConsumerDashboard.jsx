import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function ConsumerDashboard() {
  const { user } = useAuth();
  
  const [restaurantId, setRestaurantId] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportRestaurant, setReportRestaurant] = useState('');

  if (!user || user.role !== 'consumer') {
    return <Navigate to="/login" />;
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/consumer/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          restaurant_id: restaurantId, 
          reviewer_name: user.username, 
          content: reviewContent 
        })
      });
      if (res.ok) {
        alert('Review posted successfully!');
        setRestaurantId('');
        setReviewContent('');
      } else {
        const data = await res.json();
        alert('Failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/consumer/safety-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_name: reportRestaurant,
          details: reportContent,
          user_id: user.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Safety report submitted. Our team will review this immediately.');
        setReportContent('');
        setReportRestaurant('');
      } else {
        alert('Failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while submitting safety report.');
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      <div className="mb-8 border-b border-surface-variant pb-6">
        <h1 className="font-display-lg text-display-lg text-charcoal-black">Consumer Portal</h1>
        <p className="font-body-md text-body-md text-muted-stone">Your voice drives the FoodTrust standards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Post Review Panel */}
        <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-surface-variant pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">rate_review</span>
            Post a Testimonial
          </h2>
          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-label-caps uppercase text-muted-stone mb-1">Restaurant ID</label>
              <input type="number" required value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest" placeholder="e.g. 1" />
            </div>
            <div>
              <label className="block text-label-caps uppercase text-muted-stone mb-1">Your Experience</label>
              <textarea required value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest min-h-[120px]" placeholder="Tell us about the hygiene and quality..."></textarea>
            </div>
            <button type="submit" className="bg-deep-olive text-paper-white py-3 rounded-lg hover:bg-surface-tint transition-colors uppercase tracking-widest font-label-caps text-sm">
              Submit Review
            </button>
          </form>
        </div>

        {/* Safety Override Panel */}
        <div className="bg-error/5 border border-error/20 p-6 rounded-xl shadow-sm">
          <h2 className="font-headline-lg text-headline-lg mb-4 border-b border-error/20 pb-2 flex items-center gap-2 text-error">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            Safety Override System
          </h2>
          <p className="text-body-sm text-error mb-4">Observe a critical hygiene breach? Report it here for an immediate automated audit trigger.</p>
          <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-label-caps uppercase text-error mb-1">Restaurant Name/ID</label>
              <input type="text" required value={reportRestaurant} onChange={(e) => setReportRestaurant(e.target.value)} className="w-full p-3 border border-error/30 rounded-lg bg-paper-white focus:outline-none focus:ring-1 focus:ring-error" placeholder="Where did this happen?" />
            </div>
            <div>
              <label className="block text-label-caps uppercase text-error mb-1">Incident Details</label>
              <textarea required value={reportContent} onChange={(e) => setReportContent(e.target.value)} className="w-full p-3 border border-error/30 rounded-lg bg-paper-white min-h-[120px] focus:outline-none focus:ring-1 focus:ring-error" placeholder="Describe the safety violation..."></textarea>
            </div>
            <button type="submit" className="bg-error text-paper-white py-3 rounded-lg hover:bg-on-error-container transition-colors uppercase tracking-widest font-label-caps text-sm">
              Trigger Override
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}