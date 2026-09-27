import { Link, NavLink, Outlet } from 'react-router';

import { classNames } from '../../helpers/classNames';

import styles from './index.module.css';

const NAV_ITEMS = [
  { to: '/consonants', label: 'Consonants' },
  { to: '/practice', label: 'Practice' },
];

const Layout = () => (
  <div className={styles.layout}>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            ก
          </span>
          <span className={styles.brandText}>Thai Learning</span>
        </Link>
        <nav aria-label="Main">
          <ul className={styles.nav} role="list">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => classNames(styles.navLink, isActive && styles.navLinkActive)}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
    <main className={styles.main}>
      <Outlet />
    </main>
  </div>
);

export default Layout;
