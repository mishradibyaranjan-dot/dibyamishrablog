import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';

const labels: Record<string, string> = { jobs:'Jobs', research:'Research', about:'About', expertise:'Expertise', contact:'Contact', 'resume-analyzer':'Resume Comparison', 'interview-prep':'Interview Preparation', 'my-career':'My Career', 'case-studies':'Case Studies', saved:'Saved Jobs', alerts:'Job Alerts', sources:'Sources', remote:'Remote Jobs', learn:'Learn', newsletter:'Newsletter', guide:'Guided Tour', trust:'Trust & Privacy', leadership:'Leadership', experience:'Experience', certifications:'Certifications', achievements:'Achievements' };
const linkedParents = new Set(['/jobs','/research','/newsletter','/learn']);
export function ContextNavigation() {
  const location = useRouterState({ select:s => s.location });
  if (location.pathname === '/' || location.pathname.startsWith('/admin') || ['/auth','/reports'].includes(location.pathname)) return null;
  const segments = location.pathname.split('/').filter(Boolean);
  return <nav aria-label="Page breadcrumbs" className="experience-breadcrumbs mx-auto max-w-7xl px-4 pt-5 text-sm sm:px-6 lg:pl-24">
    <ol className="flex min-w-0 flex-wrap items-center gap-2 text-muted-foreground">
      <li><Link to="/" aria-label="Home"><Home className="h-4 w-4"/></Link></li>
      {segments.map((segment,i) => {
        const path = '/' + segments.slice(0,i+1).join('/');
        const current = i === segments.length-1;
        const label = labels[segment] ?? segment.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
        return <li key={path} className="flex min-w-0 items-center gap-2"><ChevronRight aria-hidden className="h-3 w-3 shrink-0"/>{!current && linkedParents.has(path) ? <Link to={path as '/jobs'} className="hover:underline">{label}</Link> : <span aria-current={current?'page':undefined} className="max-w-64 truncate font-medium text-foreground">{label}</span>}</li>;
      })}
    </ol>
  </nav>;
}