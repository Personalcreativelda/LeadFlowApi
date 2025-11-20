import { useEffect } from 'react';

interface MetaPixelProps {
  pixelId?: string;
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  useEffect(() => {
    if (!pixelId) return;

    // Initialize Meta Pixel
    (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    // @ts-ignore
    window.fbq('init', pixelId);
    // @ts-ignore
    window.fbq('track', 'PageView');

    // Cleanup
    return () => {
      // Remove the script if needed
    };
  }, [pixelId]);

  return null;
}

// Helper function to track custom events
export function trackMetaEvent(eventName: string, data?: any) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, data);
  }
}

// Pre-defined event tracking functions
export const metaEvents = {
  lead: (leadData?: any) => trackMetaEvent('Lead', leadData),
  purchase: (value: number, currency = 'USD') => trackMetaEvent('Purchase', { value, currency }),
  addToCart: (data?: any) => trackMetaEvent('AddToCart', data),
  completeRegistration: (data?: any) => trackMetaEvent('CompleteRegistration', data),
  contact: (data?: any) => trackMetaEvent('Contact', data),
  search: (searchString?: string) => trackMetaEvent('Search', { search_string: searchString }),
};
