export function getConditions() {
  return [
    {
      name: "Hidden",
      description: "While you’re out of sight from all enemies and they don’t otherwise know your location, you gain the Hidden condition. Any rolls against a Hidden creature have disadvantage. After an adversary moves to where they would see you, you move into their line of sight, or you make an attack, you are no longer Hidden.",
    },
    {
      name: "Restrained",
      description: "Restrained characters can’t move, but you can still take actions from their current position.",
    },
    {
      name: "Vulnerable",
      description: "When a creature is Vulnerable, all rolls targeting them have advantage.",
    },
  ];
}

