# Oumi RL Training Guide

## Overview

This guide demonstrates how to use the Oumi RL implementation for disaster response optimization. The system uses Reinforcement Learning to learn optimal resource allocation policies.

## Key Components

### 1. State Space

The RL agent observes the following state features:

- **Severity** (0-3): Disaster severity level
  - 0 = Low
  - 1 = Medium
  - 2 = High
  - 3 = Critical

- **Number of Alerts** (0-10+): Active emergency alerts requiring response

- **Response Delay** (hours): Time elapsed since disaster onset

- **Available Resources** (0-20): Units of resources available for deployment

- **Disaster Type**: Encoded disaster category (earthquake, flood, fire, etc.)

### 2. Action Space

The agent can take three types of actions, each with allocation levels (0-10 units):

- **Rescue Allocation**: Deploy search and rescue teams
- **Medical Deployment**: Deploy medical response units
- **Logistics Routing**: Allocate supply distribution resources

### 3. Reward Function

The reward function incentivizes optimal disaster response:

#### Positive Rewards (+)
- **Fast Response** (+30 max): Rewards decrease with response time
  - ≤ 2 hours: +30 points
  - ≤ 6 hours: +20 points
  - ≤ 12 hours: +10 points

- **High Impact** (+40 max): Based on people helped vs. estimated need

- **Resource Efficiency** (+20 max): Optimal resource allocation
  - Penalty for over-allocation
  - Penalty for under-allocation

- **Action Appropriateness** (+10 max): Context-aware action selection

#### Negative Penalties (-)
- **Delays**: -2 points per hour beyond 12 hours
- **Resource Waste**: -5 points per over-allocated unit
- **Low Impact**: Reduced reward for insufficient response

Total reward range: **[-50, +100]**

## Training Process

### Step 1: Install Dependencies

```bash
cd oumi-rl
pip install -r requirements.txt
```

### Step 2: Run Training

```bash
python train_rl_model.py
```

This will:
1. Initialize the RL agent with random policy
2. Run 1000 simulated disaster episodes
3. Update the policy using Q-learning
4. Save the learned policy to `learned_policy.json`

### Step 3: Monitor Training

Training output shows:
```
Episode 100/1000 | Avg Reward (last 100): 45.23
Episode 200/1000 | Avg Reward (last 100): 52.18
Episode 300/1000 | Avg Reward (last 100): 58.91
...
```

### Step 4: Evaluate Policy

After training, the script demonstrates the learned policy on 5 sample scenarios:

```
--- Scenario 1 ---
State: State(sev=2, alerts=7, delay=3.2h, res=15)
Action (rescue): Action(rescue=8, medical=5, logistics=4)
Outcome: {'response_time_hours': 1.5, 'people_helped': 1847}
Reward: 78.45
```

## RL Algorithm Details

### Q-Learning with Function Approximation

The agent uses Q-learning with linear function approximation:

**Q(s, a) = w · φ(s, a)**

Where:
- **s**: Current state
- **a**: Action taken
- **φ(s, a)**: Feature vector (concatenation of state and action features)
- **w**: Weight vector (learned parameters)

### Update Rule

**w ← w + α · δ · φ(s, a)**

Where:
- **α**: Learning rate (0.01)
- **δ**: TD error = r + γ · max_a' Q(s', a') - Q(s, a)
- **γ**: Discount factor (0.95)

### Exploration Strategy

**ε-greedy policy** with ε = 0.2:
- 20% of the time: Select random action (exploration)
- 80% of the time: Select action with highest Q-value (exploitation)

## Integration with Application

### 1. UI Training Button

Users can trigger RL training from the Learning page:

```typescript
// Click "Train RL Model" button
// Sends POST request to /api/rl-train
// Trains for 1000 episodes
// Displays final average reward
```

### 2. Automatic Priority Scoring

When new disasters are ingested, the RL model automatically:
1. Extracts state features from disaster data
2. Queries the learned policy
3. Generates priority scores for actions
4. Stores decisions in `rl_training_data` table

### 3. Continuous Learning

As actions are completed:
1. System calculates actual reward
2. Updates RL training data with outcome
3. Policy can be retrained with new data
4. Model improves over time

## Performance Metrics

Track RL model performance:

### Training Metrics
- **Average Reward**: Mean reward over episodes
- **TD Error**: Temporal difference error magnitude
- **Q-Value Stability**: Convergence of Q-values

### Deployment Metrics
- **Response Time**: Average time to initiate response
- **Resource Efficiency**: Used vs. allocated ratio
- **Impact**: Total people helped
- **Success Rate**: Percentage of successful actions

## Example Training Session

```
======================================================================
Oumi RL Training: Disaster Response Optimization
======================================================================

Training for 1000 episodes...

State Space: severity, num_alerts, response_delay, resources, type
Action Space: rescue_allocation, medical_deployment, logistics_routing
Reward: +fast response, +high impact, +efficiency, -delays, -waste

Episode 100/1000 | Avg Reward (last 100): 43.52
Episode 200/1000 | Avg Reward (last 100): 51.84
Episode 300/1000 | Avg Reward (last 100): 58.23
Episode 400/1000 | Avg Reward (last 100): 62.91
Episode 500/1000 | Avg Reward (last 100): 66.45
Episode 600/1000 | Avg Reward (last 100): 68.72
Episode 700/1000 | Avg Reward (last 100): 70.38
Episode 800/1000 | Avg Reward (last 100): 71.56
Episode 900/1000 | Avg Reward (last 100): 72.23
Episode 1000/1000 | Avg Reward (last 100): 72.81

======================================================================
Training Complete!
======================================================================
Total Episodes: 1000
Final Average Reward: 72.81
Policy saved to: oumi-rl/learned_policy.json

======================================================================
Policy Demonstration
======================================================================

--- Scenario 1 ---
State: State(sev=3, alerts=8, delay=1.2h, res=18)
Action (rescue): Action(rescue=9, medical=6, logistics=5)
Outcome: {'response_time_hours': 0.8, 'people_helped': 2453}
Reward: 89.34

--- Scenario 2 ---
State: State(sev=1, alerts=3, delay=5.7h, res=10)
Action (medical): Action(rescue=3, medical=7, logistics=4)
Outcome: {'response_time_hours': 4.2, 'people_helped': 896}
Reward: 61.28
```

## Advanced Topics

### Multi-Episode Training

For production deployment, train on more episodes:

```python
agent = train_agent(num_episodes=10000)
```

### Transfer Learning

Load pre-trained policy and continue training:

```python
agent = OumiRLAgent()
agent.load_policy('oumi-rl/learned_policy.json')
# Continue training
```

### Hyperparameter Tuning

Adjust learning parameters:

```python
agent = OumiRLAgent(
    learning_rate=0.005,  # Lower for stability
    discount_factor=0.99,  # Higher for long-term planning
    epsilon=0.1,  # Lower for more exploitation
)
```

## Deployment Checklist

- [ ] Train RL model on historical data
- [ ] Validate performance on test scenarios
- [ ] Deploy learned policy to production
- [ ] Monitor real-world performance
- [ ] Collect feedback for retraining
- [ ] Update model periodically
- [ ] Track version history

## Troubleshooting

### Low Training Reward
- Increase number of episodes
- Adjust learning rate
- Check reward function design

### Unstable Q-Values
- Reduce learning rate
- Increase discount factor
- Add experience replay

### Poor Generalization
- Collect more diverse training data
- Add regularization
- Use neural network function approximation

## Resources

- **Oumi Documentation**: Core RL algorithms
- **Training Script**: `train_rl_model.py`
- **Policy File**: `learned_policy.json`
- **API Endpoint**: `/api/rl-train`
- **UI Dashboard**: `/learning` page
