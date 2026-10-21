# How the System Works

**Complete workflow from input to output**

---

## 📋 Overview

The Synthetic Market Research Platform simulates how real people would respond to your product, service, or marketing message. Instead of running expensive surveys or focus groups, you create AI-powered personas that think, reason, and make decisions like real humans.

**The Process:**
```
Market Segment → AI Personas → Hypothesis Test → Simulation → Results
```

---

## 🎯 The Workflow (Step-by-Step)

### Step 1: Define Your Market Segment

**Input:** Market segment characteristics

**What you provide:**
- **Demographics:** Age range, income range, locations, occupations, genders
- **Psychographics:** Motivations, barriers, values, lifestyle attributes
- **Behavioral patterns:** Purchase triggers, trust channels, decision style, price sensitivity

**Example Input:**
```json
{
  "name": "Sleepless Professionals",
  "description": "Working professionals aged 28-45 struggling with sleep quality",
  "demographicCriteria": {
    "ageRange": { "min": 28, "max": 45 },
    "incomeRange": { "min": 60, "max": 150 },
    "locations": ["San Francisco, CA", "New York, NY", "Seattle, WA"],
    "genders": ["male", "female", "non-binary"],
    "occupations": ["Software Engineer", "Product Manager", "Consultant"]
  },
  "psychographicTraits": {
    "motivations": ["Better sleep", "Improved productivity", "Natural solutions"],
    "barriers": ["Cost concerns", "Skepticism of supplements", "Too busy to try"],
    "values": ["Health", "Efficiency", "Science-backed solutions"]
  },
  "behavioralPatterns": {
    "purchaseTriggers": ["Sleep tracking data", "Doctor recommendation", "Peer reviews"],
    "trustChannels": ["Clinical studies", "Expert opinions", "Amazon reviews"],
    "decisionStyle": "analytical",
    "brandLoyalty": "medium",
    "priceAnchor": 50
  }
}
```

**What the system does:**
- Validates the segment definition
- Stores it in the database
- Makes it available for persona generation

**Output:**
- Segment ID (e.g., `seg_abc123`)
- Confirmation of saved segment

---

### Step 2: Generate AI Personas

**Input:** 
- Segment ID (path parameter)
- Number of personas to generate (1-50)
- Diversity level (low, medium, high)

**API call:** `POST /segments/:id/generate-personas`

**Request body:**
```json
{
  "count": 10,
  "diversityLevel": "medium"
}
```

**What the system does:**

1. **Retrieves segment definition** from database
2. **Constructs AI prompt** with segment criteria
3. **Calls Vertex AI (Gemini 1.5 Pro)** with instructions to create realistic personas
4. **Generates rich personas** with 28+ attributes:
   - Basic demographics (name, age, gender, location, income, occupation)
   - OCEAN personality (openness, conscientiousness, extraversion, agreeableness, neuroticism)
   - Health profile (insomnia severity, anxiety level, chronic pain, supplements)
   - Cognitive biases (loss aversion, authority bias, social proof, status quo bias, anchoring, confirmation bias)
   - Decision style (system1 weight, price anchor, risk tolerance)
   - Contextual details (motivations, barriers, trust channels, purchase triggers, budget range)
5. **Saves personas** to database

**AI Prompt Strategy:**
- Instructs AI to create diverse, realistic individuals within segment boundaries
- Requires specific numeric values for all traits
- Demands unique backstories and contextual details
- Uses temperature scaling for diversity (0.3 low, 0.6 medium, 0.9 high)

**Example Generated Persona:**
```json
{
  "id": "per_xyz789",
  "name": "Alex Chen",
  "segment": "Sleepless Professionals",
  "age": 32,
  "gender": "male",
  "location": "San Francisco, CA",
  "income": 120,
  "occupation": "Software Engineer",
  "personality": {
    "openness": 75,
    "conscientiousness": 82,
    "extraversion": 45,
    "agreeableness": 65,
    "neuroticism": 58
  },
  "healthProfile": {
    "insomniaSeverity": 7,
    "anxietyLevel": 5,
    "chronicPain": 2,
    "currentSupplements": ["Magnesium", "Melatonin"]
  },
  "cognitiveProfile": {
    "lossAversion": 0.6,
    "authorityBias": 0.4,
    "socialProof": 0.7,
    "statusQuoBias": 0.5,
    "anchoring": 0.6,
    "confirmationBias": 0.5
  },
  "decisionStyle": {
    "system1Weight": 0.4,
    "priceAnchor": 75,
    "riskTolerance": 0.6
  },
  "motivations": ["Better sleep", "Peak performance at work"],
  "barriers": ["Skeptical of quick fixes", "Cost vs. value concern"],
  "trustChannel": "Clinical studies and expert opinions",
  "purchaseTriggers": ["Data-driven proof", "Peer recommendations"],
  "budgetRange": "$50-100/month",
  "contextNotes": "Tech worker burning out from startup culture, tracks sleep with Whoop, willing to invest in health but needs scientific proof"
}
```

**Output:**
- 10 unique personas with full psychological profiles
- Each persona is ready to participate in simulations

---

### Step 3: Create Hypothesis

**Input:** What you want to test

**What you provide:**
```json
{
  "stage": "H1",
  "title": "Sleep Supplement Market Fit",
  "statement": "A $49/month science-backed sleep supplement with clinical trial data will achieve 60%+ acceptance among sleepless professionals",
  "status": "ready",
  "successCriteria": "Acceptance rate >= 60%, average confidence >= 0.7"
}
```

**What the system does:**
- Saves hypothesis to database
- Links it to potential variants (different versions to test)
- Prepares it for simulation

**Output:**
- Hypothesis ID (e.g., `hyp_def456`)
- Ready to run simulation

---

### Step 4: Run Simulation

**Input:**
- Hypothesis statement
- Persona IDs (optional - defaults to all)
- Max iterations (for future multi-turn)

**What you provide:**
```json
{
  "hypothesis": "A $49/month science-backed sleep supplement with clinical trial data",
  "personaIds": ["per_xyz789", "per_abc123", ...],
  "maxIterations": 1
}
```

**What the system does:**

#### Phase 1: Context Retrieval (RAG)
1. **Extracts key terms** from hypothesis (e.g., "sleep supplement", "clinical trial")
2. **Queries RAG system** for relevant market context
3. **Retrieves documents** about:
   - Market trends
   - Competitor products
   - Scientific studies
   - Customer reviews
4. **Formats context** for AI consumption

**Implementation:** pgvector-backed vector search using Vertex AI text-embedding-005 (768 dimensions). The hypothesis is embedded and compared against the `document_chunks` table via cosine similarity, returning the top K most relevant chunks. A 26-doc demo corpus auto-seeds on startup; in-memory fallback is available for development (`RAG_PROVIDER=inmemory`).

#### Phase 2: Persona Simulation (Batch Processing)
For each persona (5 at a time to avoid rate limits):

**2A. System 1 - Emotional Reaction**
- **Prompt:** "You are [persona name]. What's your immediate gut reaction to this offer?"
- **Personality influence:** High neuroticism = more volatile (higher temperature)
- **Temperature:** 0.7 + (neuroticism / 500)
- **Output:** First-person emotional response

**Example System 1:**
```
"This sounds promising! I've been struggling with sleep for months and 
nothing has worked. If there's real clinical data, I'm willing to try it."
```

**2B. System 2 - Rational Analysis**
- **Prompt:** "Now think critically. Consider your budget, barriers, and the market context."
- **Budget check:** Does $49/month fit within their budget range?
- **Barrier assessment:** Do their specific barriers (e.g., "skeptical of quick fixes") apply?
- **Bias activation:** How do cognitive biases affect the decision?
  - Loss aversion (0.6): Moderate fear of wasting money
  - Social proof (0.7): Needs peer validation
  - Status quo bias (0.5): Medium resistance to change
- **Context integration:** RAG sources inform the analysis
- **Temperature:** 0.2 (consistent rational thinking)
- **Output:** Structured JSON decision

**Example System 2:**
```json
{
  "decision": "accept",
  "confidence": 0.75,
  "rational_thought": "Price is reasonable at $49 given my $120k income and $50-100/month budget. Clinical trials address my skepticism. My moderate loss aversion is offset by potential sleep quality gains. Social proof from studies helps.",
  "key_reasons": [
    "Science-backed with clinical data",
    "Within budget range",
    "Addresses core need (sleep quality)"
  ]
}
```

**2C. Iterative Deliberation**
- If confidence is below threshold, the persona may loop back through System 1 → System 2 (up to 5 iterations)
- Each loop deepens reasoning with additional context from prior iterations
- `loopDepth` tracks how many deliberation rounds occurred

**2D. Decision Synthesis**
- Combines System 1 emotion with System 2 logic
- Final decision: accept, reject, or maybe
- Confidence score: 0.0 to 1.0
- Reasoning traces preserved for all iterations

#### Phase 3: Aggregation
After all personas are processed:

1. **Calculate summary metrics:**
   - Acceptance rate: 65% accepted
   - Rejection rate: 20% rejected
   - Maybe rate: 15% uncertain
   - Average confidence: 0.72
   - Total personas: 10

2. **Extract top objections:**
   - Count rejection reasons
   - Rank by frequency
   - Top 5 objections identified

3. **Identify insights:**
   - Which segments accepted most?
   - What reasoning patterns emerged?
   - What barriers prevented acceptance?

**Output:**
- Complete simulation result object

---

### Step 5: Results Analysis

**What the system returns:**

```json
{
  "id": "sim_ghi789",
  "hypothesis": "A $49/month science-backed sleep supplement with clinical trial data",
  "status": "completed",
  "createdAt": "2026-02-06T10:00:00Z",
  "completedAt": "2026-02-06T10:02:15Z",
  
  "summary": {
    "acceptanceRate": 0.65,
    "rejectionRate": 0.20,
    "maybeRate": 0.15,
    "averageConfidence": 0.72,
    "avgLoopDepth": 1.0,
    "totalPersonas": 10
  },
  
  "decisions": [
    {
      "personaId": "per_xyz789",
      "name": "Alex Chen",
      "segment": "Sleepless Professionals",
      "decision": "accept",
      "confidence": 0.75,
      "system1": "This sounds promising! I've been struggling...",
      "system2": "Price is reasonable at $49 given my $120k income...",
      "reasons": [
        "Science-backed with clinical data",
        "Within budget range",
        "Addresses core need"
      ],
      "loopDepth": 1
    },
    // ... 9 more personas
  ],
  
  "objections": [
    "Price too high for uncertain results",
    "Skeptical of supplement efficacy",
    "Already tried similar products",
    "Prefer natural/behavioral solutions",
    "Need more proof before committing"
  ],
  
  "ragSources": [
    {
      "title": "Sleep Supplement Market Report 2025",
      "snippet": "Clinical trial data shows 73% improvement...",
      "url": "https://..."
    }
  ],
  
  "topSignals": [
    "AI Analysis Completed",
    "Simulated 10 agents in 2.3 minutes",
    "RAG Context: 3 sources cited"
  ]
}
```

---

## 📊 Understanding the Output

### Acceptance Rate
**What it means:** Percentage of personas who would purchase/accept your offer

**How to interpret:**
- **>70%:** Strong market fit, proceed with confidence
- **60-70%:** Good fit, refine messaging around objections
- **40-60%:** Mixed response, consider A/B testing variants
- **<40%:** Weak fit, major changes needed

**H1 Stage Target:** >= 60% acceptance

### Confidence Scores
**What it means:** How certain each persona is about their decision (0.0 to 1.0)

**How to interpret:**
- **>0.7:** Strong conviction, unlikely to change mind
- **0.4-0.7:** Leaning but persuadable (target these with messaging)
- **<0.4:** Very uncertain, needs more information/proof

**Use case:** Identify personas "on the fence" for targeted marketing

### System 1 vs System 2
**What it means:** Emotional vs. rational reasoning

**System 1 (Emotional):**
- Gut reactions
- Influenced by personality traits
- Quick, instinctive
- Example: "This sounds exciting!"

**System 2 (Rational):**
- Analytical thinking
- Budget-aware, barrier-conscious
- Slower, deliberate
- Example: "Let me calculate if I can afford this..."

**Use case:** 
- If System 1 drives acceptance → Appeal to emotions in marketing
- If System 2 drives acceptance → Lead with data, facts, logic

### Top Objections
**What it means:** Most common reasons for rejection or hesitation

**How to use:**
1. Review top 3-5 objections
2. Address each in marketing materials
3. Consider product/pricing adjustments
4. Re-test with updated hypothesis

**Example:**
- Objection: "Price too high"
  - Action: Test lower price point or emphasize value
- Objection: "Skeptical of efficacy"
  - Action: Lead with clinical trial data
- Objection: "Prefer natural solutions"
  - Action: Emphasize natural ingredients

### RAG Sources
**What it means:** Real-world market data that informed decisions

**How to use:**
- Verify context relevance
- Check if sources are current
- Use citations in marketing (e.g., "Based on 2025 sleep study...")

**Implementation:** pgvector-backed retrieval is fully implemented and active when `RAG_PROVIDER=pgvector` (the local `.env` default). Includes a 26-doc auto-seeded demo corpus. In-memory fallback is available for development.

---

## 🔄 The Complete Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER INPUT                                            │
│    • Market Segment Definition                           │
│    • Persona Generation Request                          │
│    • Hypothesis Statement                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. AI PERSONA GENERATION                                 │
│    Vertex AI (Gemini 1.5 Pro)                           │
│    • Segment criteria → AI prompt                        │
│    • Generate 28+ attributes per persona                 │
│    • Return: Realistic psychological profiles            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. CONTEXT RETRIEVAL (RAG)                              │
│    • Extract keywords from hypothesis                    │
│    • Query vector database                               │
│    • Retrieve relevant market documents                  │
│    • Return: Contextual market knowledge                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. SIMULATION ENGINE                                     │
│    For each persona:                                     │
│    ┌──────────────────────────────────────────────────┐ │
│    │ System 1: Emotional Reaction                     │ │
│    │ • Personality-driven (OCEAN traits)              │ │
│    │ • High temperature (variable)                    │ │
│    │ • Output: Gut feeling                            │ │
│    └──────────────┬───────────────────────────────────┘ │
│                   ▼                                      │
│    ┌──────────────────────────────────────────────────┐ │
│    │ System 2: Rational Analysis                      │ │
│    │ • Budget check                                   │ │
│    │ • Barrier assessment                             │ │
│    │ • Cognitive bias application                     │ │
│    │ • RAG context integration                        │ │
│    │ • Low temperature (0.2)                          │ │
│    │ • Output: Structured decision (JSON)             │ │
│    └──────────────┬───────────────────────────────────┘ │
│                   ▼                                      │
│    Decision: accept / reject / maybe                     │
│    Confidence: 0.0 - 1.0                                 │
│    Reasoning: System 1 + System 2 traces                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 5. AGGREGATION & ANALYSIS                                │
│    • Calculate acceptance/rejection/maybe rates          │
│    • Average confidence scores                           │
│    • Extract top objections (frequency ranking)          │
│    • Identify patterns and insights                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 6. RESULTS OUTPUT                                        │
│    • Summary metrics                                     │
│    • Per-persona decisions with reasoning                │
│    • Top objections                                      │
│    • RAG sources cited                                   │
│    • Actionable insights                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Example End-to-End Flow

### Input
**Segment:** "Budget-Conscious Parents" (age 30-45, income $40-80k)  
**Hypothesis:** "$29/month family meal kit with organic ingredients"  
**Personas:** 20 generated

### Processing
1. **RAG retrieves:** Meal kit market trends, competitor pricing, organic food demand
2. **20 personas simulate:**
   - System 1: "Sounds healthy for my kids!" vs. "Another subscription?"
   - System 2: Budget analysis ($29 × 4 weeks = $116/month), convenience value
3. **Decisions made:** 12 accept, 5 reject, 3 maybe

### Output
```
Acceptance Rate: 60% (meets H1 threshold ✅)
Average Confidence: 0.68

Top Accepters:
• Health-conscious parents (high openness, low price sensitivity)
• Time-starved professionals (value convenience over cost)

Top Rejectors:
• Budget-stretched families (income < $50k)
• Cooking enthusiasts (prefer autonomy)

Top Objections:
1. "Too expensive for our tight budget" (5 personas)
2. "Prefer to choose my own meals" (3 personas)
3. "Already meal planning on my own" (2 personas)

Recommendation: Consider $19/month tier for lower-income families
```

---

## 🔧 System Components

### Technology Stack
- **Frontend:** React + Material-UI (user input interface)
- **Backend:** NestJS + TypeORM (API and business logic)
- **Database:** PostgreSQL (persona and simulation storage)
- **AI/LLM:** Vertex AI with Gemini 1.5 Pro (reasoning engine)
- **RAG:** pgvector (PostgreSQL vector search for market context)

### Processing Capabilities
- **Batch size:** 5 personas at a time (rate limit protection)
- **Speed:** ~2-3 minutes for 10 personas
- **Cost:** ~$2.15 per simulation (50 personas)
- **Scalability:** Supports 100+ personas per simulation

---

## 📈 Quality Assurance

### How We Ensure Realistic Results

1. **Rich Persona Models:** 28+ attributes prevent generic responses
2. **Personality Influence:** OCEAN traits affect emotional reactions
3. **Cognitive Biases:** Loss aversion, social proof, etc. mirror human irrationality
4. **Budget Constraints:** Personas can't afford what's outside their range
5. **Barrier Awareness:** Personal barriers prevent blanket acceptance
6. **Dual-Process Reasoning:** Emotion + logic = realistic decisions
7. **RAG Grounding:** Real market data informs rational analysis

### Validation (Planned - Calibration Phase)
- Compare synthetic results to real A/B test data
- Measure correlation (target: 0.8+)
- Auto-tune persona parameters based on accuracy
- Continuous improvement loop

---

## 🚀 Next Steps After Results

### If Acceptance >= 60% (H1 Pass)
1. **Refine messaging** to address top objections
2. **Move to H2:** Real-world prototype testing
3. **Target high-confidence accepters** first
4. **A/B test** messaging variants

### If Acceptance < 60% (H1 Fail)
1. **Analyze top objections** deeply
2. **Adjust:** Product, pricing, or positioning
3. **Re-test** with modified hypothesis
4. **Iterate** until 60%+ achieved

### Export Options (Implemented)
- **CSV export:** `GET /simulations/:id/export/csv` — Download button on SimulationsPage and SimulationDetailPage
- **PDF report:** `GET /simulations/:id/report/pdf` — Generated via pdfkit with metric cards, decision distribution, top signals, objections, and per-persona samples
- **Report metadata:** `GET /simulations/:id/report/metadata` — Summary data for report headers

**Not yet implemented:** Excel export, shareable links, branded templates, BI tool integration

---

**Last Updated:** February 16, 2026  
**Version:** 1.0.0
