import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight, Bot, Cloud, BriefcaseBusiness, FileSearch, GraduationCap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/cinematic/Reveal';
import { trackEvent } from '@/lib/analytics';
import { pageOgImages } from '@/lib/og-images';

export function FutureHomeHero() {
  return <>
    <section className="future-home-hero" aria-labelledby="future-home-title">
      <img src={pageOgImages.home} width={1200} height={630} fetchPriority="high" loading="eager" decoding="async" alt="Glass cloud infrastructure connected to intelligent enterprise platforms" className="future-hero-image"/>
      <div className="future-hero-copy">
        <p className="future-kicker"><span/>Vice President &amp; Country Head · Crystal Tech Ventures</p>
        <h1 id="future-home-title">Dibya Ranjan<br/>Mishra<span className="hero-accent">Intelligence.<br/>Built for impact.</span></h1>
        <p className="future-hero-description">AI strategy, cloud-native platforms and engineering leadership. From ambitious ideas to enterprise outcomes.</p>
        <div className="flex flex-wrap gap-3"><Button size="lg" asChild><Link to="/contact" onClick={()=>trackEvent('hero_cta_click',{cta:'discuss_transformation'})}>Let’s build what’s next<ArrowRight/></Link></Button><Button size="lg" variant="outline" asChild><Link to="/projects">Explore the work<ArrowUpRight/></Link></Button></div>
        <nav aria-label="Executive portfolio" className="future-profile-links">{([{to:'/about',label:'Executive profile'},{to:'/experience',label:'Experience'},{to:'/leadership',label:'Leadership'},{to:'/achievements',label:'Achievements'},{to:'/certifications',label:'Certifications'},{to:'/blog',label:'Insights'}] as const).map(item=><Link key={item.to} to={item.to}>{item.label}</Link>)}<a href="/api/download/pdf?doc=executive-summary">Download resume<ArrowUpRight className="h-3 w-3"/></a></nav>
      </div>
      <div className="future-hero-caption"><span>STRATEGY → ARCHITECTURE → EXECUTION</span><span>AI / CLOUD / GCC</span></div>
    </section>
    <nav aria-label="Explore workspaces" className="future-discovery-strip">{([{to:'/projects',icon:Layers,title:'Enterprise platforms',label:'Explore the work'},{to:'/research',icon:Bot,title:'Research & perspectives',label:'Ideas into practice'},{to:'/jobs',icon:BriefcaseBusiness,title:'Career opportunities',label:'Verified openings'}] as const).map(item=><Link key={item.to} to={item.to}><item.icon className="h-5 w-5 text-primary"/><span><strong>{item.title}</strong><small>{item.label}</small></span><ArrowUpRight className="ml-auto h-5 w-5"/></Link>)}</nav>
  </>;
}

export function FutureWorkspaceShowcase() {
 return <section className="future-showcase" aria-labelledby="workspace-showcase-title"><Reveal><div className="future-showcase-heading"><p className="text-sm font-semibold text-primary">THE CAREER WORKSPACE</p><h2 id="workspace-showcase-title">Your next chapter.<br/>One connected workspace.</h2><p className="mt-4 max-w-xl text-muted-foreground">Verified opportunities, evidence-based resume observations and focused interview preparation.</p></div></Reveal><div className="future-workflow">{([{to:'/jobs',icon:BriefcaseBusiness,title:'Discover',body:'Explore verified jobs from official employer feeds.'},{to:'/resume-analyzer',icon:FileSearch,title:'Refine',body:'Review your resume with evidence-based observations.'},{to:'/interview-prep',icon:GraduationCap,title:'Prepare',body:'Build a focused interview preparation session.'}] as const).map((item,i)=><Reveal key={item.to} delay={i*.08}><Link to={item.to} className="future-workflow-step"><span className="workflow-number">0{i+1}</span><item.icon className="h-7 w-7 text-primary"/><h3>{item.title}</h3><p>{item.body}</p><ArrowRight className="h-5 w-5 text-primary"/></Link></Reveal>)}</div><Button variant="outline" asChild><Link to="/my-career">Open My Career<ArrowRight/></Link></Button></section>;
}