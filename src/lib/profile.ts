// Verified profile facts (sourced from the resume) shared by About and portfolio pages.
export const timeline = [
  { year: "Jul 2026 — Present", role: "Vice President & Country Head — Crystal Tech Ventures", text: "Leading ground-up setup of a Global Capability Centre (GCC) in India for an international retail & supply chain client. Own country P&L, org design, hiring, delivery governance, and the multi-year roadmap for supply chain visibility, inventory intelligence, and retail modernisation — embedding cloud-native, AI-first, and DevSecOps practices from day one." },
  { year: "Nov 2022 — Jul 2026", role: "Head of Engineering & Global Application Support — Inchcape Shipping Services", text: "Led 2 cross-functional teams of 40 engineers across 5 time zones on a cloud-native vessel management platform (onboarding, customs, prefunding, agent payments) integrated with 5+ SaaS providers. Cut recurring incidents 76%, lifted release frequency from monthly to bi-weekly (<2% rollback), and reduced feature time-to-market by 35%." },
  { year: "Dec 2019 — Jun 2022", role: "Director of Delivery — Centific India (Microsoft Partner)", text: "Directed a 450-person delivery org (15 Managers, 70 Tech Leads, 130 Senior, 235 Junior) with $8M CAPEX/OPEX. Delivered Microsoft internal products, Data Platform & BI for 10,000+ employees, and AI human-action detection systems for 3 retail/supply-chain clients (−40% manual monitoring). Grew account revenue $1M → $20M in 24 months." },
  { year: "Jul 2017 — Dec 2019", role: "Delivery Manager — Deloitte Support Services", text: "Architected a unified web/mobile platform for Deloitte University (Texas), replacing 5 tools and automating 100% of event lifecycle for 2,000+ annual guests. 10+ weekly deployments with zero critical outages over 2.5 years; customer complaints −45%." },
  { year: "Mar 2011 — Apr 2017", role: "Senior Consultant — BFSI Domain SME — Capgemini", text: "SME for Banking & Payments across 6 engagements (Global Payments, Bank of America, Selective Insurance) spanning 20+ US states. Architected Biller Advantage — merchant onboarding compressed 3 months → 4 hours (98%). Boarding & Servicing platform ran at 99.9% uptime." },
  { year: "Jan 2009 — Dec 2011", role: "Senior Software Engineer — Telecom SME — CGI", text: "Designed and built the Payment Engine for Bell Canada serving millions of subscribers. Led production support with sub-4-hour P1 SLA and weekly stakeholder reviews." },
  { year: "Jun 2006 — Dec 2008", role: "Software Engineer — Accenture India", text: "Built and supported web applications for Aflac, AAA, and Auto Club across 3 concurrent insurance client programmes." },
];

export const skillGroups = [
  { title: "AI, ML & Agentic AI", items: ["LLM Integration & Prompt Engineering", "Agentic AI System Design", "Model Context Protocol (MCP)", "AI Product Strategy & Roadmap", "MLOps & AI Automation Pipelines", "GenAI Platforms (ChatGPT, Gemini, Claude)", "Human Action Detection (CV/ML)"] },
  { title: "Cloud & Infrastructure", items: ["AWS", "Azure", "GCP", "Cloud-Native Architecture", "DevSecOps & MLOps Pipelines", "CI/CD & Release Engineering", "Microservices & API Design", "Infrastructure as Code (IaC)", "Docker", "Kubernetes", "GitHub"] },
  { title: "Retail & Supply Chain", items: ["GCC Setup & Scaling", "Supply Chain Visibility & Automation", "Vessel / Fleet & Logistics Platforms", "Retail AI & Inventory Intelligence", "FinTech & BFSI Platforms", "Cross-Border Operations"] },
  { title: "Technology Stack", items: [".NET Core / C#", "React", "Angular", "TypeScript", "Node.js", "Python", "SQL / NoSQL / Data Platforms", "REST APIs", "BI & Analytics", "Mobile App Development"] },
  { title: "Product Management", items: ["Product Roadmap Ownership", "Greenfield SaaS Product Builds", "Backlog Prioritisation & Grooming", "PI Planning & SAFe 6.0 Execution", "Presales, POC & Bid Management", "UX-Driven Feature Definition"] },
  { title: "Leadership & Delivery", items: ["P&L & Budget ($28M+)", "OKR Cascading", "Talent & Succession Planning", "C-Suite Engagement", "Vendor & Contract Mgmt", "SAFe 6.0", "Scrum", "ITIL Service Mgmt", "Enterprise Architecture", "Lean Six Sigma", "Risk & Issue Management", "SLA / KPI Governance"] },
];

export const education = [
  { school: "Utkal University, Odisha", degree: "Master of Computer Applications (MCA)", year: "2006" },
  { school: "Utkal University, Odisha", degree: "Bachelor of Computer Applications (BCA)", year: "2004" },
];

export const keyAchievements = [
  { k: "Revenue Growth", v: "Scaled portfolio $1M → $20M in 24 months via presales & POC-led bids." },
  { k: "Cost Savings", v: "~$2M saved by renegotiating 6 vendor contracts and overhauling governance." },
  { k: "Delivery Acceleration", v: "200% delivery speed and 300% application performance uplift." },
  { k: "Incident Reduction", v: "76% incident cut (3,800 → 900) via AI-driven automation and RCA." },
  { k: "Zero-Outage Delivery", v: "Zero critical outages across 10+ weekly deployments over 2.5 years." },
  { k: "Budget Authority", v: "$28M+ annual CAPEX/OPEX authority, reporting to C-suite." },
  { k: "Org Building", v: "Built & scaled 3 engineering orgs ground-up, tech leads to senior directors." },
  { k: "Global Alignment", v: "OKRs cascaded across 500+ engineers, 4 BUs, India · Europe · Americas." },
];

export const categories = ["All", "AI", "Cloud", "Leadership", "Delivery", "Engineering"] as const;

export type Category = (typeof categories)[number];

export interface Certification {
  name: string;
  category: Category;
  year?: string;
}

export const certifications: Certification[] = [
  { name: "Model Context Protocol (MCP): Hands-On with Agentic AI", category: "AI", year: "2026" },
  { name: "Agentic AI Fundamentals: Architectures, Frameworks & Applications — LinkedIn", category: "AI", year: "2026" },
  { name: "Getting Started with Generative AI in Azure — Microsoft", category: "AI", year: "2026" },
  { name: "Advanced AI Analytics on AWS (Bedrock, Q, SageMaker, QuickSight)", category: "AI", year: "2026" },
  { name: "Learning Amazon Bedrock — AWS", category: "AI", year: "2026" },
  { name: "Claude 101 / Claude Code — Anthropic", category: "AI", year: "2026" },
  { name: "Prompt Engineering — House of Edtech", category: "AI", year: "2026" },
  { name: "AWS Certified Cloud Practitioner (CLF-C02) Cert Prep — AWS", category: "Cloud", year: "2025" },
  { name: "Google Cloud Foundations — LinkedIn", category: "Cloud", year: "2025" },
  { name: "SAFe 6.0 — Scaled Agile Framework Complete Course", category: "Leadership", year: "2025" },
  { name: "CSM — Certified Scrum Master, Scrum Alliance", category: "Leadership", year: "2017" },
  { name: "Lean Six Sigma Foundations — PMIEF & LinkedIn", category: "Leadership" },
  { name: "Building High-Performance Teams", category: "Leadership" },
  { name: "Strategic Project Risk Management", category: "Delivery" },
  { name: "Docker for Developers", category: "Engineering" },
];

export const summaryCert = "60+ certifications across AI, Cloud, Leadership & Delivery";


export const languages = [
  { name: "English", level: "C1 — Advanced" },
  { name: "Hindi", level: "C1 — Advanced" },
  { name: "Bengali", level: "A2 — Elementary" },
  { name: "Punjabi", level: "A1 — Beginner" },
];
