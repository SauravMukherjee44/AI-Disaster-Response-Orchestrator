# Kestra AI Workflow Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      DISASTER DATA SOURCES                       │
│  • JSON Files  • APIs  • Webhooks  • Social Media  • Sensors   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      KESTRA ORCHESTRATION                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           PHASE 1: DATA INGESTION                        │   │
│  │  • Fetch from multiple sources                           │   │
│  │  • Normalize data format                                 │   │
│  │  • Validate required fields                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │      PHASE 2: AI AGENT #1 - SITUATION ANALYSIS          │   │
│  │                                                           │   │
│  │  Model: GPT-4o-mini                                      │   │
│  │  Purpose: Comprehensive disaster assessment              │   │
│  │                                                           │   │
│  │  Analyzes:                                               │   │
│  │  ✓ Severity level (critical/high/medium/low)            │   │
│  │  ✓ Quantitative score (0-100)                           │   │
│  │  ✓ Affected locations and demographics                  │   │
│  │  ✓ Primary hazards and secondary risks                  │   │
│  │  ✓ Infrastructure status (roads, hospitals, utilities)  │   │
│  │  ✓ Time criticality (immediate/urgent/moderate)         │   │
│  │  ✓ Vulnerable populations                               │   │
│  │                                                           │   │
│  │  Output: Structured JSON                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │    PHASE 3: AI AGENT #2 - PRIORITY DETERMINATION        │   │
│  │                                                           │   │
│  │  Model: GPT-4o-mini (Temperature: 0.3)                  │   │
│  │  Purpose: Generate actionable response plans             │   │
│  │                                                           │   │
│  │  Generates Priority Actions:                             │   │
│  │                                                           │   │
│  │  🚨 RESCUE OPERATIONS                                    │   │
│  │     • Search & rescue priorities                         │   │
│  │     • Evacuation routes                                  │   │
│  │     • Trapped person locations                           │   │
│  │                                                           │   │
│  │  ⚕️  MEDICAL RESPONSE                                    │   │
│  │     • Triage requirements                                │   │
│  │     • Field hospital locations                           │   │
│  │     • Medical supply distribution                        │   │
│  │                                                           │   │
│  │  📦 LOGISTICS SUPPORT                                    │   │
│  │     • Supply distribution routes                         │   │
│  │     • Shelter coordination                               │   │
│  │     • Transportation management                          │   │
│  │                                                           │   │
│  │  Each action includes:                                   │   │
│  │  • Priority score (0-100)                                │   │
│  │  • Estimated impact (# people)                           │   │
│  │  • Required resources                                    │   │
│  │  • Time sensitivity                                      │   │
│  │  • Target locations                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         PHASE 4: DATABASE INTEGRATION                    │   │
│  │                                                           │   │
│  │  Stores in Supabase:                                     │   │
│  │  1. Disaster record                                      │   │
│  │  2. AI analysis summary                                  │   │
│  │  3. Priority actions (3+ per disaster)                   │   │
│  │  4. Workflow metadata                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │       PHASE 5: NOTIFICATIONS & ALERTS                    │   │
│  │                                                           │   │
│  │  Conditional:                                            │   │
│  │  • Critical severity → Immediate alerts                  │   │
│  │  • High severity → Priority notifications               │   │
│  │  • All severities → Dashboard updates                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
│                                                                   │
│  disasters                  ai_summaries              resources  │
│  ├─ id                      ├─ disaster_id            ├─ id      │
│  ├─ title                   ├─ summary                ├─ name    │
│  ├─ severity                ├─ key_insights           ├─ type    │
│  └─ location                └─ confidence_score       └─ status  │
│                                                                   │
│  priority_actions                    resource_allocations        │
│  ├─ disaster_id                      ├─ action_id                │
│  ├─ action_type (rescue/medical)     ├─ resource_id              │
│  ├─ description                      ├─ allocation_score         │
│  ├─ priority_score                   └─ status                   │
│  ├─ estimated_impact                                             │
│  └─ status                                                       │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              NEXT.JS DISASTER RESPONSE DASHBOARD                 │
│                                                                   │
│  📊 Real-Time Statistics                                         │
│  • Active disasters                                              │
│  • People affected                                               │
│  • Priority actions                                              │
│                                                                   │
│  🗺️  Interactive Disaster Map                                   │
│  • Geographic visualization                                      │
│  • Severity heatmaps                                             │
│                                                                   │
│  📋 Priority Action Management                                   │
│  • Sortable by priority score                                    │
│  • Filterable by type                                            │
│  • Status tracking (pending → in progress → completed)           │
│  • Resource assignment                                           │
│                                                                   │
│  🤖 AI Analysis Display                                          │
│  • Situation summaries                                           │
│  • Key insights                                                  │
│  • Recommendations                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Input → Kestra
```
Disaster Event Data
  ↓
Kestra Workflow Triggered (manual/scheduled/webhook)
  ↓
Data normalization and validation
```

### 2. AI Analysis Pipeline
```
Raw Disaster Data
  ↓
AI Agent #1: Situation Analysis
  ├─ Severity assessment
  ├─ Impact analysis
  ├─ Hazard identification
  └─ Infrastructure assessment
  ↓
Structured Analysis JSON
  ↓
AI Agent #2: Priority Determination
  ├─ Rescue operations
  ├─ Medical response
  └─ Logistics support
  ↓
Priority Actions JSON
```

### 3. Database Storage
```
Analysis Results
  ↓
Supabase REST API
  ├─ INSERT into disasters
  ├─ INSERT into ai_summaries
  └─ INSERT into priority_actions (multiple)
  ↓
Database triggers & functions
  ↓
Real-time updates to dashboard
```

## Workflow Files

### 1. `ai-agent-disaster-workflow.yaml`
**Advanced, Production-Ready**

- 9 orchestrated tasks
- Dual AI Agent system
- Multi-source data ingestion
- Error handling and logging
- Notification system
- ~250 lines

**Use Case**: Production deployments, complex scenarios

### 2. `simple-ai-workflow.yaml`
**Quick Start, Developer-Friendly**

- 6 streamlined tasks
- Direct AI analysis
- Single data source
- Simplified outputs
- ~150 lines

**Use Case**: Testing, demos, rapid prototyping

### 3. `disaster-ingestion-workflow.yaml`
**Original, API-Based**

- No AI Agents (uses external APIs)
- Basic orchestration
- Legacy support
- ~90 lines

**Use Case**: Environments without OpenAI access

## AI Agent Design

### Agent #1: Situation Analyst

**System Prompt Strategy:**
```
Expert disaster response analyst
→ Structured, objective analysis
→ Focus on facts and numbers
→ Consistent JSON output
```

**Input Processing:**
- Disaster description
- Location data
- Initial reports
- Infrastructure status

**Output Schema:**
```json
{
  "severity_level": "enum",
  "severity_score": "0-100",
  "affected_locations": "array",
  "primary_hazards": "array",
  "secondary_risks": "array",
  "estimated_affected_population": "integer",
  "vulnerable_groups": "array",
  "infrastructure_status": "object",
  "time_criticality": "enum",
  "summary": "string"
}
```

### Agent #2: Action Coordinator

**System Prompt Strategy:**
```
Expert emergency operations coordinator
→ Action-oriented, specific recommendations
→ Prioritization based on impact
→ Resource-aware planning
```

**Input Processing:**
- Agent #1 analysis
- Available resources
- Geographic constraints
- Time sensitivity

**Output Schema:**
```json
{
  "priority_areas": "array",
  "actions": {
    "rescue": "array of action objects",
    "medical": "array of action objects",
    "logistics": "array of action objects"
  },
  "overall_strategy": "string",
  "critical_gaps": "array"
}
```

**Action Object:**
```json
{
  "description": "Specific, actionable task",
  "priority_score": 0-100,
  "estimated_impact": "number of people",
  "required_resources": ["list"],
  "time_sensitivity": "immediate|hours|days",
  "target_locations": ["list"]
}
```

## Integration Points

### Kestra → Supabase
```http
POST /rest/v1/disasters
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json

{
  "title": "...",
  "severity": "...",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

### Kestra → OpenAI
```http
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer {OPENAI_API_KEY}
Content-Type: application/json

{
  "model": "gpt-4o-mini",
  "messages": [...],
  "temperature": 0.3
}
```

### Dashboard → Supabase
```javascript
const { data } = await supabase
  .from('disasters')
  .select('*, priority_actions(*), ai_summaries(*)')
  .order('created_at', { ascending: false });
```

## Performance Metrics

### AI Agent Latency
- Agent #1 (Analysis): ~3-5 seconds
- Agent #2 (Actions): ~4-6 seconds
- Total AI processing: ~8-11 seconds

### Database Operations
- Disaster insert: ~200ms
- AI summary insert: ~150ms
- Priority actions (3): ~300ms
- Total DB time: ~650ms

### End-to-End
- Simple workflow: ~10-12 seconds
- Advanced workflow: ~15-20 seconds
- With webhooks: Add ~1-2 seconds

## Cost Analysis

### Per Disaster Analysis

**OpenAI API (GPT-4o-mini):**
- Agent #1: ~500 tokens input, ~400 tokens output
- Agent #2: ~800 tokens input, ~600 tokens output
- Total: ~2,300 tokens
- Cost: ~$0.15 per disaster

**Supabase:**
- Database operations: Free tier sufficient
- Storage: Negligible (<1KB per disaster)

**Kestra:**
- Open source, self-hosted: Free
- Cloud: Volume-based pricing

### Monthly Estimates (100 disasters)
- OpenAI: $15/month
- Supabase: Free tier
- Kestra: Free (self-hosted)
- **Total: ~$15/month**

## Security Considerations

### Secrets Management
All sensitive data stored in Kestra secrets:
- `OPENAI_API_KEY` (encrypted)
- `SUPABASE_URL` (encrypted)
- `SUPABASE_ANON_KEY` (encrypted)

### API Security
- Supabase RLS policies enforce data access
- OpenAI API key rate-limited
- Webhook endpoints require authentication

### Data Privacy
- No PII stored in AI prompts
- All data encrypted in transit (HTTPS)
- Database encrypted at rest (Supabase)

## Scalability

### Horizontal Scaling
- Kestra: Multiple workers
- Supabase: Auto-scaling
- OpenAI: Rate limit 3,500 RPM (sufficient)

### Vertical Optimization
- Batch similar disasters
- Cache common analyses
- Parallel workflow execution

### Bottlenecks
1. OpenAI API rate limits (mitigated by queuing)
2. Database connection pool (increased if needed)
3. Kestra worker capacity (add workers)

## Monitoring & Observability

### Kestra UI
- Execution history
- Task-level logs
- Performance metrics
- Error tracking

### Supabase Dashboard
- Query performance
- Row counts
- API usage
- Error rates

### Custom Metrics
```javascript
// Track workflow success rate
const successRate =
  (completed / total) * 100;

// Monitor AI response times
const avgLatency =
  totalTime / executionCount;

// Database insert performance
const dbPerf =
  insertsPerSecond;
```

## Future Enhancements

### Phase 2 Features
- [ ] Multi-modal analysis (images, videos)
- [ ] Social media sentiment integration
- [ ] Predictive modeling with ML
- [ ] Real-time collaboration features

### Phase 3 Features
- [ ] Multi-language support (i18n)
- [ ] Mobile app integration
- [ ] Satellite imagery analysis
- [ ] Drone coordination

### Phase 4 Features
- [ ] Federated learning across agencies
- [ ] Blockchain for audit trails
- [ ] VR/AR for crisis visualization
- [ ] Autonomous resource allocation

## Troubleshooting

### Common Issues

**❌ OpenAI API Errors**
- Check API key validity
- Verify quota/limits
- Review prompt format

**❌ Supabase Connection Failed**
- Verify URL and keys
- Check RLS policies
- Review network connectivity

**❌ Workflow Execution Failed**
- Check Kestra logs
- Verify all secrets set
- Review JSON format

**❌ Invalid AI Response**
- Temperature too high (use 0.3)
- Prompt clarity issues
- Model availability

## Best Practices

### Workflow Design
1. Keep tasks atomic and focused
2. Use descriptive task IDs
3. Log important state changes
4. Handle errors gracefully

### AI Prompts
1. Be specific and structured
2. Request JSON output explicitly
3. Provide clear examples
4. Use appropriate temperature

### Database Operations
1. Use transactions where needed
2. Validate data before insert
3. Handle unique constraints
4. Index frequently queried fields

### Testing
1. Test with sample data files
2. Validate AI outputs manually
3. Check database integrity
4. Monitor for edge cases

## Documentation References

- [Kestra Documentation](https://kestra.io/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated**: 2024-12-14
**Version**: 2.0
**Maintained by**: Disaster Response Team
