"""
Oumi RL Training for Disaster Response Optimization

This module implements a full Reinforcement Learning training pipeline using
Oumi RL concepts for optimizing disaster response actions.

State Space:
- Severity level (0-3: low, medium, high, critical)
- Number of active alerts (normalized)
- Response delay in hours (normalized)
- Available resources (normalized)
- Disaster type (encoded)

Action Space:
- Rescue allocation (0-10 units)
- Medical deployment (0-10 units)
- Logistics routing (0-10 units)

Reward Function:
- Positive: Fast response time, high people helped, efficient resource use
- Negative: Delays, resource waste, low impact
"""

import json
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import random


class DisasterState:
    """Represents the state of a disaster response scenario"""

    def __init__(
        self,
        severity: int,  # 0-3
        num_alerts: int,  # Number of active alerts
        response_delay: float,  # Hours since disaster
        available_resources: int,  # Available units
        disaster_type: str,  # earthquake, flood, etc.
    ):
        self.severity = severity
        self.num_alerts = num_alerts
        self.response_delay = response_delay
        self.available_resources = available_resources
        self.disaster_type = disaster_type

        # Type encoding
        self.type_map = {
            'earthquake': 0, 'flood': 1, 'fire': 2,
            'hurricane': 3, 'tornado': 4, 'tsunami': 5
        }

    def to_vector(self) -> np.ndarray:
        """Convert state to feature vector"""
        return np.array([
            self.severity / 3.0,  # Normalized severity
            min(self.num_alerts / 10.0, 1.0),  # Normalized alerts
            min(self.response_delay / 24.0, 1.0),  # Normalized delay
            min(self.available_resources / 20.0, 1.0),  # Normalized resources
            self.type_map.get(self.disaster_type, 0) / 5.0,  # Normalized type
        ])

    def __repr__(self):
        return f"State(sev={self.severity}, alerts={self.num_alerts}, delay={self.response_delay:.1f}h, res={self.available_resources})"


class DisasterAction:
    """Represents an action taken in disaster response"""

    def __init__(
        self,
        rescue_allocation: int,  # 0-10
        medical_deployment: int,  # 0-10
        logistics_routing: int,  # 0-10
    ):
        self.rescue_allocation = rescue_allocation
        self.medical_deployment = medical_deployment
        self.logistics_routing = logistics_routing

    def total_resources(self) -> int:
        """Total resources used"""
        return self.rescue_allocation + self.medical_deployment + self.logistics_routing

    def to_vector(self) -> np.ndarray:
        """Convert action to vector"""
        return np.array([
            self.rescue_allocation / 10.0,
            self.medical_deployment / 10.0,
            self.logistics_routing / 10.0,
        ])

    def __repr__(self):
        return f"Action(rescue={self.rescue_allocation}, medical={self.medical_deployment}, logistics={self.logistics_routing})"


class RewardFunction:
    """Calculates rewards for disaster response actions"""

    @staticmethod
    def calculate(
        state: DisasterState,
        action: DisasterAction,
        outcome: Dict
    ) -> float:
        """
        Calculate reward based on action outcome

        Positive rewards:
        - Fast response (low delay)
        - High people helped
        - Efficient resource use

        Negative rewards:
        - Excessive delay
        - Resource waste
        - Low impact
        """
        reward = 0.0

        # 1. Response Time Reward (max +30)
        response_time = outcome.get('response_time_hours', state.response_delay)
        if response_time <= 2.0:
            reward += 30  # Very fast response
        elif response_time <= 6.0:
            reward += 20  # Fast response
        elif response_time <= 12.0:
            reward += 10  # Moderate response
        else:
            reward -= (response_time - 12.0) * 2  # Penalty for delays

        # 2. Impact Reward (max +40)
        people_helped = outcome.get('people_helped', 0)
        estimated_need = state.severity * 500 + state.num_alerts * 100
        impact_ratio = min(people_helped / max(estimated_need, 1), 1.0)
        reward += impact_ratio * 40

        # 3. Resource Efficiency Reward (max +20)
        resources_used = action.total_resources()
        resources_needed = min(state.severity * 3 + state.num_alerts, 15)
        efficiency = 1.0 - abs(resources_used - resources_needed) / max(resources_needed, 1)
        reward += efficiency * 20

        # 4. Resource Waste Penalty
        if resources_used > state.available_resources:
            reward -= (resources_used - state.available_resources) * 5  # Over-allocation penalty

        # 5. Action Appropriateness (max +10)
        if state.severity >= 2:  # High or critical
            if action.rescue_allocation >= 5:
                reward += 5
            if action.medical_deployment >= 4:
                reward += 5

        return max(min(reward, 100), -50)  # Clip reward to [-50, 100]


class OumiRLAgent:
    """
    Oumi RL Agent for Disaster Response Optimization

    Uses Q-learning with function approximation to learn optimal policies
    """

    def __init__(
        self,
        learning_rate: float = 0.01,
        discount_factor: float = 0.95,
        epsilon: float = 0.2,
    ):
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon

        # Q-function approximation: state-action value weights
        self.weights = {
            'rescue': np.random.randn(8) * 0.1,  # 5 state + 3 action features
            'medical': np.random.randn(8) * 0.1,
            'logistics': np.random.randn(8) * 0.1,
        }

        self.training_history = []

    def features(self, state: DisasterState, action: DisasterAction) -> np.ndarray:
        """Extract features from state-action pair"""
        state_vec = state.to_vector()
        action_vec = action.to_vector()
        return np.concatenate([state_vec, action_vec])

    def q_value(self, state: DisasterState, action: DisasterAction, action_type: str) -> float:
        """Calculate Q-value for state-action pair"""
        feat = self.features(state, action)
        weights = self.weights.get(action_type, self.weights['rescue'])
        return float(np.dot(feat, weights))

    def select_action(self, state: DisasterState, explore: bool = True) -> Tuple[DisasterAction, str]:
        """
        Select action using epsilon-greedy policy

        Returns: (action, action_type)
        """
        # Epsilon-greedy exploration
        if explore and random.random() < self.epsilon:
            # Random action
            action_type = random.choice(['rescue', 'medical', 'logistics'])
            action = DisasterAction(
                rescue_allocation=random.randint(0, min(10, state.available_resources)),
                medical_deployment=random.randint(0, min(10, state.available_resources)),
                logistics_routing=random.randint(0, min(10, state.available_resources)),
            )
        else:
            # Greedy action: select best action
            best_q = -float('inf')
            best_action = None
            best_type = 'rescue'

            for action_type in ['rescue', 'medical', 'logistics']:
                # Generate candidate actions
                for i in range(5):  # Sample 5 actions per type
                    if action_type == 'rescue':
                        action = DisasterAction(
                            rescue_allocation=min(state.severity * 3, 10),
                            medical_deployment=random.randint(1, 5),
                            logistics_routing=random.randint(1, 5),
                        )
                    elif action_type == 'medical':
                        action = DisasterAction(
                            rescue_allocation=random.randint(1, 5),
                            medical_deployment=min(state.severity * 3, 10),
                            logistics_routing=random.randint(1, 5),
                        )
                    else:  # logistics
                        action = DisasterAction(
                            rescue_allocation=random.randint(1, 5),
                            medical_deployment=random.randint(1, 5),
                            logistics_routing=min(state.severity * 3, 10),
                        )

                    q = self.q_value(state, action, action_type)
                    if q > best_q:
                        best_q = q
                        best_action = action
                        best_type = action_type

            action = best_action or DisasterAction(5, 5, 5)
            action_type = best_type

        return action, action_type

    def update(
        self,
        state: DisasterState,
        action: DisasterAction,
        action_type: str,
        reward: float,
        next_state: Optional[DisasterState] = None
    ):
        """Update Q-function weights using TD learning"""
        features = self.features(state, action)

        # Current Q-value
        q_current = self.q_value(state, action, action_type)

        # TD target
        if next_state is None:
            td_target = reward
        else:
            next_action, next_type = self.select_action(next_state, explore=False)
            q_next = self.q_value(next_state, next_action, next_type)
            td_target = reward + self.discount_factor * q_next

        # TD error
        td_error = td_target - q_current

        # Update weights
        self.weights[action_type] += self.learning_rate * td_error * features

        # Log training step
        self.training_history.append({
            'state': state.to_vector().tolist(),
            'action': action.to_vector().tolist(),
            'action_type': action_type,
            'reward': reward,
            'td_error': td_error,
            'q_value': q_current,
        })

    def save_policy(self, filepath: str):
        """Save learned policy to file"""
        policy_data = {
            'weights': {k: v.tolist() for k, v in self.weights.items()},
            'hyperparameters': {
                'learning_rate': self.learning_rate,
                'discount_factor': self.discount_factor,
                'epsilon': self.epsilon,
            },
            'training_episodes': len(self.training_history),
            'timestamp': datetime.now().isoformat(),
        }

        with open(filepath, 'w') as f:
            json.dump(policy_data, f, indent=2)

        print(f"Policy saved to {filepath}")

    def load_policy(self, filepath: str):
        """Load learned policy from file"""
        with open(filepath, 'r') as f:
            policy_data = json.load(f)

        self.weights = {k: np.array(v) for k, v in policy_data['weights'].items()}
        print(f"Policy loaded from {filepath}")


class DisasterSimulator:
    """Simulates disaster scenarios for RL training"""

    def __init__(self):
        self.reward_fn = RewardFunction()

    def generate_state(self) -> DisasterState:
        """Generate random disaster state"""
        return DisasterState(
            severity=random.randint(0, 3),
            num_alerts=random.randint(1, 10),
            response_delay=random.uniform(0, 12),
            available_resources=random.randint(5, 20),
            disaster_type=random.choice(['earthquake', 'flood', 'fire', 'hurricane']),
        )

    def simulate_outcome(self, state: DisasterState, action: DisasterAction) -> Dict:
        """Simulate outcome of taking action in state"""
        # Simulate response time based on action and state
        base_time = state.response_delay

        # More resources = faster response
        speedup = action.total_resources() / 10.0
        response_time = max(base_time - speedup, 0.5)

        # Simulate people helped
        severity_factor = (state.severity + 1) * 250
        action_factor = action.total_resources() / 15.0
        people_helped = int(severity_factor * action_factor * random.uniform(0.7, 1.3))

        return {
            'response_time_hours': response_time,
            'people_helped': people_helped,
            'resources_used': action.total_resources(),
        }

    def run_episode(self, agent: OumiRLAgent) -> float:
        """Run one training episode"""
        state = self.generate_state()
        action, action_type = agent.select_action(state, explore=True)
        outcome = self.simulate_outcome(state, action)
        reward = self.reward_fn.calculate(state, action, outcome)

        agent.update(state, action, action_type, reward)

        return reward


def train_agent(num_episodes: int = 1000) -> OumiRLAgent:
    """
    Train Oumi RL agent on simulated disaster episodes

    Args:
        num_episodes: Number of training episodes

    Returns:
        Trained agent
    """
    print("=" * 70)
    print("Oumi RL Training: Disaster Response Optimization")
    print("=" * 70)
    print(f"\nTraining for {num_episodes} episodes...")
    print("\nState Space: severity, num_alerts, response_delay, resources, type")
    print("Action Space: rescue_allocation, medical_deployment, logistics_routing")
    print("Reward: +fast response, +high impact, +efficiency, -delays, -waste\n")

    agent = OumiRLAgent(learning_rate=0.01, discount_factor=0.95, epsilon=0.2)
    simulator = DisasterSimulator()

    episode_rewards = []

    for episode in range(num_episodes):
        reward = simulator.run_episode(agent)
        episode_rewards.append(reward)

        if (episode + 1) % 100 == 0:
            avg_reward = np.mean(episode_rewards[-100:])
            print(f"Episode {episode + 1}/{num_episodes} | Avg Reward (last 100): {avg_reward:.2f}")

    # Save learned policy
    agent.save_policy('oumi-rl/learned_policy.json')

    print("\n" + "=" * 70)
    print("Training Complete!")
    print("=" * 70)
    print(f"Total Episodes: {num_episodes}")
    print(f"Final Average Reward: {np.mean(episode_rewards[-100:]):.2f}")
    print(f"Policy saved to: oumi-rl/learned_policy.json")

    return agent


def demonstrate_policy(agent: OumiRLAgent, num_demos: int = 5):
    """Demonstrate learned policy on sample scenarios"""
    print("\n" + "=" * 70)
    print("Policy Demonstration")
    print("=" * 70)

    simulator = DisasterSimulator()

    for i in range(num_demos):
        print(f"\n--- Scenario {i + 1} ---")
        state = simulator.generate_state()
        print(f"State: {state}")

        action, action_type = agent.select_action(state, explore=False)
        print(f"Action ({action_type}): {action}")

        outcome = simulator.simulate_outcome(state, action)
        reward = simulator.reward_fn.calculate(state, action, outcome)

        print(f"Outcome: {outcome}")
        print(f"Reward: {reward:.2f}")


if __name__ == "__main__":
    # Train the agent
    agent = train_agent(num_episodes=1000)

    # Demonstrate learned policy
    demonstrate_policy(agent, num_demos=5)

    print("\n" + "=" * 70)
    print("Oumi RL training complete! Policy ready for deployment.")
    print("=" * 70)
