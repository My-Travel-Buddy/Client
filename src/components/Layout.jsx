import { Outlet } from 'react-router';
import Navbar from './Navbar';

// Layout is the frame every page shares: navbar on top, page below.
// <Outlet /> is the slot where the matched child route renders.
// App passes these down — without accepting them here, the Navbar never
// learns who is logged in and keeps showing "Log in / Sign up".
export default function Layout({ user, onLogout, authError, isLoading }) {
  return (
    <div className="flex min-h-screen flex-col text-left">
      <Navbar user={user} onLogout={onLogout} isLoading={isLoading} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {authError && <p className="auth-error">{authError}</p>}

        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="site-footer-brand">My Travel Buddy</p>

          <p className="site-footer-tagline">
            Plan smarter, personalize every day, and prepare for your trip in
            one place.
          </p>

          {/* Reads the year at run time, so it never goes stale. */}
          <p className="site-footer-legal">
            © {new Date().getFullYear()} My Travel Buddy
          </p>
        </div>
      </footer>
    </div>
  );
}


