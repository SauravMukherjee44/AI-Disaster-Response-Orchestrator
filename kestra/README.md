# Kestra Workflow Integration

This directory contains Kestra workflows for orchestrating disaster response operations with AI-powered analysis.

## 🤖 AI-Powered Workflows

### ⭐ **NEW: AI Agent Workflows**

We now have **two advanced workflows** that use Kestra's built-in AI Agents to intelligently analyze disasters and generate priority actions:

#### 1. `ai-agent-disaster-workflow.yaml` - **Advanced AI Analysis**
**Full-featured AI Agent workflow with comprehensive disaster intelligence**

- 🧠 **Dual AI Agent System**:
  - **Agent 1**: Analyzes situation (severity, locations, hazards, infrastructure)
  - **Agent 2**: Determines priority actions (rescue, medical, logistics)
- 📊 Multi-source data ingestion (JSON files, APIs, webhooks)
- 🎯 Intelligent severity scoring (0-100)
- 📍 Geographic priority identification
- 💾 Automatic Supabase database integration
- 🚨 Critical alert notifications
- 📈 Structured JSON output for dashboards

**[Read Full Documentation →](./KESTRA-AI-WORKFLOW-GUIDE.md)**

#### 2. `simple-ai-workflow.yaml` - **Quick Start**
**Simplified AI workflow for rapid deployment**

- Perfect for testing and demos
- Single-step AI analysis
- Minimal configuration
- Direct integration with Supabase

### 📋 Original Workflow

#### 3. `disaster-ingestion-workflow.yaml` - **Basic Pipeline**
Original workflow using external API endpoints (without AI Agents)

## 🚀 Quick Start

### Prerequisites

1. **Install Kestra**:
```bash
docker run --rm -it -p 8080:8080 kestra/kestra:latest server local
```

2. **Access Kestra UI**: http://localhost:8080

3. **Configure Secrets** (Settings → Secrets):
   - `OPENAI_API_KEY`: Your OpenAI API key (**required for AI workflows**)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

### Execute Your First AI Workflow

1. Create a new flow in Kestra UI
2. Copy contents of `simple-ai-workflow.yaml`
3. Save and execute with these inputs:

```json
{
  "disaster_title": "Earthquake in San Francisco",
  "disaster_description": "7.2 magnitude earthquake, multiple buildings damaged",
  "disaster_type": "earthquake",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "affected_population": 50000
}
```

**Result**: AI automatically analyzes the disaster and creates 3 priority actions in your database!

## 📊 Sample Data Files

Use these pre-formatted disaster scenarios for testing:

- **`sample-earthquake-data.json`**: 7.2 magnitude SF Bay Area earthquake
- **`sample-flood-data.json`**: Catastrophic Houston flooding

## 🔄 Workflow Outputs

All AI workflows generate structured JSON:

```json
{
  "situation_analysis": {
    "severity_level": "critical",
    "severity_score": 92,
    "affected_locations": [...],
    "primary_hazards": [...],
    "infrastructure_status": {...}
  },
  "priority_actions": {
    "rescue": [{...}],
    "medical": [{...}],
    "logistics": [{...}]
  }
}
```

## 🎯 Integration with Dashboard

AI workflows automatically populate your disaster response dashboard:

1. ✅ **Disaster created** → Appears in disasters list
2. ✅ **AI Summary** → Shows in AI Analysis panel
3. ✅ **Priority Actions** → Appears in Actions tab with priority scores
4. ✅ **RL Optimization** → Actions ranked by impact

View live at: `http://localhost:3000`

## 📡 Advanced Features

### Real-Time API Integration
```yaml
inputs:
  data_source: "api"
  api_endpoint: "https://earthquake.usgs.gov/earthquakes/feed/..."
```

### Webhook Triggers
Receive real-time disaster alerts from external systems

### Scheduled Monitoring
Poll disaster data sources every 15 minutes

## 📚 Documentation

**Comprehensive Guide**: [KESTRA-AI-WORKFLOW-GUIDE.md](./KESTRA-AI-WORKFLOW-GUIDE.md)

Includes:
- Detailed setup instructions
- AI Agent architecture
- Sample executions
- Cost optimization tips
- Troubleshooting guide

## 🛠️ Monitoring

- View executions in Kestra UI
- Check AI Agent responses in logs
- Monitor Supabase integration
- Track API costs and usage

## 🔧 Customization

Extend workflows with:
- Additional AI analysis models
- Multi-language support
- Image/satellite data analysis
- Social media sentiment
- Predictive modeling
- Custom notification channels (Slack, PagerDuty)
