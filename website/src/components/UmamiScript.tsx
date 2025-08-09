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

  if (loading) return null;

  if (!umamiUrl || !umamiWebsiteId) {
    console.warn(
      'Umami analytics script not loaded: missing environment variables.',
    );
    return null;
  }

  return (
    <script async src={umamiUrl} data-website-id={umamiWebsiteId}></script>
  );
}
