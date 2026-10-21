import type { RagDocumentSeed } from './rag-document.types';

/**
 * Extended demo corpus: e-commerce, SaaS, financial services.
 * Combined with inline demo documents in rag.seed.ts for a larger starter library.
 */
export const demoRagDocuments: RagDocumentSeed[] = [
  // E-commerce & Retail (20 documents)
  {
    title: 'E-commerce Consumer Behavior 2024',
    sourceType: 'market_report',
    industry: 'ecommerce',
    content: `E-commerce sales reached $5.7 trillion globally in 2024. Key trends include mobile-first shopping (67% of traffic), social commerce growth (24% annually), and subscription fatigue (34% cancel within 3 months).

Purchase Decision Factors:
1. Free shipping threshold (78% abandon if not met)
2. Return policy clarity (71% check before purchase)
3. Reviews and ratings (89% read before buying)
4. Price comparison (64% use browser extensions)
5. Trust badges (54% influenced by security indicators)

Cart Abandonment:
- Average rate: 69.8%
- Top reasons: Extra costs (48%), account creation (24%), slow checkout (18%)
- Recovery: Email sequences recover 15-20% of abandoned carts
- SMS: 3x higher open rate than email for cart recovery

Conversion Benchmarks:
- Desktop: 2.5-3.5% average
- Mobile: 1.5-2.5% (improving)
- Tablet: 2.0-3.0%
- B2B e-commerce: 2.8% average`,
  },
  {
    title: 'Pricing Psychology in E-commerce',
    sourceType: 'consumer_research',
    industry: 'ecommerce',
    content: `Pricing psychology significantly impacts conversion. Charm pricing ($9.99 vs $10) increases sales by 8-24% in certain categories. Price anchoring (showing MSRP crossed out) improves perceived value by 32%.

Key Strategies:
- Decoy pricing: 34% choose mid-tier when three options presented
- Bundle pricing: 23% higher AOV when products bundled
- Subscription discount: 15-25% off drives 67% of subscription signups
- Dynamic pricing: 12% revenue lift in travel, 8% in retail

Price Sensitivity by Category:
- Commodities (electronics, books): High sensitivity
- Unique/artisanal: Low sensitivity
- Subscription services: Medium (value perception matters)
- Luxury: Inverted (higher price = higher perceived quality)

Psychological Triggers:
- Scarcity ("Only 3 left"): 68% increase in urgency
- Social proof ("2,341 bought today"): 34% conversion lift
- Loss aversion: "Save $20" outperforms "Get $20 off" by 2:1`,
  },
  {
    title: 'Subscription E-commerce Retention Metrics',
    sourceType: 'industry_analysis',
    industry: 'ecommerce',
    content: `Subscription e-commerce retention varies by category. Beauty and wellness: 45% 6-month retention. Food and beverage: 38%. General merchandise: 28%. Pet supplies: 52% (highest loyalty).

Churn Drivers:
- Forgot they subscribed: 42%
- Found better deal: 38%
- Product fatigue: 34%
- Too expensive: 29%
- Changed needs: 24%

Retention Tactics:
- Pause option: Reduces churn by 18%
- Flexible frequency: 23% improvement in LTV
- Personalization: 31% higher retention
- Loyalty rewards: 15% churn reduction

LTV Benchmarks:
- DTC supplements: $180-320
- Meal kits: $240-480
- Beauty boxes: $120-200
- Coffee subscriptions: $90-180`,
  },
  {
    title: 'D2C Brand Launch Playbook',
    sourceType: 'market_report',
    industry: 'ecommerce',
    content: `Direct-to-consumer brands face rising CAC. Facebook CPM increased 47% since 2020. Successful D2C launches focus on community, content, and retention over pure acquisition.

Launch Sequence:
1. Pre-launch waitlist: 15-25% conversion to first purchase
2. Founder-led marketing: Authenticity drives 3x engagement
3. Influencer micro-campaigns: 2.1% conversion (nano-influencers)
4. Paid acquisition: Only after product-market fit

Unit Economics Targets:
- CAC payback: <12 months for subscription
- LTV:CAC ratio: 3:1 minimum, 5:1 ideal
- Gross margin: 60%+ for D2C viability
- Contribution margin: Positive at first purchase (rare)

Channel Mix (Mature D2C):
- Paid social: 35-45% of acquisition
- Organic/social: 15-25%
- Email/SMS: 20-30% (retention-driven)
- Affiliates: 10-15%
- Retail/wholesale: 5-15%`,
  },
  {
    title: 'Returns and Refunds: Consumer Expectations',
    sourceType: 'consumer_survey',
    industry: 'ecommerce',
    content: `92% of consumers say easy returns influence purchase decisions. Free returns increase conversion by 24% but cost retailers 8-10% of revenue. Return rates: Apparel 25-40%, Electronics 8-12%, Home goods 5-10%.

Consumer Expectations:
- Free return shipping: 78% expect
- Extended return window (30+ days): 64% prefer
- In-store returns for online purchases: 54% value
- Instant refund (before return received): 38% expect from trusted brands

Return Fraud:
- Wardrobing (wear and return): 8% of returns
- Receipt fraud: 3%
- Cost: $24B annually to US retailers
- Mitigation: Restocking fees reduce abuse 23%

Best Practices:
- Clear return policy on product page: 67% conversion lift
- Prepaid return labels: 34% faster return completion
- Return analytics: Identify products with high return rates`,
  },
  {
    title: 'Mobile Commerce Conversion Optimization',
    sourceType: 'technology_report',
    industry: 'ecommerce',
    content: `Mobile commerce represents 58% of e-commerce traffic but only 42% of revenue. Conversion gap: Mobile converts at 1.8% vs desktop 3.2%. Key friction points: Form fields, payment entry, page load speed.

Mobile-Specific Optimizations:
- One-tap checkout (Apple Pay, Google Pay): 2.4x higher conversion
- Thumb-zone design: Primary CTAs in bottom third
- Auto-fill: Reduces form abandonment by 34%
- Progressive Web App: 52% faster load than mobile web

App vs Web:
- App conversion: 3.5% (engaged users)
- Mobile web: 1.8%
- App install rate from web: 2-4%
- App users: 2.3x higher LTV than web-only

Page Speed Impact:
- 1 second delay: 7% conversion reduction
- 3 second delay: 53% mobile abandonment
- Core Web Vitals: 0.1s improvement = 8% conversion lift`,
  },
  {
    title: 'Product Review Impact on Sales',
    sourceType: 'consumer_research',
    industry: 'ecommerce',
    content: `Products with reviews convert 4.6x higher than those without. Optimal review count: 50-100 reviews for trust. Star rating sweet spot: 4.2-4.7 (perfect 5.0 raises suspicion).

Review Behavior:
- 89% read reviews before purchase
- 68% trust reviews from verified purchasers
- 49% filter by 1-star to see complaints
- 34% look for reviews with photos

Negative Review Handling:
- Responding to negative reviews: 45% convert to positive
- Offering resolution publicly: Builds trust
- Fake review detection: 82% of consumers can spot some fakes
- Incentivized reviews: Must disclose (FTC); 23% trust less

Review Request Timing:
- 3-7 days post-purchase: 34% response rate
- Post-delivery confirmation: 28%
- Post-use (subscription): 41% for recurring`,
  },
  {
    title: 'Cross-Border E-commerce Trends',
    sourceType: 'market_analysis',
    industry: 'ecommerce',
    content: `Cross-border e-commerce reached $1.2T in 2024. Top corridors: US-China, US-EU, China-Southeast Asia. Key barriers: Customs (42%), shipping cost (38%), returns (34%), trust (28%).

Localization Requirements:
- Local currency display: 78% prefer
- Local payment methods: 67% (Alipay, iDEAL, etc.)
- Translated product info: 54% require
- Local customer service: 48% expect

Duty and Tax:
- DDP (delivered duty paid): Preferred by 64%
- IOSS (EU): Simplifies VAT for <€150
- De minimis thresholds: Vary by country ($800 US)
- Unexpected fees: 52% cart abandonment cause`,
  },
  {
    title: 'Retail Media and E-commerce Advertising',
    sourceType: 'industry_analysis',
    industry: 'ecommerce',
    content: `Retail media (ads on retailer sites) reached $45B in 2024. Amazon Ads: 22% of US digital ad spend. Walmart Connect, Target Roundel growing 40%+ annually. First-party data advantage drives performance.

Ad Formats:
- Sponsored Products: 68% of retail media spend
- Sponsored Brands: 24%
- Display/OTT: 8%
- CTV on retail: Emerging

Performance Benchmarks:
- ROAS: 4-8x for established brands
- CPC: $0.35-1.20 (category dependent)
- Conversion: 2-4% (higher intent than social)
- Attribution: Last-click dominates; incrementality studies rare

Challenges:
- Walled gardens: Limited cross-platform measurement
- Creative fatigue: Refresh every 2-4 weeks
- Private label competition: Retailers promote own brands`,
  },
  {
    title: 'E-commerce Personalization ROI',
    sourceType: 'technology_report',
    industry: 'ecommerce',
    content: `Personalization drives 10-15% revenue lift for retailers who implement well. Product recommendations: 26% of e-commerce revenue. Personalized email: 6x higher transaction rate than broadcast.

Implementation Levels:
- Basic (browse history): 5-8% lift
- Behavioral (clicks, time on site): 10-12%
- AI-driven (collaborative filtering): 15-25%
- Real-time (session-based): 20-30% (complex)

Data Requirements:
- Minimum 1000 users for meaningful recommendations
- Cold start: Use popularity, category, attributes
- Privacy: 67% willing to share for better experience
- Consent: First-party data critical post-cookie deprecation

Segmentation:
- RFM (recency, frequency, monetary): 80% of value
- Lifecycle stage: New, active, at-risk, churned
- Product affinity: Category and brand preferences`,
  },
  {
    title: 'Livestream Shopping Adoption',
    sourceType: 'trend_report',
    industry: 'ecommerce',
    content: `Livestream shopping reached $480B in China (2024), $32B in US. US growth: 45% annually. Platforms: Amazon Live, TikTok Shop, YouTube Shopping, Instagram. Conversion: 4-9% (vs 2-3% standard).

Format Best Practices:
- Duration: 30-90 minutes optimal
- Host: Influencer or brand ambassador
- Interactivity: Q&A, polls increase engagement 34%
- Limited-time offers: Drive urgency

Consumer Adoption:
- Gen Z: 42% have purchased via livestream
- Millennials: 28%
- Gen X: 12%
- Trust: Authenticity and real-time demos valued`,
  },
  {
    title: 'Buy Now Pay Later (BNPL) Impact',
    sourceType: 'market_analysis',
    industry: 'ecommerce',
    content: `BNPL usage reached 18% of US consumers in 2024. Providers: Klarna, Afterpay, Affirm, PayPal Pay Later. AOV increase: 45% when BNPL offered. Conversion lift: 20-30% at checkout.

Merchant Economics:
- Fee: 2-4% of transaction
- Approval rate: 85-90% (vs 60% for subprime credit)
- Return rate: Slightly higher (8% vs 6%)
- Repeat usage: 67% of BNPL users use again

Consumer Profile:
- 18-34: 34% have used BNPL
- Income $50-100K: Highest adoption
- Use case: Larger purchases, budget management
- Default rates: 2-4% (lower than credit cards for same segment)`,
  },
  {
    title: 'E-commerce Fraud Prevention',
    sourceType: 'industry_analysis',
    industry: 'ecommerce',
    content: `E-commerce fraud cost $48B globally in 2024. Card-not-present fraud: 73% of total. Friendly fraud (chargebacks): 42% of fraud losses. Balance: Block fraud without blocking good customers.

Fraud Types:
- Account takeover: 34% increase YoY
- Synthetic identity: New accounts with fake identity
- Promo abuse: 23% of signups use fake emails
- Return fraud: 8% of returns

Detection Methods:
- ML models: 85% of large retailers use
- Velocity checks: Multiple orders, same card
- Device fingerprinting: Cross-session tracking
- 3DS authentication: Reduces chargebacks 40%

False Positive Trade-off:
- 1% block rate: ~70% fraud caught
- 3% block rate: ~90% fraud caught
- Each 1% block rate: ~2% revenue loss (legitimate customers)`,
  },
  {
    title: 'Sustainable E-commerce Consumer Preferences',
    sourceType: 'consumer_survey',
    industry: 'ecommerce',
    content: `67% of consumers consider sustainability when purchasing. Willingness to pay premium: 34% for sustainable products. Gen Z: 73% consider environmental impact. Transparency: 58% want carbon footprint info.

Sustainable Practices Valued:
- Recyclable packaging: 78%
- Carbon-neutral shipping: 54%
- Sustainable materials: 67%
- Brand certifications (B Corp, etc.): 48%

Greenwashing Risk:
- 68% skeptical of sustainability claims
- Specificity matters: "50% recycled" > "eco-friendly"
- Third-party verification: 54% trust more
- Overclaiming: Regulatory scrutiny increasing`,
  },
  {
    title: 'Marketplace vs Own-Site Strategy',
    sourceType: 'market_report',
    industry: 'ecommerce',
    content: `Amazon captures 38% of US e-commerce. Marketplace advantages: Traffic, trust, fulfillment (FBA). Own-site advantages: Brand control, margin, customer data. Hybrid strategy: 67% of D2C brands use both.

Marketplace Economics:
- Amazon fees: 15% + FBA (varies by category)
- Walmart: 15% referral
- eBay: 10-15%
- Etsy: 6.5% + payment processing

Own-Site Priorities:
- Customer acquisition: Harder without marketplace traffic
- Retention: Email/SMS list critical
- Margin: 15-25% higher on own site
- Data: Full customer journey visibility`,
  },
  {
    title: 'E-commerce Search and Discovery',
    sourceType: 'technology_report',
    industry: 'ecommerce',
    content: `Site search users convert 2-3x higher than browsers. 30% of visitors use search. Zero-result searches: 4% of queries; 70% leave site. Typo tolerance: 15% of queries have typos.

Search Best Practices:
- Autocomplete: Reduces query time 40%
- Synonyms: "sneakers" = "tennis shoes"
- Faceted search: Category, price, brand
- Personalization: Past purchases influence results

Visual Search:
- Adoption: 23% have used
- Use case: Find similar products from image
- Conversion: 2x higher intent than text search
- Technology: AI/ML image recognition`,
  },
  {
    title: 'E-commerce Customer Service Expectations',
    sourceType: 'consumer_research',
    industry: 'ecommerce',
    content: `89% of consumers expect 24/7 customer service. Response time: 62% expect within 1 hour. Channels: Chat (54%), email (48%), phone (34%), social (23%). AI chatbots: 67% will use for simple queries.

Service Impact on Loyalty:
- Positive experience: 72% will purchase again
- Negative: 58% will not return
- Resolution: Resolved complaint = 70% loyalty
- Proactive outreach: 34% appreciate pre-shipment updates

Self-Service:
- FAQ: 54% check first
- Order tracking: 78% use
- Return portal: 67% prefer self-service
- Knowledge base: Reduces tickets 25%`,
  },
  {
    title: 'Wholesale and B2B E-commerce',
    sourceType: 'market_analysis',
    industry: 'ecommerce',
    content: `B2B e-commerce reached $1.8T in US (2024). Growth: 12% annually. Key differences from B2C: Larger orders, negotiated pricing, net terms, multi-approval workflows.

B2B Buyer Expectations:
- Self-service ordering: 78% prefer
- Bulk pricing visibility: 89%
- Reorder from history: 67%
- Account-specific catalogs: 54%
- Integration (EDI, API): 34% require

Platform Features:
- Quote request: 67% of B2B transactions
- Minimum order quantities: Common
- Tiered pricing: Volume discounts
- Purchase order: 45% of B2B transactions`,
  },
  {
    title: 'E-commerce Loyalty Programs',
    sourceType: 'consumer_research',
    industry: 'ecommerce',
    content: `Loyalty program members: 2.5x higher LTV. 75% of consumers belong to at least one. Points vs cashback: 54% prefer points (gamification). Tiered programs: 34% increase in top-tier engagement.

Program Design:
- Earning rate: 1-5% of spend typical
- Redemption: 67% prefer discount over free product
- Expiration: No expiration increases engagement 28%
- Birthday/anniversary: 45% redemption rate

Integration:
- Omnichannel: 67% expect points across channels
- Partner rewards: Co-branded credit cards
- Subscription: 23% of programs include subscription`,
  },
  {
    title: 'Headless E-commerce Architecture',
    sourceType: 'technology_report',
    industry: 'ecommerce',
    content: `Headless commerce separates frontend from backend. API-first: Content and commerce delivered via APIs. 34% of enterprise retailers use headless. Benefits: Flexibility, omnichannel, performance.

Use Cases:
- Custom storefronts: Unique UX
- Multi-storefront: One backend, many sites
- IoT/commerce: Voice, kiosk, in-app
- Composable: Best-of-breed vendors

Implementation:
- Build time: 6-12 months typical
- Cost: 2-3x traditional platform
- Team: Requires frontend and API expertise
- ROI: 15-25% conversion lift for complex implementations`,
  },

  // SaaS & Technology (20 documents)
  {
    title: 'SaaS Pricing Models 2024',
    sourceType: 'market_report',
    industry: 'saas',
    content: `SaaS pricing trends: Usage-based (42% of new products), hybrid (28%), flat-rate (30%). PLG (product-led growth): 67% of top SaaS use free tier or trial. Expansion revenue: 110% of new ARR for best performers.

Pricing Tiers:
- Free: 2-5% convert to paid
- Starter: $10-50/month average
- Pro: $50-200/month
- Enterprise: Custom, $500+/month

Value Metrics:
- Per-seat: 54% of SaaS
- Per-use: 34% (API calls, storage)
- Per-outcome: 12% (leads, conversions)
- Flat: Declining (30% in 2020, 22% in 2024)`,
  },
  {
    title: 'B2B SaaS Sales Cycle Benchmarks',
    sourceType: 'industry_analysis',
    industry: 'saas',
    content: `SMB sales cycle: 14-30 days. Mid-market: 45-90 days. Enterprise: 90-180 days. Multi-threading: 5.4 stakeholders average in enterprise deal. Champion: 78% of won deals have internal champion.

Conversion Benchmarks:
- Demo to opportunity: 25-35%
- Opportunity to close: 20-30%
- Win rate (qualified): 25-35%
- Average deal size: $50K (mid-market), $150K+ (enterprise)

Shortening Cycle:
- Product-led: 40% shorter cycle
- Free trial: 28% faster
- Case studies: 34% reduction in objections
- ROI calculator: 23% faster close`,
  },
  {
    title: 'SaaS Churn and Retention',
    sourceType: 'market_report',
    industry: 'saas',
    content: `Median monthly churn: 3-5% (SMB), 0.5-1% (enterprise). Annual churn: 5-7% for best-in-class. Net revenue retention: 110%+ for top quartile. Expansion: 25-35% of ARR from upsell.

Churn Drivers:
- Price: 34%
- Competitor: 28%
- Underutilization: 42%
- Missing features: 24%
- Support: 18%

Retention Tactics:
- Health scores: 67% of SaaS use
- Proactive outreach: 34% churn reduction
- Customer success: 1:50 ratio (enterprise)
- In-app guidance: 23% activation improvement`,
  },
  {
    title: 'Product-Led Growth Metrics',
    sourceType: 'trend_report',
    industry: 'saas',
    content: `PLG companies grow 2x faster than sales-led. Key metrics: Time to value (TTV), activation rate, conversion rate, expansion revenue. Free-to-paid: 2-5% for freemium, 14-25% for trial.

Activation Definition:
- First "aha" moment: Varies by product
- Time to activate: <48 hours ideal
- Activation rate: 25-40% for good PLG
- Drop-off: 40% in first week (free users)

Conversion Triggers:
- Usage threshold: 10+ sessions
- Feature adoption: Core feature used
- Team size: Invite colleagues
- Data: Sufficient value to justify paid`,
  },
  {
    title: 'SaaS Customer Acquisition Cost',
    sourceType: 'industry_analysis',
    industry: 'saas',
    content: `CAC by channel: Organic 30-50% of new customers, Paid 40-60%. CAC payback: 12-18 months target. LTV:CAC: 3:1 minimum. CAC by segment: SMB $500-2K, Mid-market $5-15K, Enterprise $30-100K+.

Channel Efficiency:
- Content/SEO: 40% of pipeline (top of funnel)
- Paid search: $2-5 per lead (SMB)
- Outbound: $50-80 per meeting
- Events: $200-500 per lead
- Partner: 15-25% of pipeline

CAC Trends:
- Rising: 2020-2024 +35% average
- PLG efficiency: 40% lower CAC
- Product-qualified leads: 3x conversion rate`,
  },
  {
    title: 'SaaS Enterprise Sales Motion',
    sourceType: 'market_report',
    industry: 'saas',
    content: `Enterprise deals: $100K+ ACV. Sales cycle: 6-12 months. Buying committee: 6-10 stakeholders. Security review: 78% of enterprise deals require. Procurement: 45-60 day negotiation typical.

Enterprise Requirements:
- SOC 2: 89% require
- GDPR compliance: 67% (EU)
- SSO/SAML: 78%
- Data residency: 54%
- Custom contract: 67%

Competitive Dynamics:
- Win rate vs incumbent: 25-30%
- Win rate (greenfield): 35-45%
- Displacement: 18-24 month typical
- Land and expand: 40% of enterprise ARR from expansion`,
  },
  {
    title: 'SaaS Product Metrics',
    sourceType: 'technology_report',
    industry: 'saas',
    content: `North Star metric: 67% of SaaS define one. DAU/MAU: Stickiness ratio, 20%+ good. Feature adoption: 30% use core features. NPS: 50+ excellent, 30+ good. Activation: 40%+ for PLG.

Engagement Metrics:
- Weekly active: 60%+ of MAU ideal
- Session depth: 5+ actions per session
- Return rate: 7-day 40%+, 30-day 70%+
- Power users: 20% drive 80% of value

Usage-Based Billing:
- Metering: Real-time vs batch
- Overage: 23% of revenue from overage
- Commit: 67% of enterprise have minimum commit`,
  },
  {
    title: 'SaaS Competitive Landscape',
    sourceType: 'market_analysis',
    industry: 'saas',
    content: `SaaS market: $197B (2024). Growth: 18% annually. Consolidation: 340 M&A deals in 2024. Key categories: CRM, collaboration, HR, security, dev tools. Vertical SaaS: 34% growth (vs 18% horizontal).

Competitive Positioning:
- Feature parity: 67% of markets
- Differentiation: Integration, vertical, UX
- Switching cost: 23% annual churn (low)
- Network effects: 12% of SaaS (collaboration, marketplaces)`,
  },
  {
    title: 'SaaS Freemium Conversion',
    sourceType: 'consumer_research',
    industry: 'saas',
    content: `Freemium conversion: 2-5% typical. Best: Slack (30%), Dropbox (4%). Conversion drivers: Usage limits, feature gates, team size. Time to convert: 14-30 days average.

Optimization Tactics:
- Upgrade prompts: Contextual, 40% increase
- Usage limits: 23% conversion at limit
- Feature paywall: Core feature gated
- Trial of paid: 14-day trial of Pro tier
- Support: 34% convert after support interaction`,
  },
  {
    title: 'SaaS Integration Ecosystem',
    sourceType: 'technology_report',
    industry: 'saas',
    content: `Integrations: 78% of buyers consider critical. Average: 150+ integrations for mature products. API: 89% of SaaS have public API. Marketplace: 34% of SaaS have app marketplace.

Integration Priorities:
- CRM (Salesforce, HubSpot): 67%
- Communication (Slack, Teams): 54%
- Storage (Google Drive, Dropbox): 48%
- Identity (Okta, Azure AD): 45%
- Billing (Stripe): 34%`,
  },
  {
    title: 'SaaS Support and Success',
    sourceType: 'industry_analysis',
    industry: 'saas',
    content: `Customer success: 1:50 ratio (mid-market), 1:10 (enterprise). Support channels: 67% offer chat, 54% email, 34% phone. Tiered support: 78% of enterprise have dedicated CSM.

Satisfaction Metrics:
- CSAT: 90%+ target
- First response: <1 hour (SMB), <4 hours (enterprise)
- Resolution: 80% first contact
- Self-service: 40% of tickets deflected

Proactive Success:
- Health scores: 67% use
- At-risk outreach: 34% churn reduction
- QBR: 89% of enterprise have quarterly`,
  },
  {
    title: 'SaaS Security and Compliance',
    sourceType: 'market_report',
    industry: 'saas',
    content: `Security questionnaire: 78% of enterprise deals. SOC 2: 89% of vendors have. GDPR: 67% required for EU. HIPAA: 34% required for healthcare. FedRAMP: 12% for government.

Compliance Timeline:
- SOC 2 Type I: 3-6 months
- SOC 2 Type II: 6-12 months
- GDPR: 2-4 months (if data processed)
- ISO 27001: 6-12 months

Trust Center:
- 67% of vendors have public trust page
- Security docs: 34% share on request
- Penetration test: 45% share summary`,
  },
  {
    title: 'SaaS Pricing Page Optimization',
    sourceType: 'consumer_research',
    industry: 'saas',
    content: `Pricing page: 67% of visitors check before signing up. A/B testing: 34% lift from optimization. Anchoring: 3-tier (67%) most common. Annual discount: 15-20% standard.

Best Practices:
- Transparent: 78% want clear pricing
- Feature comparison: 89% use
- FAQ: 54% reduce sales contact
- Social proof: 67% trust case studies
- Calculator: 23% use for usage-based`,
  },
  {
    title: 'SaaS Onboarding Benchmarks',
    sourceType: 'industry_analysis',
    industry: 'saas',
    content: `Activation: 40%+ for good onboarding. Time to value: <24 hours ideal. Drop-off: 40% in first week. Checklist: 34% completion lift. In-app guidance: 28% activation improvement.

Onboarding Elements:
- Welcome email: 78% open rate
- Product tour: 45% completion
- Checklist: 67% use
- Video: 34% watch
- Human touch: 23% (enterprise)

Personalization:
- Role-based: 23% of SaaS
- Use case: 34%
- Industry: 18%
- Generic: 45%`,
  },
  {
    title: 'SaaS Annual Contract Trends',
    sourceType: 'market_report',
    industry: 'saas',
    content: `Annual prepay: 67% of SaaS revenue. Discount: 15-20% for annual. Monthly option: 78% offer (conversion 30%). Multi-year: 23% of enterprise, 10-15% discount.

Payment Terms:
- Credit card: 67% default
- ACH: 34% (enterprise)
- Invoice: 45% (enterprise)
- Net 30/60: 67% of enterprise`,
  },
  {
    title: 'SaaS Partner and Channel',
    sourceType: 'industry_analysis',
    industry: 'saas',
    content: `Channel revenue: 15-30% for many SaaS. Partner types: Reseller, referral, technology. Referral fee: 10-25% typical. Reseller margin: 20-30%.

Partner Program:
- Tiered: 67% of programs
- Certification: 54% require
- Co-marketing: 45% offer
- Deal registration: 78% have`,
  },
  {
    title: 'SaaS Feature Request Management',
    sourceType: 'technology_report',
    industry: 'saas',
    content: `Feature requests: 78% of SaaS track. Prioritization: 67% use voting. Roadmap: 54% share publicly. Transparency: 34% show timeline. Impact: 23% of roadmap from requests.

Customer Input:
- Support tickets: 23%
- Sales feedback: 34%
- User interviews: 45%
- Voting board: 67%
- Beta program: 23%`,
  },
  {
    title: 'SaaS International Expansion',
    sourceType: 'market_report',
    industry: 'saas',
    content: `International revenue: 45% of top SaaS. Localization: 67% translate UI. Currency: 54% support local. Compliance: GDPR, CCPA, data residency. Support: 34% offer local language.

Go-to-Market:
- Direct: 67% start
- Partner: 34% use
- Acquisition: 23% enter via M&A
- Timing: 2-3 years post-domestic PMF`,
  },
  {
    title: 'SaaS AI and Automation',
    sourceType: 'trend_report',
    industry: 'saas',
    content: `AI features: 67% of SaaS adding. Use cases: Summarization, automation, personalization. Adoption: 34% of users try AI features. Pricing: 23% charge premium for AI.

Implementation:
- Build: 45%
- Buy: 34%
- Partner: 21%
- LLM: 78% use OpenAI/Anthropic/Google`,
  },
  {
    title: 'SaaS Startup Metrics',
    sourceType: 'industry_analysis',
    industry: 'saas',
    content: `ARR growth: 100%+ YoY (early), 50%+ (growth), 25%+ (scale). Burn multiple: 20-30 months runway target. Rule of 40: Growth + margin. NRR: 110%+ for best.

Funding Benchmarks:
- Seed: $2-5M, $10-20M valuation
- Series A: $10-20M, $40-80M
- Series B: $30-50M, $150-300M
- Growth: $50M+, $500M+`,
  },
  {
    title: 'SaaS Vendor Evaluation',
    sourceType: 'consumer_research',
    industry: 'saas',
    content: `Evaluation criteria: 78% consider features first. Security: 67% for enterprise. Price: 54% for SMB. References: 45% check. Trial: 67% require before purchase.

Decision Process:
- Stakeholders: 5.4 average
- Timeline: 90 days average
- RFP: 67% for enterprise
- POC: 45% run proof of concept`,
  },

  // Financial Services (20 documents)
  {
    title: 'Digital Banking Adoption',
    sourceType: 'market_report',
    industry: 'financial_services',
    content: `Digital banking adoption: 78% of US adults. Mobile-first: 54% prefer app over web. Neobanks: 23% have primary account. Trust: 67% trust traditional banks over fintech for deposits.

Key Features:
- Mobile check deposit: 89% use
- P2P payments: 67% use
- Budgeting tools: 45% use
- Bill pay: 78% use
- Alerts: 67% use

Switching Barriers:
- Direct deposit: 78% cite
- Bill autopay: 67%
- Account history: 54%
- Familiarity: 45%`,
  },
  {
    title: 'Consumer Credit Card Preferences',
    sourceType: 'consumer_research',
    industry: 'financial_services',
    content: `Card selection: 67% consider rewards first. Cashback: 54% prefer over points. Annual fee: 78% prefer no fee. Sign-up bonus: 45% influenced. APR: 34% for revolvers (carry balance).

Segment Preferences:
- Travel: 23% prefer points
- Cashback: 54% prefer
- Balance transfer: 12%
- Building credit: 18%

Digital Experience:
- Mobile app: 89% have
- Apple Pay: 67% use
- Notifications: 78% want real-time
- Dispute: 67% prefer in-app`,
  },
  {
    title: 'Investment App User Behavior',
    sourceType: 'market_analysis',
    industry: 'financial_services',
    content: `Investment app users: 45% of US adults. Robinhood: 23M users. Fidelity: 45M. Schwab: 34M. Fractional shares: 67% of new investors use. Crypto: 34% hold in investment apps.

User Demographics:
- 18-34: 54% of app users
- 35-54: 34%
- 55+: 12%
- First-time: 23% are new to investing

Behavior:
- Daily check: 45%
- Weekly: 34%
- Monthly: 21%
- Trading frequency: 12% monthly (active)`,
  },
  {
    title: 'Mortgage Digital Experience',
    sourceType: 'industry_analysis',
    industry: 'financial_services',
    content: `Digital mortgage: 67% start online. 45% complete entirely online. 34% prefer hybrid. Time to close: 45 days average. Document upload: 78% prefer digital.

Pain Points:
- Complexity: 67% find confusing
- Communication: 54% want more updates
- Speed: 45% want faster
- Transparency: 78% want clear fees

Refinance:
- Rate check: 67% use online
- Application: 54% digital
- Closing: 34% remote (e-sign)`,
  },
  {
    title: 'Insurance Purchase Journey',
    sourceType: 'consumer_research',
    industry: 'financial_services',
    content: `Insurance research: 78% start online. 67% compare quotes. 45% prefer direct (vs agent). 34% use aggregator. 23% purchase entirely online. Auto: 78% shop online. Home: 54%. Life: 34%.

Decision Factors:
- Price: 89%
- Coverage: 78%
- Brand trust: 67%
- Ease: 54%
- Agent: 34%`,
  },
  {
    title: 'Buy Now Pay Later (BNPL) Consumer',
    sourceType: 'market_report',
    industry: 'financial_services',
    content: `BNPL users: 18% of US adults. Klarna: 150M users. Afterpay: 20M. Affirm: 14M. Usage: 34% for apparel, 45% for electronics. Repeat: 67% use again.

User Profile:
- 18-34: 54%
- Income $50-100K: 45%
- Use case: Budget management
- Default: 2-4%

Merchant Impact:
- AOV: +45%
- Conversion: +20-30%
- Fee: 2-4% of transaction`,
  },
  {
    title: 'Savings and Emergency Fund',
    sourceType: 'consumer_research',
    industry: 'financial_services',
    content: `Emergency fund: 34% have 6+ months. 23% have none. 45% have 1-3 months. High-yield savings: 54% aware. 34% use. Rate sensitivity: 67% would switch for 1% higher.

Savings Apps:
- Round-up: 45% use
- Auto-save: 23%
- Goals: 34%
- Challenges: 18%

Barriers:
- Low income: 67% cite
- Debt: 54%
- Discipline: 45%
- Access: 23%`,
  },
  {
    title: 'Financial Wellness Programs',
    sourceType: 'industry_analysis',
    industry: 'financial_services',
    content: `Employer programs: 67% of large employers offer. 34% participation. 23% use regularly. 45% unaware. 78% want financial education. 54% prefer digital tools.

Topics:
- Budgeting: 78%
- Debt: 67%
- Savings: 54%
- Retirement: 45%
- Investing: 34%

ROI:
- Productivity: 23% improvement
- Retention: 45% cite
- Engagement: 34% increase
- Absenteeism: 18% reduction`,
  },
  {
    title: 'Crypto Adoption and Trust',
    sourceType: 'market_report',
    industry: 'financial_services',
    content: `Crypto ownership: 23% of US adults. 67% have heard of Bitcoin. 34% consider it investment. 45% trust traditional banks more. 23% have used for payment.

Adoption Barriers:
- Volatility: 78%
- Complexity: 67%
- Regulation: 54%
- Security: 23%
- Scams: 45%

Demographics:
- 18-34: 34% have used
- 35-54: 18%
- 55+: 8%
- Male: 2x female`,
  },
  {
    title: 'Small Business Banking',
    sourceType: 'market_analysis',
    industry: 'financial_services',
    content: `SMB banking: 67% use traditional bank. 23% use neobank. 34% use both. 45% dissatisfied with fees. 54% want better cash flow tools. 78% want mobile.

Needs:
- Checking: 89%
- Payments: 78%
- Lending: 54%
- Payroll: 45%
- Integrations: 34%

Switching:
- 23% switched in 2024
- 45% considering
- 67% cite fees as reason
- 23% cite digital experience`,
  },
  {
    title: 'Wealth Management Digital',
    sourceType: 'industry_analysis',
    industry: 'financial_services',
    content: `Robo-advisor AUM: $1.2T. 34% of investors use. 67% prefer hybrid (human + digital). 45% want financial planning. 78% want transparency on fees.

Segments:
- Mass affluent: 45% use digital
- High net worth: 23% use digital
- Millennials: 67% prefer digital
- Gen X: 45% hybrid
- Boomers: 34% human advisor

Features:
- Goal-based: 78% want
- Tax-loss harvesting: 54%
- ESG options: 45%
- Rebalancing: 89% expect`,
  },
  {
    title: 'Payment Preferences',
    sourceType: 'consumer_research',
    industry: 'financial_services',
    content: `Payment methods: 67% prefer card. 34% use mobile wallet. 23% use P2P. 45% use BNPL. 78% want choice. 54% prefer contactless. 34% prefer digital over cash.

Security:
- 78% worry about fraud
- 67% use alerts
- 54% prefer biometric
- 45% want tokenization
- 34% understand tokenization`,
  },
  {
    title: 'Financial App Trust',
    sourceType: 'market_report',
    industry: 'financial_services',
    content: `Trust factors: 68% security. 67% reputation. 54% regulation. 45% reviews. 34% recommendations. 23% advertising. 78% want FDIC/SIPC. 67% prefer established brands.

Data Sharing:
- 54% willing to share for better experience
- 45% concerned about privacy
- 34% read privacy policy
- 23% understand data use`,
  },
  {
    title: 'Lending Digital Experience',
    sourceType: 'industry_analysis',
    industry: 'financial_services',
    content: `Personal loan: 67% apply online. 45% complete entirely digital. 34% prefer instant decision. 78% want rate check without impact. 54% compare multiple lenders.

Decision Time:
- Instant: 45% expect
- Same day: 34%
- 1-2 days: 21%
- Funding: 67% want same day`,
  },
  {
    title: 'Banking Customer Service',
    sourceType: 'consumer_research',
    industry: 'financial_services',
    content: `Channel preference: 54% chat. 45% phone. 34% in-branch. 23% video. 67% want 24/7. 78% want quick resolution. 45% frustrated with wait times.

Satisfaction:
- 67% satisfied overall
- 54% with digital
- 45% with human
- 34% with phone
- 23% with branch`,
  },
  {
    title: 'Financial Literacy Gaps',
    sourceType: 'market_report',
    industry: 'financial_services',
    content: `Literacy: 34% can answer 5 basic questions. 67% want to improve. 45% learned from parents. 34% from school. 23% from apps. 78% want more education.

Topics Needed:
- Budgeting: 67%
- Investing: 54%
- Debt: 45%
- Retirement: 34%
- Taxes: 23%`,
  },
  {
    title: 'Account Opening Friction',
    sourceType: 'industry_analysis',
    industry: 'financial_services',
    content: `Digital account opening: 67% abandon. 45% due to complexity. 34% due to time. 23% due to security concerns. 78% want under 10 minutes. 54% want minimal docs.

Requirements:
- ID: 89% expect
- SSN: 78% expect
- Address: 67%
- Funding: 54%
- Video: 23% (KYC)`,
  },
  {
    title: 'Fraud and Security Awareness',
    sourceType: 'consumer_research',
    industry: 'financial_services',
    content: `Fraud concern: 78% worried. 67% experienced or know someone. 54% use 2FA. 45% use unique passwords. 34% use password manager. 23% understand phishing.

Reaction:
- 67% would switch after fraud
- 54% want instant alerts
- 45% want easy dispute
- 34% want reimbursement guarantee`,
  },
  {
    title: 'Financial Services Personalization',
    sourceType: 'market_report',
    industry: 'financial_services',
    content: `Personalization: 67% expect. 54% get relevant offers. 45% get proactive advice. 34% get tailored products. 78% willing to share for benefit. 67% concerned about over-targeting.

Use Cases:
- Product recommendations: 54%
- Alerts: 78%
- Insights: 45%
- Advice: 34%
- Offers: 67%`,
  },
  {
    title: 'Retirement Planning Digital',
    sourceType: 'industry_analysis',
    industry: 'financial_services',
    content: `401k digital: 78% have access. 67% use. 45% check monthly. 34% want advice. 23% use robo. 54% want retirement calculator. 45% want projection tools.

Engagement:
- Annual review: 67%
- Rebalance: 45%
- Contribution change: 34%
- Education: 23%
- Advice: 18%`,
  },
];
