import { Navigate, useLocation } from "react-router";

// Protects pages that require the user to be logged in.
// Show a loading message while checking the session.
// Send logged-out users to the login page.
// Show the page if the user is logged in.
export default function ProtectedRoute({ user, isLoading, children }) {
  const location = useLocation();

  // Wait until the login check is finished.
  if (isLoading) return <p>Checking your session…</p>;

  // Send logged-out users to login and remember the page they wanted to visit.
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
