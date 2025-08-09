export default function UmamiScript() {
  const umamiUrl = import.meta.env.VITE_UMAMI_URL;
  const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

  if (!umamiUrl || !umamiWebsiteId) {
    console.warn(
      'Umami analytics script not loaded: missing environment variables.',
    );
    return null;
  }

  return (
    <script defer src={umamiUrl} data-website-id={umamiWebsiteId}></script>
  );
}
