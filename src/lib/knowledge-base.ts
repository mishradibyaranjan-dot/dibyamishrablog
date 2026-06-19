// Knowledge base content (paraphrased from training documents and site content)
// for in-context chatbot grounding. No company names included.

export const KNOWLEDGE_BASE = `
============================================================
INTRO TO ARTIFICIAL INTELLIGENCE (AI)
============================================================

DEFINITION: AI is the discipline of building systems that perceive, reason,
learn, and act. A useful hierarchy is: AI → Machine Learning (learns patterns
from data) → Deep Learning (neural-network-heavy subset of ML) → Generative AI
and AI Agents (application layers).

HISTORY: Alan Turing's 1950 paper reframed "can machines think?" as an
operational test. The 1955 Dartmouth proposal coined the term "Artificial
Intelligence." Major eras: symbolic reasoning, expert systems, statistical
learning, neural networks (backpropagation in 1980s), deep learning
breakthrough (AlexNet 2012 on ImageNet), transformer attention architecture
(2017), and today's generative + agentic systems.

CORE CONCEPTS:
- Supervised learning: predict labels from labeled examples.
- Unsupervised learning: find structure without labels (e.g., clustering).
- Reinforcement learning: learn by reward signals from an environment.
- Neural networks: layers of weighted units trained by backpropagation.
- Transformers: attention-based architecture powering modern LLMs.
- Generative AI: produces text, images, audio, code.
- AI Agents: model + tools + memory in an observe→decide→act loop.

MODEL FAMILIES & WHEN TO USE:
- Linear / logistic regression: simple baselines for tabular data.
- Decision trees / gradient boosting (XGBoost, LightGBM): strong tabular default.
- CNNs: images.
- RNN / LSTM: legacy sequence modeling.
- Transformers: text, multimodal, foundation models.
- Diffusion models: image / video generation.

AI AGENT PATTERN: observe → decide → use tools → act → evaluate → repeat,
with guardrails, logging, and human review for high-stakes actions. Start
simple (single tool, single step) and add complexity only when needed.

PRACTICAL ENGINEERING: success is less about magic models, more about
problem framing, data quality, evaluation design, safe deployment, monitoring,
and iteration.

RESPONSIBLE AI: privacy, bias, traceability, security, and compliance are
first-class requirements, not afterthoughts. NIST's AI Risk Management
Framework provides one widely cited governance reference.

STARTER STACK: scikit-learn for tabular ML, PyTorch or TensorFlow for custom
deep learning, Hugging Face Transformers for pretrained models, MLflow for
experiment tracking.

KEY TERMS: model, training data, features, labels, loss function, gradient
descent, embeddings, tokens, attention, RAG (Retrieval-Augmented Generation),
fine-tuning, hallucination/confabulation, prompt engineering, evaluation set,
overfitting, regularization, inference latency.

============================================================
INTRO TO CLOUD COMPUTING
============================================================

DEFINITION: Cloud computing is using internet-delivered computing resources
instead of owning and operating all infrastructure. Benefits: elasticity,
speed, global reach, reliability, security capabilities, and a shift from
upfront capital spending to usage-based operational spending.

SERVICE MODELS:
- IaaS (Infrastructure as a Service): core infrastructure — virtual machines,
  storage, networking. You manage OS and apps.
- PaaS (Platform as a Service): managed runtime for deploying applications;
  provider handles infrastructure.
- SaaS (Software as a Service): finished software delivered over the network
  on subscription.
- Serverless / FaaS: provider manages runtime and scaling; you supply code
  and triggers.

DEPLOYMENT MODELS:
- Public cloud: shared provider infrastructure.
- Private cloud: dedicated to a single organization.
- Hybrid cloud: mix of public and private/on-premises.
- Multi-cloud: services from more than one provider.

CORE BUILDING BLOCKS:
- Virtual Machines: virtualized server instances you provision on demand.
- Containers: portable app packaging; Kubernetes orchestrates them.
- Serverless functions: event-driven code with no server management.
- Object storage: simple, durable, universal storage for files and blobs.
- Block / file storage: for VM disks and shared filesystems.
- Networking: virtual private networks, subnets, load balancers, DNS, CDN.
- Identity & Access Management (IAM): who can do what.
- Observability: logs, metrics, traces, alerts.
- Cost management: pricing calculators, budgets, usage reports.

REGIONS & ZONES: Regions are geographic locations. Availability zones are
isolated datacenter groups within a region — running across zones improves
resilience.

CROSS-PROVIDER EQUIVALENTS (common services exist across all major providers):
- Compute: virtual machines / instances
- Containers: managed Kubernetes
- Object storage: blob/object bucket service
- Serverless: function-as-a-service runtime
- Identity: role-based access control / policy
- Cost tools: budgets, billing dashboards

LEARNING PATH: start with VMs → object storage → a small serverless HTTP
function → then containers and managed databases.

KEY TERMS: region, availability zone, scalability, elasticity, high
availability, disaster recovery, IAM, VPC, load balancer, CDN, autoscaling,
spot/preemptible instances, cold start, eventual consistency, SLA.

============================================================
INTRO TO SaaS (SOFTWARE AS A SERVICE)
============================================================

DEFINITION: SaaS is a business and delivery model. Customers subscribe to
software that the provider hosts, operates, secures, and updates over the
network. SaaS = how software is sold and delivered. Multitenancy = how
customers are isolated and served inside the system. These two are often
conflated but are distinct.

TENANCY MODELS (the spectrum):
- Silo: each tenant gets dedicated infrastructure. Highest isolation,
  highest cost, slowest onboarding. Fit: regulated or premium accounts.
- Pool: tenants share the application and data tier, isolated by tenant_id
  with strict enforcement (e.g., PostgreSQL Row Level Security). Lowest
  cost, fastest onboarding, easiest cross-tenant analytics.
- Bridge / Stamps: pooled by default with selective dedicated stamps for
  high-value or regulated tenants — strong default for mid-to-large B2B SaaS.

PRICING MODELS:
- Flat-rate subscription: one recurring price.
- Per-seat: priced by number of users.
- Tiered: bundled feature/limit tiers.
- Usage-based: priced by API calls, storage, AI tokens, etc.
- Freemium: free entry tier; upgrade for more.
- Hybrid: combination — most modern SaaS uses this.

ARCHITECTURE PATTERNS:
- External identity provider (OAuth 2.0 + OpenID Connect). Building your
  own IdP is an antipattern.
- Tenant routing middleware: resolve active tenant from subdomain, header,
  or JWT claim before authorization.
- Tenant-aware data access: enforce tenant_id at the data layer (e.g., RLS
  policies), not just in application code.
- Infrastructure as code, CI/CD, deployment stamps for selective isolation.
- Tenant-aware observability: per-tenant latency, errors, quota usage.
- Tested backup and restore per tenant.

SECURITY FUNDAMENTALS:
- Authentication and authorization alone do NOT guarantee tenant isolation.
  Isolation must be enforced across request path, data, cache, jobs, storage,
  and operations tooling.
- Risks: cross-tenant data leakage, tenant impersonation, IDOR, noisy
  neighbor, broken isolation at any layer.
- Principle: least privilege, audit trails, encryption in transit and at
  rest, zero-trust posture, regular penetration testing.

OPERATIONAL MINIMUMS: route latency, auth failures, DB saturation, cache
hit rate, job lag, webhook failure rate, per-tenant request rate, noisy-tenant
detection, plan-level quota consumption, billing reconciliation lag.

GO-TO-MARKET: B2B SaaS often needs organizations, workspaces, enterprise
SSO/SAML, granular roles, auditable billing. B2C SaaS optimizes for very
high tenant counts and lighter per-tenant customization.

KEY TERMS: tenant, tenant isolation, multitenancy, deployment stamp, RLS
(Row Level Security), OAuth 2.0, OpenID Connect, PKCE, control plane, data
plane, churn, MRR/ARR, gross margin, entitlement, feature flag.

============================================================
SITE NAVIGATION HINTS
============================================================
- Learn: three tabs — Intro to AI, Intro to Cloud, Intro to SaaS.
- Research: long-form articles and white papers on Generative AI, Agentic AI,
  Cloud Architecture, SaaS, Data, and Engineering Leadership.
- Projects: real-world delivery work spanning data platforms, payment
  engines, and modernization programs.
- Case Studies: outcomes-focused write-ups of large programs.
- About: background, principles, and contact details.
- Contact: get in touch.
`;
