export interface TTRPGUIToolkitSettings {
  statePath: string;
  selectedTheme: string;

  // Dice Roll Settings
  diceResultDuration: number;
}

export const DEFAULT_SETTINGS: TTRPGUIToolkitSettings = {
  statePath: ".ttrpg-ui-toolkit-state.json",
  selectedTheme: "default",

  diceResultDuration: 3000,
};
