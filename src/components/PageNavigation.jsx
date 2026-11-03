import React from 'react';
import { ChevronRight } from 'lucide-react';
import { pageFor, routeHref, routeKey } from '../navigation';

export default function PageNavigation({ currentPage }) {
  const page = pageFor(currentPage);
  if (page?.section || routeKey(currentPage) === '#scrap') return null;
  return (
    <nav className="page-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href={routeHref('#home')}>Home</a></li>
        <li><ChevronRight size={16} aria-hidden="true" /><span aria-current="page">{page?.title || 'Page not found'}</span></li>
      </ol>
    </nav>
  );
}
