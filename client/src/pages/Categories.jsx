export const Categories = () => (
  <section className="section">
    <div className="container-premium">
      <h1 className="text-4xl font-bold text-brand-black mb-12 text-center">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { name: 'Oversized T-shirts', desc: 'Relaxed, modern silhouette for everyday wear.' },
          { name: 'Regular Fit T-shirts', desc: 'Classic cut with timeless appeal.' },
          { name: 'Drop Shoulder T-shirts', desc: 'Dropped seam for a laid-back look.' },
          { name: 'Graphic T-shirts', desc: 'Bold prints and artistic designs.' },
          { name: 'Plain T-shirts', desc: 'Clean essentials in premium cotton.' },
          { name: 'Polo T-shirts', desc: 'Smart-casual piqué knit polos.' },
          { name: "Men's Collection", desc: 'Curated fits for him.' },
          { name: "Women's Collection", desc: 'Tailored styles for her.' },
          { name: 'Unisex Collection', desc: 'Styles for everyone.' },
        ].map((c) => (
          <div key={c.name} className="group relative h-64 rounded-2xl overflow-hidden border border-brand-border cursor-pointer hover:border-brand-accent transition-colors" onClick={() => { window.location.href = '/shop'; }}>
            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80" alt={c.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{c.name}</h3>
                <p className="text-white/90 text-sm">{c.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
