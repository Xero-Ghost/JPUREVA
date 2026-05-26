import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function LabHub() {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/labs`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data.length > 0) {
          setLabs(data.data);
        } else {
          // Fallback to static data if DB is empty
          setLabs([
            { id: 1, name: 'Apex Analytical Labs', address: '120 Science Park Rd, Mumbai, MH 400072', email: 'contact@apexanalytical.in', phone: '+91 98765 43210' },
            { id: 2, name: 'BioTrace Diagnostics', address: 'Sector 5, Industrial Area, Delhi 110020', email: 'info@biotrace.com', phone: '+91 11223 34455' },
            { id: 3, name: 'Veritas Food Safety', address: '45 Tech Boulevard, Bangalore, KA 560100', email: 'support@veritaslabs.in', phone: '+91 88990 01122' }
          ]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch labs', err);
        // Fallback
        setLabs([
          { id: 1, name: 'Apex Analytical Labs', address: '120 Science Park Rd, Mumbai, MH 400072', email: 'contact@apexanalytical.in', phone: '+91 98765 43210' },
          { id: 2, name: 'BioTrace Diagnostics', address: 'Sector 5, Industrial Area, Delhi 110020', email: 'info@biotrace.com', phone: '+91 11223 34455' }
        ]);
      });
  }, []);

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      {/* Hero Section */}
      <section className="mb-stack-lg border-b border-outline-variant/30 pb-stack-lg grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 border border-outline-variant/50 text-charcoal-black px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest mb-8">
            <span className="material-symbols-outlined text-[16px]">science</span>
            Pillar III: Scientific Rigor
          </div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-charcoal-black mb-6">The Lab Transparency Hub</h1>
          <p className="font-body-lg text-body-lg text-muted-stone max-w-xl">
            Access definitive, NABL-accredited analytical reports. We transform opaque supply chain data into verifiable, scientific truth, ensuring absolute safety standards for every certified product.
          </p>
        </div>
        <div className="w-full h-[500px] bg-surface-container overflow-hidden border border-outline-variant/30 relative">
          <img alt="Scientific laboratory setting for food testing." className="w-full h-full object-cover grayscale opacity-90 mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC69hmsQdzPXUpUnRJfq_w7p32kLmkNzlCiuSokDq9lfsC_jcyzxpLprEa8gBkmRJeocdYJixUuHdE1fhA513pmwvmr7NAxlVtzOFcjpOIrNHucgVzUhLlsMmCBndVlfqk_xRqbwbEcM_QgST5quoVZMlNDhpbp_zNyNGb99KID5EnHU_N62Uw2fEJmlXrMbw3M5OLR18NA-xk3-AMoCoF8fhunnqSBs27Kb8MNEzfq0ug7ajFSEQG7o8XjyyeG8ni4_4DezUnANw" />
        </div>
      </section>

      {/* Lab Mission */}
      <section className="mb-stack-lg border-b border-outline-variant/30 pb-stack-lg">
        <h2 className="font-headline-xl text-headline-xl mb-6 text-center text-charcoal-black max-w-4xl mx-auto">
          "Lab test to get the food nutritional value so the world can know how your food matters more than street stalls."
        </h2>
      </section>

      {/* Trusted Partner Labs */}
      <section className="mb-stack-lg">
        <h2 className="font-headline-xl text-headline-xl mb-12 text-center text-charcoal-black">Trusted Partner Labs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {labs.map((lab) => (
            <div key={lab.id} className="bg-editorial-cream border border-outline-variant/30 p-8 flex flex-col group hover:border-charcoal-black/30 transition-colors">
              <h3 className="font-headline-lg text-headline-lg mb-2 text-charcoal-black">{lab.name}</h3>
              <div className="flex items-start gap-3 mb-4 text-muted-stone">
                <span className="material-symbols-outlined text-[20px] mt-0.5">location_on</span>
                <p className="font-body-md text-body-md whitespace-pre-wrap">{lab.address}</p>
              </div>
              <div className="mt-auto space-y-3 pt-6 border-t border-outline-variant/30">
                <a href={`mailto:${lab.email}`} className="flex items-center gap-3 text-charcoal-black hover:text-muted-stone transition-colors font-body-md text-body-md">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  {lab.email}
                </a>
                <a href={`tel:${lab.phone}`} className="flex items-center gap-3 text-charcoal-black hover:text-muted-stone transition-colors font-body-md text-body-md">
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                  {lab.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Test Estimates & Standards */}
      <section className="mb-stack-lg border border-outline-variant/30 bg-paper-white p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-6 border-b border-outline-variant/30 gap-6">
          <div>
            <h2 className="font-headline-xl text-headline-xl">Testing Standards & Estimates</h2>
            <p className="font-body-md text-body-md text-muted-stone mt-2">Compare your food against health standards and see estimated testing costs.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Standard Values */}
          <div>
            <h3 className="font-headline-lg text-headline-lg text-charcoal-black mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined font-light">fact_check</span>
              Health Benchmarks (Per 100g)
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-outline-variant/30 bg-surface-container">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-body-md text-body-md font-semibold text-charcoal-black">Trans-Fats</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-safety-green">Healthy: &lt; 0.1g</span>
                  <span className="text-error">Unhealthy: &gt; 1.0g</span>
                </div>
              </div>
              <div className="p-4 border border-outline-variant/30 bg-surface-container">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-body-md text-body-md font-semibold text-charcoal-black">Oil TPC Level (Frying)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-safety-green">Healthy: &lt; 15%</span>
                  <span className="text-error">Unhealthy: &gt; 25%</span>
                </div>
              </div>
              <div className="p-4 border border-outline-variant/30 bg-surface-container">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-body-md text-body-md font-semibold text-charcoal-black">Sodium (Burger/Fast Food)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-safety-green">Healthy: &lt; 350mg</span>
                  <span className="text-error">Unhealthy: &gt; 800mg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estimates */}
          <div>
            <h3 className="font-headline-lg text-headline-lg text-charcoal-black mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined font-light">receipt_long</span>
              Estimated Test Values
            </h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                <div>
                  <span className="block font-body-md text-body-md text-charcoal-black font-semibold">Basic Nutritional Profiling</span>
                  <span className="block font-label-caps text-label-caps text-muted-stone mt-1">Calories, Fat, Protein, Carbs</span>
                </div>
                <span className="font-body-lg text-body-lg text-charcoal-black">₹2,500</span>
              </li>
              <li className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                <div>
                  <span className="block font-body-md text-body-md text-charcoal-black font-semibold">Microbial Safety Scan</span>
                  <span className="block font-label-caps text-label-caps text-muted-stone mt-1">E. Coli, Salmonella, TPC</span>
                </div>
                <span className="font-body-lg text-body-lg text-charcoal-black">₹3,200</span>
              </li>
              <li className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
                <div>
                  <span className="block font-body-md text-body-md text-charcoal-black font-semibold">Comprehensive Food Audit</span>
                  <span className="block font-label-caps text-label-caps text-muted-stone mt-1">All standard tests + Adulteration</span>
                </div>
                <span className="font-body-lg text-body-lg text-charcoal-black">₹6,000</span>
              </li>
            </ul>
            <p className="font-body-sm text-body-sm text-muted-stone mt-4 italic">* Prices are estimates and may vary by lab.</p>
          </div>
        </div>
      </section>
    </div>
  );
}