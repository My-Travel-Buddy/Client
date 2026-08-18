import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getProtected } from "../api/auth";

// Test the protected backend route.
// This page only works when the user is logged in.
//
// Password login uses the login cookie.
// Auth0 login uses an Auth0 token.
// The backend accepts either one.
export default function ProtectedPage({ user }) {
  const { isAuthenticated: isAuth0User, getAccessTokenSilently } = useAuth0();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleTest() {
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      // Get an Auth0 token only if the user logged in with Auth0.
      const token = isAuth0User ? await getAccessTokenSilently() : undefined;

      const data = await getProtected(token);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">Protected</h1>

      <p className="mb-2">
        You can only see this page while logged in
        {user?.username ? `, ${user.username}` : ""}.
      </p>
      <p className="mb-4 text-sm">
        Signed in with{" "}
        <code>{isAuth0User ? "an Auth0 token" : "our own JWT cookie"}</code>.
      </p>

      <button
        onClick={handleTest}
        disabled={isLoading}
        className="rounded-md bg-(--accent) px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isLoading ? "Calling…" : "Call /api/protected"}
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {result && (
        <pre className="mt-4 overflow-x-auto rounded-md border border-(--border) p-4 text-left text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}
