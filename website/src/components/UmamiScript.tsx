import { useEffect, useState } from 'react';

export default function UmamiScript() {
  const [loading, setLoading] = useState(true);

  const [umamiUrl, setUmamiUrl] = useState<string | null>(null);
  const [umamiWebsiteId, setUmamiWebsiteId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUmamiConfiguration() {
      const response = await fetch('/api/analytics');
      const data = await response.json();

      setUmamiUrl(data.umamiUrl);
      setUmamiWebsiteId(data.websiteId);
      setLoading(false);
    }

    loadUmamiConfiguration();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!umamiUrl || !umamiWebsiteId) {
      console.warn(
        'Umami analytics script not loaded: missing environment variables.',
      );
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = umamiUrl;
    script.setAttribute('data-website-id', umamiWebsiteId);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [umamiUrl, umamiWebsiteId]);

  return null;
}
