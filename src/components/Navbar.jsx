import { NavLink } from 'react-router';

// NavLink is like an <a> tag but for client-side routing: it navigates without
// a full page reload, and it tells us when its route is active so we can style it.
export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'text-[var(--accent)]' : 'hover:text-[var(--text-h)]'
    }`;

  return (
    <header className='border-b border-(--border)'>
      <nav className='mx-auto flex max-w-3xl items-center gap-2 px-4 py-3'>
        <NavLink
          to='/'
          className='mr-auto text-lg font-semibold text-(--text-h)'
        >
          Capstone
        </NavLink>
        {/* `end` makes "Home" active only on "/" exactly, not on every route. */}
        <NavLink to='/' end className={linkClass}>
          Home
        </NavLink>
        <NavLink to='/trips' className={linkClass}>
          Trips
        </NavLink>
      </nav>
    </header>
  );
}
