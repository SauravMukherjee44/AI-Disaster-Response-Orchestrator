# Kestra AI Workflows - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Start Kestra (30 seconds)
```bash
docker run --rm -it -p 8080:8080 kestra/kestra:latest server local
```

Open: http://localhost:8080

### Step 2: Configure Secrets (2 minutes)

**In Kestra UI** → Settings → Secrets:

| Secret Name | Value | Required For |
|-------------|-------|--------------|
| `OPENAI_API_KEY` | `sk-...` | AI Workflows |
| `SUPABASE_URL` | `https://xxx.supabase.co` | All Workflows |
| `SUPABASE_ANON_KEY` | `eyJ...` | All Workflows |

### Step 3: Create Workflow (1 minute)

1. Click **Flows** → **Create**
2. Copy contents from `simple-ai-workflow.yaml`
3. Click **Save**

### Step 4: Execute! (1 minute)

Click **Execute** and paste:

```json
{
  "disaster_title": "7.2 Earthquake - San Francisco",
  "disaster_description": "Major earthquake with building collapses",
  "disaster_type": "earthquake",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "affected_population": 50000
}
```

Click **Execute** → Watch it run! ✨

---

## 🎯 Sample Executions

### Example 1: Earthquake Response
```json
{
  "disaster_title": "Major Earthquake Strikes Bay Area",
  "disaster_description": "7.2 magnitude earthquake. Multiple building collapses in downtown Oakland and San Francisco. Highway 880 severely damaged. BART service suspended. 150 confirmed casualties, 2500 injured. 50,000 displaced. Power outages affecting 750,000 residents.",
  "disaster_type": "earthquake",
  "latitude": 37.8044,
  "longitude": -122.2712,
  "affected_population": 3500000
}
```

**Expected AI Output:**
- Severity: `critical` (Score: 92)
- Top Action: Search & rescue in collapsed buildings
- Priority: Immediate medical triage
- Resources: Field hospitals, heavy rescue equipment

---

### Example 2: Flood Emergency
```json
{
  "disaster_title": "Catastrophic Flooding - Houston",
  "disaster_description": "22 inches of rain in 48 hours. Major highways submerged. Buffalo Bayou 15 feet above flood stage. 45,000 homes flooded. 120,000 displaced. Swift water rescues ongoing. Chemical plants at risk.",
  "disaster_type": "flood",
  "latitude": 29.7604,
  "longitude": -95.3698,
  "affected_population": 2800000
}
```

**Expected AI Output:**
- Severity: `high` (Score: 88)
- Top Action: Swift water rescue operations
- Priority: Contamination prevention
- Resources: Boats, helicopters, pumping equipment

---

### Example 3: Wildfire Crisis
```json
{
  "disaster_title": "Massive Wildfire Threatens Communities",
  "disaster_description": "10,000 acre wildfire spreading rapidly. 50 mph winds. Mandatory evacuations for 15,000 residents. Air quality hazardous. Multiple structures destroyed. Fire containment at 0%.",
  "disaster_type": "wildfire",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "affected_population": 85000
}
```

**Expected AI Output:**
- Severity: `high` (Score: 85)
- Top Action: Coordinated evacuation
- Priority: Air quality monitoring, shelter setup
- Resources: Fire crews, evacuation transport, air filtration

---

## 📊 Understanding the Output

### In Kestra UI (Executions Tab)

**Task: `ai-situation-summary`**
```json
{
  "severity_level": "critical",
  "severity_score": 92,
  "key_concerns": [
    "Building collapse risk",
    "Gas line ruptures",
    "Overwhelmed hospitals"
  ],
  "immediate_needs": [
    "Search and rescue teams",
    "Medical supplies",
    "Temporary shelter"
  ]
}
```

**Task: `ai-priority-actions`**
```json
{
  "priority_area": "Downtown Oakland",
  "recommended_actions": [
    {
      "type": "rescue",
      "description": "Deploy urban search & rescue teams to collapsed buildings on Broadway and 14th Street",
      "priority_score": 95,
      "estimated_impact": 300
    },
    {
      "type": "medical",
      "description": "Establish field hospital at Lake Merritt for triage and emergency treatment",
      "priority_score": 90,
      "estimated_impact": 2500
    },
    {
      "type": "logistics",
      "description": "Set up emergency shelter at Oakland Convention Center for displaced residents",
      "priority_score": 85,
      "estimated_impact": 5000
    }
  ]
}
```

### In Your Dashboard (http://localhost:3000)

1. **New disaster appears** in disasters list
2. **AI Summary shows** in AI Analysis panel
3. **3 Priority Actions created** in Actions tab
4. **Click any action** to manage and assign resources

---

## 🔄 Workflow Comparison

| Feature | Simple Workflow | Advanced Workflow |
|---------|----------------|-------------------|
| **Setup Time** | 5 minutes | 10 minutes |
| **AI Agents** | 2 (streamlined) | 2 (comprehensive) |
| **Data Sources** | Single input | Multiple (files, APIs, webhooks) |
| **Analysis Depth** | Basic | Detailed |
| **Output Detail** | 3 actions | 3+ actions with full analysis |
| **Notifications** | None | Critical alerts |
| **Best For** | Testing, demos | Production, complex scenarios |

---

## 🎬 Video Workflow (In Words)

**Watch the magic happen:**

1. **0:00** - Workflow starts, logs show "Starting analysis..."
2. **0:02** - Data fetched and normalized
3. **0:05** - AI Agent #1 analyzing situation... (spinner shows)
4. **0:10** - Analysis complete! Severity: CRITICAL
5. **0:12** - AI Agent #2 determining actions... (spinner shows)
6. **0:18** - Actions generated! 3 priority tasks created
7. **0:19** - Storing in Supabase database...
8. **0:20** - ✅ SUCCESS! Disaster ID: abc-123
9. **0:21** - Dashboard auto-refreshes with new data

**Total Time**: ~20 seconds

---

## 🚀 Advanced: Using Sample Data Files

### Option 1: Load from File

1. Upload `sample-earthquake-data.json` to a web server
2. In workflow, change input:
```json
{
  "data_source": "file",
  "json_file_path": "https://your-server/sample-earthquake-data.json"
}
```

### Option 2: Load from API

Use live earthquake data:
```json
{
  "data_source": "api",
  "api_endpoint": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson"
}
```

### Option 3: Webhook Trigger

Setup automatic execution:

1. In workflow, enable webhook trigger
2. Copy webhook URL from Kestra
3. Configure your monitoring system to POST to webhook
4. Workflow auto-executes on disaster events!

---

## 🛠️ Troubleshooting

### ❌ "OpenAI API Error"
**Problem**: Invalid API key or quota exceeded

**Solution**:
1. Check secret: `OPENAI_API_KEY` is correct
2. Verify OpenAI account has credits
3. Check usage: https://platform.openai.com/usage

---

### ❌ "Supabase Connection Failed"
**Problem**: Cannot reach Supabase

**Solution**:
1. Verify `SUPABASE_URL` format: `https://xxx.supabase.co`
2. Check `SUPABASE_ANON_KEY` is anon key (not service role)
3. Test connection: `curl https://xxx.supabase.co/rest/v1/`

---

### ❌ "Invalid JSON from AI"
**Problem**: AI returned malformed JSON

**Solution**:
1. This is rare - usually self-corrects on retry
2. Check prompt hasn't been modified
3. Verify model is `gpt-4o-mini`
4. Temperature should be 0.3 (not higher)

---

### ❌ "Workflow Not Creating Actions"
**Problem**: Data inserted but actions missing

**Solution**:
1. Check Kestra logs for task `create-actions`
2. Verify AI Agent #2 completed successfully
3. Check Supabase table permissions
4. Review RLS policies on `priority_actions` table

---

## 💡 Pro Tips

### Tip 1: Test with Low Priority First
Start with `affected_population: 1000` to test without overwhelming your system.

### Tip 2: Watch the Logs
Kestra logs show AI responses in real-time. Great for learning!

### Tip 3: Customize Severity Thresholds
Edit the AI Agent prompt to adjust what counts as "critical" vs "high" severity.

### Tip 4: Batch Processing
Run multiple disasters by uploading a JSON array and using `EachSequential`.

### Tip 5: Monitor Costs
OpenAI dashboard shows token usage. ~2,300 tokens = ~$0.15 per disaster.

---

## 📱 What's Next?

After your first successful execution:

1. ✅ **Check Dashboard**: See your disaster and actions live
2. ✅ **Manage Actions**: Click an action to assign resources
3. ✅ **Update Status**: Mark actions in progress or completed
4. ✅ **Run More Tests**: Try different disaster types
5. ✅ **Customize Prompts**: Adjust AI behavior for your needs

---

## 🎓 Learning Path

### Beginner (Day 1)
- [x] Run simple workflow with sample data
- [ ] Understand AI Agent outputs
- [ ] Explore dashboard features

### Intermediate (Week 1)
- [ ] Customize AI Agent prompts
- [ ] Add webhook triggers
- [ ] Integrate external APIs

### Advanced (Month 1)
- [ ] Deploy to production
- [ ] Add monitoring & alerts
- [ ] Optimize for scale
- [ ] Build custom integrations

---

## 📚 Additional Resources

- **Full Documentation**: [KESTRA-AI-WORKFLOW-GUIDE.md](./KESTRA-AI-WORKFLOW-GUIDE.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Kestra Docs**: https://kestra.io/docs
- **OpenAI API**: https://platform.openai.com/docs

---

## 🆘 Need Help?

1. Check logs in Kestra UI (Executions → Click execution → View logs)
2. Review sample data files for correct format
3. Verify all secrets are configured
4. Test Supabase connection independently

**Common Success Indicators:**
- ✅ Workflow status: SUCCESS (green)
- ✅ All tasks completed (no red X)
- ✅ Database records created (check Supabase)
- ✅ Dashboard shows new disaster

---

**You're all set! Start orchestrating intelligent disaster response! 🚨**
