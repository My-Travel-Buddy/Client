import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { login } from "../api/auth";
import FormField from "../components/FormField";
import { saveItinerary } from "../api/client";

// Check that the login fields are not empty.
const validateForm = (formFields) => {
  const errors = {};

  if (!formFields.identifier) {
    errors.identifier = "Email or username is required";
  }

  if (!formFields.password) {
    errors.password = "Password is required";
  }

  return errors;
};

// Login page.
function Login({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithRedirect } = useAuth0(); // Used for Auth0 login.

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Store the email/username and password.
  const [formData, setFormData] = useState({ identifier: "", password: "" });

  // Go back to the page the user wanted after login.
  const redirectTo = location.state?.from ?? "/trips";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));

    // Clear the error when the user changes the field.
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    // Stop the page from reloading.
    event.preventDefault();

    const formErrors = validateForm(formData);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setIsLoading(true);

    try {
      // Send the login information to the backend.
      const loggedInUser = await login(formData);
      console.log("LOGIN RESPONSE:", loggedInUser);

      // Update the logged-in user in App.
      setUser(loggedInUser);

      const pendingItinerary = sessionStorage.getItem("pendingItinerary");

      if (pendingItinerary) {
        console.log("PENDING ITINERARY FOUND");

        const itinerary = JSON.parse(pendingItinerary);

        console.log("ITINERARY:", itinerary);

        const savedTrip = await saveItinerary(itinerary);

        console.log("ITINERARY SAVED:", savedTrip);

        sessionStorage.removeItem("pendingItinerary");

        navigate("/trips", { replace: true });
        return;
      }

      navigate(redirectTo, { replace: true }); // Do not return to login with Back.
    } catch (error) {
      // Show the login error.
      setErrors({ general: error.message });
    } finally {
      // Stop the loading state.
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-(--border) p-6 shadow-(--shadow) sm:p-8">
        <h1 className="mb-1 text-3xl font-semibold text-(--text-h)">Log in</h1>
        <p className="mb-6 text-sm">
          Welcome back — pick up where you left off.
        </p>

        {errors.general && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500"
          >
            {errors.general}
          </p>
        )}

        {/* Use our own validation messages. */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField
            label="Email or username"
            name="identifier"
            placeholder="you@example.com"
            autoComplete="username"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            // Let the browser autofill the saved password.
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-md bg-(--accent) px-4 py-2.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Logging in…" : "Log in"}
          </button>
        </form>

        {/* Auth0 login option. */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-(--border)" />
          <span className="text-xs tracking-wide uppercase">or</span>
          <span className="h-px flex-1 bg-(--border)" />
        </div>

        <button
          type="button"
          onClick={() => loginWithRedirect()}
          className="w-full rounded-md border border-(--border) px-4 py-2.5 font-medium transition hover:text-(--text-h)"
        >
          Continue with Auth0
        </button>

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-(--accent) hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
