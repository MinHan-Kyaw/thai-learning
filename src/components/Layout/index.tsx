import { Link, NavLink, Outlet } from 'react-router';

import { classNames } from '../../helpers/classNames';

const NAV_ITEMS = [
  { to: '/consonants', label: 'Consonants' },
  { to: '/practice', label: 'Practice' },
];

const Layout = () => (
  <div className="flex min-h-dvh flex-col">
    <header className="sticky top-0 z-10 border-b-2 border-line bg-surface">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl text-xl font-extrabold text-brand no-underline">
          <span
            className="inline-grid size-9 place-items-center rounded-xl bg-brand font-thai text-xl leading-none font-medium text-white"
            aria-hidden="true"
          >
            ก
          </span>
          <span className="max-xs:sr-only">Thai Learning</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex gap-1" role="list">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    classNames(
                      'inline-flex min-h-11 items-center rounded-xl px-3 py-2 font-bold no-underline hover:bg-brand-light hover:text-brand',
                      isActive ? 'bg-brand-light text-brand' : 'text-ink-muted'
                    )
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
    <main className="mx-auto w-full max-w-content flex-1 px-4 pt-6 pb-12">
      <Outlet />
    </main>
  </div>
);

export default Layout;
