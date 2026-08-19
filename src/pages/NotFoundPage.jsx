import { Link } from "react-router";

// Show this page when the route does not exist.
export default function NotFoundPage() {
  return (
    <section className="text-center">
      <h1 className="text-4xl font-semibold text-(--text-h)">404</h1>
      <p className="mt-2">That page doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block text-(--accent)">
        Go home
      </Link>
    </section>
  );
}
