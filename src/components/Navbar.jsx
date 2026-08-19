import { NavLink } from "react-router";

// NavLink changes pages without reloading the whole app.
// It also tells us which link is currently active.

// Navbar receives the user information and logout function from App.

// ---------- REMOVED in commit 373b5d4 ----------
// export default function Navbar({ user, onLogout }) {
// ---------- end removed ----------
export default function Navbar({ user, onLogout, isLoading }) {
  // Style the active navigation link differently.
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "text-(--accent)" : "hover:text-(--text-h)"
    }`;

  return (
    <header className="border-b border-(--border)">
      <nav className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
        <NavLink
          to="/"
          className="mr-auto text-lg font-semibold text-(--text-h)"
        >
          My travel buddy
        </NavLink>

        {/* Keep Discovery active only on the home page. */}
        <NavLink to="/" end className={linkClass}>
          Discovery
        </NavLink>

        <NavLink to="/trips" className={linkClass}>
          My Trips
        </NavLink>

        {/* Show this link only when the user is logged in. */}
        {/* {user && (
          <NavLink to='/protected' className={linkClass}>
            Protected
          </NavLink>
        )} */}

        {/* Show logout options when logged in, otherwise show login and signup. */}
        {user ? (
          <>
            <span className="px-2 text-sm">
              {/* Show the username, name, or email. */}
              {user.username || user.name || user.email}
            </span>

            <button
              onClick={onLogout}
              className="rounded-md px-3 py-2 text-sm font-medium hover:text-(--text-h)"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>
              Log in
            </NavLink>

            <NavLink
              to="/signup"
              className="rounded-md bg-(--accent) px-3 py-2 text-sm font-medium text-white"
            >
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
