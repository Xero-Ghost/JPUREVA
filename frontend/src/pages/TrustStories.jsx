import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function TrustStories() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/trust-stories`)
      .then(res => res.json())
      .then(data => { setBlocks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Helper to extract Instagram reel ID
  const extractInstagramId = (url) => {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Helper to extract YouTube video ID
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const renderBlock = (block) => {
    const { block_type, config, testimonial } = block;

    switch (block_type) {
      case 'testimonial':
        return testimonial ? (
          <div className="card-premium bg-white p-8">
            <div className="text-4xl text-primary/20 font-serif leading-none mb-4">&ldquo;</div>
            <p className="font-quote text-on-background/80 mb-6 leading-relaxed">{testimonial.content}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {testimonial.name?.charAt(0)}
              </div>
              <div>
                <p className="font-label-caps text-on-background">{testimonial.name}</p>
                <p className="text-xs text-on-surface/60">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-premium bg-white p-8 flex items-center justify-center text-on-surface/40 h-48">
            <p>Testimonial not found</p>
          </div>
        );

      case 'image':
        return (
          <div className="rounded-2xl overflow-hidden hover-lift">
            <div className="relative">
              <img
                src={config.image_url}
                alt={config.caption || 'Trust Story'}
                className="w-full h-64 object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {config.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-sm font-medium">{config.caption}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'video': {
        const instaId = extractInstagramId(config.video_url);
        const ytId = extractYouTubeId(config.video_url);
        return (
          <div className="rounded-2xl overflow-hidden hover-lift">
            {instaId ? (
              <div className="reel-embed-container mx-auto">
                <iframe
                  src={`https://www.instagram.com/reel/${instaId}/embed/`}
                  title={config.caption || 'Instagram Reel'}
                  allowFullScreen
                />
              </div>
            ) : ytId ? (
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={config.caption || 'Video'}
                  className="w-full h-full rounded-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : config.video_url ? (
              <video controls className="w-full rounded-2xl" preload="metadata">
                <source src={config.video_url} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="aspect-video bg-surface-container-high rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-on-surface/30 mr-2">videocam_off</span>
                <p className="text-on-surface/50">Video unavailable</p>
              </div>
            )}
            {config.caption && (
              <p className="mt-3 text-sm text-on-surface/70 px-1">{config.caption}</p>
            )}
          </div>
        );
      }

      case 'text':
        return (
          <div className="card-premium bg-white p-8">
            {config.title && (
              <h3 className="font-headline-lg text-xl text-on-background mb-3">{config.title}</h3>
            )}
            <p className="text-on-surface/80 leading-relaxed whitespace-pre-wrap">{config.body}</p>
          </div>
        );

      case 'document':
        return (
          <div className="card-premium bg-white p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">description</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-label-caps text-on-background mb-1 truncate">{config.title || 'Document'}</h4>
              {config.description && (
                <p className="text-sm text-on-surface/60 mb-3">{config.description}</p>
              )}
              <a
                href={config.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                View Document
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop text-center">
        <div className="max-w-container-max mx-auto">
          <span className="inline-block font-label-caps text-primary bg-primary/5 px-4 py-1.5 rounded-full mb-6">
            Verified Experiences
          </span>
          <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-4">
            Trust Stories
          </h1>
          <p className="font-body-lg text-on-surface/70 max-w-xl mx-auto">
            Real stories from verified consumers, partners, and industry experts.
          </p>
        </div>
      </section>

      {/* Content Blocks */}
      <section className="px-margin-mobile md:px-margin-desktop pb-stack-lg">
        <div className="max-w-container-max mx-auto">
          {loading ? (
            /* Skeleton loading state */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-surface-container-high rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : blocks.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-on-surface/20 mb-4 block">auto_stories</span>
              <h3 className="font-headline-lg text-xl text-on-surface/50 mb-2">Stories Coming Soon</h3>
              <p className="text-on-surface/40">Our trust stories are being curated. Check back soon!</p>
            </div>
          ) : (
            /* Dynamic grid of blocks */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {blocks.map(block => (
                <div key={block.id} className={block.block_type === 'video' ? 'md:col-span-2' : ''}>
                  {renderBlock(block)}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
