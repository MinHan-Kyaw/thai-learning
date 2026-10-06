import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface BackLinkProps {
  to: string;
  children: ReactNode;
}

const BackLink = ({ to, children }: BackLinkProps) => (
  <Link
    to={to}
    className="inline-flex min-h-11 items-center gap-1 self-start rounded-xl font-bold text-brand no-underline hover:underline"
  >
    <span aria-hidden="true">←</span>
    <span className="sr-only">Back to</span> {children}
  </Link>
);

export default BackLink;
