import { Outlet } from "react-router";
import Navbar from "./Navbar";

export default function Layout({ user, onLogout, authError }) {
  return (
    <div className="flex min-h-screen flex-col text-left">
      {/* Show the navigation bar at the top of every page. */}
      <Navbar user={user} onLogout={onLogout} />

      {/* Show an authentication error if there is one. */}
      {authError && (
        <p className="mx-auto mt-4 w-full max-w-3xl px-4 text-red-500">
          {authError}
        </p>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Show the error inside the main page area too. */}
        {authError && <p className="auth-error">{authError}</p>}

        {/* Show the page that matches the current route. */}
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="site-footer-brand">My Travel Buddy</p>

          <p className="site-footer-tagline">
            Plan smarter, personalize every day, and prepare for your trip in
            one place.
          </p>

          {/* Show the current year automatically. */}
          <p className="site-footer-legal">
            © {new Date().getFullYear()} My Travel Buddy
          </p>
        </div>
      </footer>
    </div>
  );
}
