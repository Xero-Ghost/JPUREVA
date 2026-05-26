
export default function TrustStories() {
  return (
    <div className="flex-grow flex flex-col gap-stack-lg py-stack-lg w-full max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-4xl mx-auto gap-stack-md py-stack-lg border-b border-surface-variant">
        <span className="font-label-caps text-label-caps text-on-surface-variant">Community Trust Ledger</span>
        <h1 className="font-display-lg text-display-lg md:text-display-lg text-display-lg-mobile text-on-surface">Verified Experiences.<br />Genuine Safety.</h1>
        <p className="font-quote text-quote text-on-surface-variant max-w-2xl">Real stories from consumers who prioritize food safety, and the partners dedicated to maintaining the highest scientific standards.</p>
      </section>
      
      {/* Ledger Feed */}
      <section className="flex flex-col gap-stack-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-lg text-headline-lg flex items-center gap-3">
            The Public Ledger
          </h2>
          <div className="flex gap-2">
            <button className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">filter_list</span> FILTER</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {/* Testimonial 1 */}
          <div className="lg:col-span-2 bg-paper-white border border-surface-variant p-stack-md flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-start mb-stack-md border-b border-surface-variant pb-stack-sm">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-body-md text-body-md font-semibold text-on-surface uppercase tracking-wider">Sarah Jenkins</h3>
                  <span className="font-label-caps text-label-caps text-muted-stone">Consumer Entry</span>
                </div>
              </div>
              <span className="font-label-caps text-label-caps text-muted-stone">2 days ago</span>
            </div>
            <p className="font-quote text-quote text-on-surface mb-stack-md flex-grow">"Knowing that a restaurant has the FoodTrust badge completely changes where we choose to eat. My son has severe allergies, and seeing the audited cross-contamination protocols gives us incredible peace of mind."</p>
            <div className="bg-surface p-3 flex items-center gap-3 border border-surface-variant">
              <span className="material-symbols-outlined text-secondary">verified</span>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant">Verified Purchase at</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">The Green Sprout Deli</span>
              </div>
            </div>
          </div>
          
          {/* Image Highlight Card */}
          <div className="relative h-[400px] lg:h-auto overflow-hidden group border border-surface-variant">
            <img alt="Clean modern commercial kitchen interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQRfhVoqXJ69M2LKuZ2ySilGf8iuzO76ITVuqeY1PDrWSThtD7nqzri3yL1lSuGGXhbIc7yw4FpBFcH3-lU6ebNiRY7leX3fw2bgJa0u0UTk36UtML9CA2mBhO7WUrwP_P_gxSqLUHr7Ysks1x6HKjS26paguLhis6xnUCEHfppQRTxPAKbBZjgH54QePZZ30yUTYzZJsn8k3Zl2nuhTSRzwlaOl7SuZUplqCuOjSqJvQlMKpqM-TLrO6u4JU3ud72raOuRWFj8w" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-black/90 via-charcoal-black/20 to-transparent flex flex-col justify-end p-stack-md">
              <span className="font-label-caps text-label-caps text-paper-white w-max border-b border-paper-white mb-2">Spotlight</span>
              <h3 className="font-headline-lg text-headline-lg text-paper-white">Inside a Grade-A Kitchen</h3>
              <p className="font-body-md text-body-md text-surface-variant mt-1">See how Ocean View Dining maintains their flawless record.</p>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-paper-white border border-surface-variant p-stack-md flex flex-col justify-between">
            <div className="flex justify-between items-start mb-stack-md border-b border-surface-variant pb-stack-sm">
              <div>
                <h3 className="font-body-md text-body-md font-semibold text-on-surface uppercase tracking-wider">M. Patel</h3>
                <span className="font-label-caps text-label-caps text-muted-stone">Consumer Entry</span>
              </div>
              <span className="font-label-caps text-label-caps text-muted-stone">Oct 12</span>
            </div>
            <p className="font-quote text-quote text-on-surface mb-stack-md">"The audit reports linked directly from the menu QR code are brilliant. Transparent and easy to read."</p>
          </div>
          
          {/* Partner Video Card Placeholder */}
          <div className="lg:col-span-2 bg-paper-white border border-surface-variant group cursor-pointer flex flex-col md:flex-row h-full">
            <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
              <img alt="Chef owner in a bakery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPVoy__gdKZVL5oODtmwW8uWeW1-YW_dlCVi4M6DjDbVpHLq2Dhd6m59T4uAZOo8k2IzYgUBwlacw6BVefP-LkM64FZH9O4AkuowgnwOiLegYRUSmQXa7QSb4eSth0cO0XNVdzrMOUp-FGBXv01XQATy8ArkLe6-jpa2MpyiW5_HsEZZBb5AYy1QDVuxZM17nl6Ydkfx7oU-JsmoFsT1vRaG8qJIixEtDEzKI0ZuNi5sQSl5ALzUlgkexB9T7M_gpor1SuUKoUdQ" />
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center transition-background duration-300 group-hover:bg-primary/20">
                <div className="w-16 h-16 bg-paper-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </div>
              </div>
            </div>
            <div className="p-stack-md flex-grow flex flex-col w-full md:w-1/2 justify-center">
              <div className="mb-stack-md border-b border-surface-variant pb-stack-sm">
                <span className="font-label-caps text-label-caps text-muted-stone">Partner Entry</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-4">"The standard elevated our entire operation."</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">"Achieving the FoodTrust certification wasn't easy, but the rigid protocols transformed our kitchen culture. It's an investment in absolute quality."</p>
              <div className="mt-auto">
                <span className="block font-body-md text-body-md font-semibold uppercase tracking-wider text-on-surface">Marcus Thorne</span>
                <span className="block font-label-caps text-label-caps text-muted-stone">Owner, The Artisan Loaf</span>
              </div>
            </div>
          </div>
          
          {/* Partner Data Card */}
          <div className="bg-paper-white border border-surface-variant p-stack-md flex flex-col">
            <div className="mb-stack-md border-b border-surface-variant pb-stack-sm flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-muted-stone">Business Impact</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">trending_up</span>
            </div>
            <p className="font-quote text-quote text-on-surface mb-stack-md leading-relaxed">"Corporate clients demand verifiable safety data, and FoodTrust provides the incontrovertible proof they need."</p>
            <div className="grid grid-cols-2 gap-4 mt-auto mb-stack-md border-y border-surface-variant py-4">
              <div>
                <span className="block font-headline-xl text-headline-xl text-primary mb-1">+40%</span>
                <span className="block font-label-caps text-label-caps text-on-surface-variant">Corporate Sales</span>
              </div>
              <div>
                <span className="block font-headline-xl text-headline-xl text-primary mb-1">100</span>
                <span className="block font-label-caps text-label-caps text-on-surface-variant">Audit Score</span>
              </div>
            </div>
            <div>
              <span className="block font-body-md text-body-md font-semibold uppercase tracking-wider text-on-surface">Rebecca Lin</span>
              <span className="block font-label-caps text-label-caps text-muted-stone">Operations Director, Apex Catering</span>
            </div>
          </div>
        </div>
      </section>
      


      {/* Instagram Reels Section */}
      <section className="bg-paper-white border border-surface-variant p-stack-lg mt-stack-md flex flex-col items-center">
        <h2 className="font-headline-xl text-headline-xl text-on-surface mb-stack-lg text-center">FoodTrust on Instagram</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full">
          {/* Reel Placeholder 1 */}
          <div className="h-[500px] bg-surface-container-high rounded-xl overflow-hidden relative group flex items-center justify-center">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-4">movie</span>
              <p className="font-label-caps text-label-caps uppercase tracking-wider">Instagram Reel Embed</p>
            </div>
          </div>
          {/* Reel Placeholder 2 */}
          <div className="h-[500px] bg-surface-container-high rounded-xl overflow-hidden relative group flex items-center justify-center">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-4">movie</span>
              <p className="font-label-caps text-label-caps uppercase tracking-wider">Instagram Reel Embed</p>
            </div>
          </div>
          {/* Reel Placeholder 3 */}
          <div className="h-[500px] bg-surface-container-high rounded-xl overflow-hidden relative group flex items-center justify-center">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-4">movie</span>
              <p className="font-label-caps text-label-caps uppercase tracking-wider">Instagram Reel Embed</p>
            </div>
          </div>
        </div>
        <button className="mt-stack-lg bg-transparent text-charcoal-black border border-charcoal-black px-8 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-container-low transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-none">
          Follow @FoodTrust
        </button>
      </section>
    </div>
  );
}
