import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { signup } from "../api/auth";
import FormField from "../components/FormField";

// Check the signup form and return any errors.
const validateForm = (formFields) => {
  const errors = {};

  if (!formFields.username) {
    errors.username = "Username is required";
  } else if (
    formFields.username.length < 3 ||
    formFields.username.length > 20
  ) {
    errors.username = "Username must be between 3 and 20 characters";
  }

  if (!formFields.email) {
    errors.email = "Email is required";
  } else if (!formFields.email.includes("@")) {
    errors.email = "Enter a valid email address";
  }

  if (!formFields.password) {
    errors.password = "Password is required";
  } else if (formFields.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

// Signup page.
function Signup({ setUser }) {
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0(); // Used for Auth0 signup.

  // Store form errors.
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Store the signup form values.
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Update the form field the user changes.
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
      // Send the signup information to the backend.
      const newUser = await signup(formData);

      // Update the logged-in user in App.
      setUser(newUser);

      navigate("/"); // Go to the home page after signup.
    } catch (error) {
      // Show the signup error.
      setErrors({ general: error.message });
    } finally {
      // Stop the loading state.
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-(--border) p-6 shadow-(--shadow) sm:p-8">
        <h1 className="mb-1 text-3xl font-semibold text-(--text-h)">Sign up</h1>
        <p className="mb-6 text-sm">Create an account to start adding tasks.</p>

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
            label="Username"
            name="username"
            placeholder="ada_lovelace"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            // Let the browser suggest a new password.
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-md bg-(--accent) px-4 py-2.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Auth0 signup option. */}
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
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-(--accent) hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;
