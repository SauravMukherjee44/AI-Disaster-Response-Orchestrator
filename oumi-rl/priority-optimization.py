"""
Oumi Reinforcement Learning Model for Disaster Response Priority Optimization

This module demonstrates how to use Oumi RL to train a model that optimizes
priority scores for disaster response actions based on historical outcomes.
"""

import numpy as np
from typing import Dict, List, Tuple


class DisasterStateRepresentation:
    """Represents the state of a disaster for RL decision making"""

    def __init__(
        self,
        severity: str,
        disaster_type: str,
        affected_population: int,
        available_resources: int,
        time_elapsed: float
    ):
        self.severity_map = {"low": 0, "medium": 1, "high": 2, "critical": 3}
        self.type_map = {
            "earthquake": 0, "flood": 1, "fire": 2,
            "hurricane": 3, "tornado": 4, "tsunami": 5
        }

        self.severity = self.severity_map.get(severity, 1)
        self.disaster_type = self.type_map.get(disaster_type, 0)
        self.affected_population = min(affected_population / 100000, 1.0)
        self.available_resources = min(available_resources / 10, 1.0)
        self.time_elapsed = min(time_elapsed / 24, 1.0)

    def to_vector(self) -> np.ndarray:
        """Convert state to feature vector for RL model"""
        return np.array([
            self.severity / 3.0,
            self.disaster_type / 5.0,
            self.affected_population,
            self.available_resources,
            self.time_elapsed
        ])


class OumiRLPriorityOptimizer:
    """
    Oumi RL-based priority optimizer for disaster response actions.

    This is a simplified demonstration. In production, you would:
    1. Train on historical disaster response data
    2. Use Oumi's PPO or DQN implementations
    3. Continuously update with real-world feedback
    """

    def __init__(self):
        self.action_types = ["rescue", "medical", "logistics", "communication"]
        self.weights = self._initialize_weights()

    def _initialize_weights(self) -> Dict[str, np.ndarray]:
        """Initialize action-specific weight vectors"""
        return {
            "rescue": np.array([0.9, 0.7, 0.8, 0.6, 0.9]),
            "medical": np.array([0.85, 0.6, 0.75, 0.7, 0.8]),
            "logistics": np.array([0.7, 0.5, 0.9, 0.8, 0.5]),
            "communication": np.array([0.6, 0.4, 0.7, 0.5, 0.6])
        }

    def calculate_priority(
        self,
        state: DisasterStateRepresentation,
        action_type: str
    ) -> float:
        """
        Calculate priority score using learned weights.

        In a full Oumi RL implementation, this would be the policy network output.
        """
        if action_type not in self.weights:
            action_type = "rescue"

        state_vector = state.to_vector()
        weights = self.weights[action_type]

        priority = float(np.dot(state_vector, weights))
        priority = min(max(priority * 100, 0), 100)

        return priority

    def optimize_actions(
        self,
        disaster_data: Dict,
        available_resources: int = 7
    ) -> List[Dict]:
        """
        Generate optimized priority actions for a disaster.

        Args:
            disaster_data: Dictionary containing disaster information
            available_resources: Number of available resource units

        Returns:
            List of action dictionaries with optimized priority scores
        """
        state = DisasterStateRepresentation(
            severity=disaster_data.get("severity", "medium"),
            disaster_type=disaster_data.get("disaster_type", "earthquake"),
            affected_population=disaster_data.get("affected_population", 1000),
            available_resources=available_resources,
            time_elapsed=0.0
        )

        actions = []

        for action_type in self.action_types:
            priority_score = self.calculate_priority(state, action_type)

            actions.append({
                "action_type": action_type,
                "priority_score": priority_score,
                "state_features": state.to_vector().tolist()
            })

        actions.sort(key=lambda x: x["priority_score"], reverse=True)
        return actions

    def update_from_feedback(
        self,
        state: DisasterStateRepresentation,
        action_type: str,
        reward: float
    ):
        """
        Update model weights based on outcome feedback.

        In full Oumi implementation, this would be part of the training loop
        using PPO, DQN, or other RL algorithms.
        """
        learning_rate = 0.01
        state_vector = state.to_vector()

        if action_type in self.weights:
            gradient = reward * state_vector
            self.weights[action_type] += learning_rate * gradient
            self.weights[action_type] = np.clip(self.weights[action_type], 0, 1)


def calculate_reward(
    action_taken: Dict,
    outcome: Dict
) -> float:
    """
    Calculate reward based on action outcome for RL training.

    Positive rewards for:
    - High number of people helped
    - Fast response time
    - Efficient resource usage

    Negative rewards for:
    - Delays
    - Resource waste
    - Low impact
    """
    base_reward = 0.0

    people_helped = outcome.get("people_helped", 0)
    estimated_impact = action_taken.get("estimated_impact", 1)

    effectiveness = min(people_helped / max(estimated_impact, 1), 2.0)
    base_reward += effectiveness * 50

    completion_time = outcome.get("completion_time_hours", 24)
    deadline_hours = outcome.get("deadline_hours", 24)

    if completion_time <= deadline_hours:
        time_bonus = (1 - completion_time / deadline_hours) * 20
        base_reward += time_bonus
    else:
        time_penalty = (completion_time - deadline_hours) / deadline_hours * 30
        base_reward -= time_penalty

    resources_used = outcome.get("resources_used", 1)
    resources_allocated = action_taken.get("resources_allocated", 1)
    efficiency = 1 - abs(resources_used - resources_allocated) / max(resources_allocated, 1)
    base_reward += efficiency * 10

    return max(min(base_reward, 100), -50)


if __name__ == "__main__":
    optimizer = OumiRLPriorityOptimizer()

    example_disaster = {
        "severity": "critical",
        "disaster_type": "earthquake",
        "affected_population": 25000
    }

    print("Oumi RL Priority Optimization Demo")
    print("=" * 50)
    print(f"\nDisaster: {example_disaster}")
    print("\nOptimized Actions:")

    actions = optimizer.optimize_actions(example_disaster)

    for i, action in enumerate(actions, 1):
        print(f"{i}. {action['action_type'].upper()}: Priority Score = {action['priority_score']:.2f}")
