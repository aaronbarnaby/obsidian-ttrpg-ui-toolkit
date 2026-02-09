import { THEMES } from "lib/themes";

export interface TTRPGUIToolkitSettings {
  statePath: string;
  selectedTheme: string;

  // Dice Roll Settings
  diceResultDuration: number;

  // Color variables
  colorBgPrimary: string;
  colorBgSecondary: string;
  colorBgTertiary: string;
  colorBgHover: string;
  colorBgDarker: string;
  colorBgGroup: string;
  colorBgProficient: string;

  colorTextPrimary: string;
  colorTextSecondary: string;
  colorTextSublabel: string;
  colorTextBright: string;
  colorTextMuted: string;
  colorTextGroup: string;

  colorBorderPrimary: string;
  colorBorderActive: string;
  colorBorderFocus: string;

  colorAccentTeal: string;
  colorAccentRed: string;
  colorAccentPurple: string;
}

export const DEFAULT_SETTINGS: TTRPGUIToolkitSettings = {
  statePath: ".ttrpg-ui-toolkit-state.json",
  selectedTheme: "default",

  diceResultDuration: 3000,

  ...THEMES.default.colors,
};
