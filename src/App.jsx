import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import Confirmation from "./pages/Confirmation";
import TripDetails from "./pages/TripDetails";
import NotFoundPage from "./pages/NotFoundPage";
import Trips from "./pages/Trips";
import "./App.css";
import ProtectedPage from "./pages/ProtectedPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { getMe, syncUser, logoutRequest } from "./api/auth";

// App handles the routes and the logged-in user.
function App() {
  // Store the logged-in user.
  const [user, setUser] = useState(null);

  // Track whether we are checking the login session.
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Store an Auth0 error.
  const [authError, setAuthError] = useState(null);

  // Get Auth0 login information and functions.
  const {
    isAuthenticated: isAuth0User,
    user: auth0User,
    isLoading: isAuth0Loading,
    getAccessTokenSilently,
    logout: auth0Logout,
  } = useAuth0();

  // Track whether the app is still checking the user's login.
  const isLoading =
    isCheckingSession || isAuth0Loading || (isAuth0User && !user && !authError);

  // Check if the user is already logged in when the app loads.
  useEffect(() => {
    async function checkIfLoggedIn() {
      try {
        const me = await getMe(); // Use the login cookie.
        setUser(me);
      } catch {
        setUser(null); // No valid login.
      } finally {
        setIsCheckingSession(false);
      }
    }

    checkIfLoggedIn();
  }, []);

  // Save or find the Auth0 user in our database.
  useEffect(() => {
    if (!isAuth0User || !auth0User) return;

    async function saveAuth0User() {
      try {
        const token = await getAccessTokenSilently(); // Get the Auth0 token.
        const dbUser = await syncUser(token, {
          // Use the Auth0 nickname or part of the email as the username.
          username: auth0User.nickname || auth0User.email?.split("@")[0],
        });
        setUser(dbUser);
        setAuthError(null);
      } catch (error) {
        // Show an error if the Auth0 user cannot be loaded.
        setAuthError(
          `Signed in with Auth0, but we couldn't load your account: ${error.message}`,
        );
      }
    }

    saveAuth0User();
  }, [isAuth0User, auth0User, getAccessTokenSilently]);

  // Log the user out.
  async function handleLogout() {
    try {
      await logoutRequest();
    } catch (error) {
      // Remove the user from the page even if logout fails.
      console.error("Logout failed:", error.message);
    }

    setUser(null);
    setAuthError(null);

    if (isAuth0User) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }
  }

  return (
    <Routes>
      {/* Show all pages inside Layout. */}
      <Route
        element={
          <Layout
            user={user}
            onLogout={handleLogout}
            authError={authError}
            isLoading={isLoading}
          />
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/trips/itinerary" element={<Confirmation />} />

        {/* Login and signup are public pages. */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />

        <Route
          path="/trips"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              {/* Pass the user to Trips for the greeting. */}
              {/* was: <Trips />   ← no user prop, hence "traveler" */}
              <Trips user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <TripDetails />
            </ProtectedRoute>
          }
        />

        {/* Only logged-in users can open this route. */}
        <Route
          path="/protected"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <Trips user={user} />
            </ProtectedRoute>
          }
        />

        {/* Protect one trip's details. */}
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <TripDetails />
            </ProtectedRoute>
          }
        />

        {/* Show 404 when no route matches. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
