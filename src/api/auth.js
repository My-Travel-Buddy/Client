// api/auth.js — handles requests related to user authentication.

// Backend URL used for API requests.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ---------------------------------------------------------------------------
// Email and password login
// ---------------------------------------------------------------------------

// Create a new user account.
// Also logs the user in by receiving a cookie from the backend.
export async function signup(credentials) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    // Send and receive login cookies.
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    // Convert the form data to JSON before sending it.
    body: JSON.stringify(credentials),
  });

  // Show an error if signup fails.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Signup failed (${res.status})`);
  }

  return res.json();
}

// Log in with an email or username and password.
export async function login(credentials) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  // Show an error if login fails.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Login failed (${res.status})`);
  }

  return res.json();
}

// Log the user out by asking the backend to clear the cookie.
export async function logoutRequest() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  // Show an error if logout fails.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Logout failed (${res.status})`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Auth0 login
// ---------------------------------------------------------------------------

// Save or find an Auth0 user in our database.
export async function syncUser(token, profile) {
  const res = await fetch(`${BASE_URL}/auth/auth0`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      // Send the Auth0 access token to the backend.
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  // Show an error if syncing the user fails.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not sync user (${res.status})`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Works with either login method
// ---------------------------------------------------------------------------

// Get the currently logged-in user.
export async function getMe(token) {
  const headers = { "Content-Type": "application/json" };

  // Add the Auth0 token when one is available.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/auth/me`, {
    credentials: "include",
    headers,
  });

  // Show an error if no logged-in user is found.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Not logged in (${res.status})`);
  }

  return res.json();
}

// Test whether authentication is working.
export async function getProtected(token) {
  const headers = { "Content-Type": "application/json" };

  // Add the Auth0 token when one is available.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api/protected`, {
    credentials: "include",
    headers,
  });

  // Show an error if the request fails.
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}
