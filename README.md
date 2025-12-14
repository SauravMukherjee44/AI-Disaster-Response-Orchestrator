# AI-Powered Disaster Response Orchestrator

<div align="center">

![Disaster Response Orchestrator](https://img.shields.io/badge/AI-Disaster%20Response-red)
![Next.js](https://img.shields.io/badge/Next.js-13-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Kestra](https://img.shields.io/badge/Kestra-Orchestration-blue)
![Oumi RL](https://img.shields.io/badge/Oumi-Reinforcement%20Learning-purple)
![Cline](https://img.shields.io/badge/Cline-AI%20CLI-orange)

**Production-ready hackathon project showcasing AI-powered emergency response coordination**

[Live Demo](#) | [Documentation](#architecture) | [API Reference](#api-endpoints)

</div>

---

## Overview

The **Disaster Response Orchestrator** is an intelligent emergency management system that combines cutting-edge AI technologies to optimize disaster response operations. Built for hackathon demonstration with production-quality code.

### Key Features

- **Real-time Disaster Monitoring**: Live dashboard with automatic updates
- **AI-Powered Analysis**: Cline CLI generates situation reports and recommendations
- **Intelligent Prioritization**: Oumi RL optimizes action priorities based on impact
- **Workflow Orchestration**: Kestra manages complex multi-step response pipelines
- **Resource Management**: Track and allocate emergency response resources
- **Live Dashboard**: Beautiful, responsive UI with real-time data

---

## Technology Stack

| Technology | Purpose | Integration |
|------------|---------|-------------|
| **Next.js 13** | Frontend & API | Deployed on Vercel |
| **Supabase** | Database & Edge Functions | Real-time subscriptions |
| **Kestra** | Workflow Orchestration | API-driven pipelines |
| **Oumi RL** | Priority Optimization | Reinforcement learning |
| **Cline CLI** | AI Analysis | Situation reports |
| **TypeScript** | Type Safety | Full-stack typing |
| **Tailwind CSS** | Styling | Responsive design |
| **shadcn/ui** | Component Library | Accessible UI |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    (Next.js + React + Tailwind)                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Disaster    │  │   Resource   │  │  Analytics   │         │
│  │  Management  │  │  Allocation  │  │  Dashboard   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               Supabase Edge Functions                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Kestra     │  │      AI      │  │      RL      │         │
│  │   Webhook    │  │  Summarize   │  │  Prioritize  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────┬────────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Kestra     │ │   Cline CLI  │ │   Oumi RL    │
│  Workflows   │ │  AI Engine   │ │   Model      │
└──────────────┘ └──────────────┘ └──────────────┘
         │           │           │
         └───────────┼───────────┘
                     ▼
         ┌────────────────────────┐
         │   Supabase PostgreSQL  │
         │   (Disaster Database)  │
         └────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Kestra instance (optional, for workflow testing)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd disaster-response-orchestrator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

### Database Setup

The database is automatically configured with:
- 6 core tables (disasters, ai_summaries, priority_actions, resources, resource_allocations, rl_decisions)
- Row Level Security (RLS) policies
- Sample resource data
- Optimized indexes

No manual setup required - everything is handled by migrations.

---

## Core Features

### 1. Disaster Reporting

Submit new disaster events via the UI or API:

```typescript
POST /api/disasters
{
  "title": "Major Earthquake in San Francisco",
  "description": "7.2 magnitude earthquake detected",
  "disaster_type": "earthquake",
  "severity": "critical",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "affected_population": 50000
}
```

**Automatic Processing:**
1. Creates disaster record in database
2. Triggers AI summarization via Cline
3. Generates priority actions via Oumi RL
4. Updates dashboard in real-time

### 2. AI Situation Analysis

Cline CLI generates comprehensive reports:

```bash
cd cline-cli
node generate-summary.js <disaster_id>
```

**Output:**
- Executive summary
- Key insights (5-7 critical points)
- Prioritized recommendations
- Confidence scores

### 3. RL-Based Priority Optimization

Oumi RL calculates optimal priority scores:

```python
from oumi_rl import OumiRLPriorityOptimizer

optimizer = OumiRLPriorityOptimizer()
actions = optimizer.optimize_actions(disaster_data)
```

**Considers:**
- Disaster severity and type
- Affected population
- Available resources
- Historical outcomes
- Time constraints

### 4. Workflow Orchestration

Kestra manages complex pipelines:

```yaml
# kestra/disaster-ingestion-workflow.yaml
tasks:
  - ingest-disaster
  - generate-ai-summary
  - generate-rl-priorities
  - notify-responders
```

**Features:**
- Parallel task execution
- Error handling and retries
- Event-driven triggers
- API integration

---

## API Endpoints

### Disasters

```
GET  /api/disasters          # List all disasters
POST /api/disasters          # Create new disaster
```

### Edge Functions

```
POST /functions/v1/kestra-webhook    # Kestra integration
POST /functions/v1/ai-summarize      # AI analysis
POST /functions/v1/rl-prioritize     # Priority optimization
```

---

## Database Schema

### disasters
- `id` (uuid): Primary key
- `title` (text): Disaster name
- `description` (text): Details
- `disaster_type` (text): earthquake, flood, fire, etc.
- `severity` (text): critical, high, medium, low
- `latitude`, `longitude` (numeric): Location
- `affected_population` (integer): People impacted
- `status` (text): active, responding, resolved

### ai_summaries
- `id` (uuid): Primary key
- `disaster_id` (uuid): Foreign key
- `summary` (text): AI-generated report
- `key_insights` (jsonb): Array of insights
- `recommended_actions` (jsonb): Array of recommendations
- `confidence_score` (numeric): 0-1

### priority_actions
- `id` (uuid): Primary key
- `disaster_id` (uuid): Foreign key
- `action_type` (text): rescue, medical, logistics, communication
- `description` (text): Action details
- `priority_score` (numeric): RL-calculated priority (0-100)
- `status` (text): pending, in_progress, completed, cancelled
- `estimated_impact` (integer): Expected people helped
- `deadline` (timestamptz): Time constraint

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Docker

```bash
docker build -t disaster-response .
docker run -p 3000:3000 disaster-response
```

---

## Hackathon Compliance

### Sponsor Requirements

✅ **Kestra AI Agent**
- Workflow orchestration in `kestra/` directory
- API integration via edge functions
- Event-driven disaster processing

✅ **Cline CLI**
- AI analysis scripts in `cline-cli/` directory
- Automated report generation
- Intelligent recommendations

✅ **Oumi Reinforcement Learning**
- RL model in `oumi-rl/` directory
- Priority optimization algorithm
- Continuous learning from feedback

✅ **Next.js on Vercel**
- Production-ready Next.js 13 app
- Optimized for Vercel deployment
- Real-time updates

✅ **CodeRabbit Compatible**
- Clean, modular architecture
- Comprehensive documentation
- TypeScript throughout
- Test coverage

---

## Demo Script

### 1. Show Dashboard (30 seconds)
- Open live URL
- Highlight real-time statistics
- Show empty state

### 2. Report Disaster (60 seconds)
- Click "Report Disaster"
- Fill form with dramatic scenario
- Submit and watch AI processing
- Show AI summary appearing

### 3. Explain Technology (90 seconds)
- Kestra: "Orchestrates the entire workflow"
- Cline: "Generates intelligent analysis"
- Oumi RL: "Optimizes priority decisions"
- Next.js: "Real-time dashboard"

### 4. Show Priority Actions (30 seconds)
- Navigate to Actions tab
- Explain RL priority scores
- Highlight highest priority

### 5. Q&A (60 seconds)
- Be ready to explain architecture
- Show code if requested
- Discuss scalability

---

## Code Quality

### Testing

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run typecheck     # TypeScript validation
```

### Linting

```bash
npm run lint          # ESLint
npm run format        # Prettier
```

### Code Coverage

Target: 80%+ coverage for critical paths

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request


---

## License

MIT License - see [LICENSE](LICENSE) for details

---

## Acknowledgments

- Kestra for workflow orchestration platform
- Oumi for reinforcement learning framework
- Cline for AI CLI capabilities
- Supabase for backend infrastructure
- Vercel for hosting platform

---

## Support

- Documentation: See `/docs` directory
- Issues: GitHub Issues

---

**Built with ❤️ for emergency responders worldwide**
