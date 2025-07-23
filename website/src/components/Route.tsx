type RouteProps = {
  url: string;
  children: React.ReactNode;
};
export default function Route({ url, children }: RouteProps) {
  const currentUrl = window.location.pathname;

  if (currentUrl !== url) {
    return null;
  }

  return <>{children}</>;
}
