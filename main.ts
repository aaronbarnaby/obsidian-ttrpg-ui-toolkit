import { App, Menu, Plugin, PluginSettingTab, Setting } from "obsidian";
import { AbilityScoreView } from "@/features/abilities/views/AbilityScoreView";
import { KeyValueStore } from "lib/services/kv/kv";
import { JsonDataStore } from "./lib/services/kv/local-file-store";
import { DEFAULT_SETTINGS, TTRPGUIToolkitSettings } from "settings";
import { msgbus } from "lib/services/event-bus";
import * as Fm from "lib/domains/frontmatter";
import { openDiceRoller } from "@/features/dice/diceRoller";
import { diceInlinePostProcessor } from "@/features/dice/dicePostProcessor";
import { BaseView } from "@/features/shared/BaseView";
import { BadgesView, StatsView } from "@/features/badges/views/BadgesView";
import { SkillsView } from "@/features/skills/views/SkillsView";
import { VitalsView } from "@/features/vitals/views/VitalsView";
import { InitiativeView } from "@/features/initiative/views/InitiativeView";
import { FeaturesView } from "@/features/features/views/FeaturesView";
import { EquipmentView } from "@/features/equipment/views/EquipmentView";

export default class TTRPGUIToolkitPlugin extends Plugin {
  settings: TTRPGUIToolkitSettings;
  dataStore: JsonDataStore;

  async onload() {
    await this.loadSettings();

    this.initRibbonIcon();
    this.initCommands();

    // Initialize the JsonDataStore with the configured path
    this.initDataStore();

    // Setup Listener for frontmatter changes
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        const filefm = this.app.metadataCache.getCache(file.path)?.frontmatter;
        const fm = Fm.anyIntoFrontMatter(filefm || {});

        msgbus.publish(file.path, "fm:changed", fm);
      })
    );

    const kv = new KeyValueStore(this.dataStore);
    const { app } = this;

    // In your plugin's onload method
    const views: BaseView[] = [
      // Static
      new StatsView(app),
      new BadgesView(app),
      new AbilityScoreView(app),
      new SkillsView(app),
      new FeaturesView(app),
      new EquipmentView(app, this),

      // Dynamic/Stateful
      new VitalsView(app, kv),
      new InitiativeView(app, kv),
    ];

    for (const view of views) {
      // Use an arrow function to preserve the 'this' context
      this.registerMarkdownCodeBlockProcessor(view.codeblock, (source, el, ctx) => {
        view.register(source, el, ctx);
      });
    }

    // Register inline dice postprocessors
    this.registerMarkdownPostProcessor((el, ctx) => diceInlinePostProcessor(el, ctx, this.settings.diceResultDuration));

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new TTRPGSettingsTab(this.app, this));
  }

  /**
   * Initialize or reinitialize the data store with the current path setting
   */
  initDataStore() {
    // Initialize with the vault adapter and the configured path
    this.dataStore = new JsonDataStore(this.app.vault, this.settings.statePath);
  }

  initRibbonIcon() {
    this.addRibbonIcon("pocket-knife", "TTRPG UI Toolkit", (evt: MouseEvent) => {
      const menu = new Menu();

      menu.addItem((item) =>
        item
          .setTitle("Dice Roller")
          .setIcon("dice")
          .onClick(() => openDiceRoller(this))
      );

      menu.showAtMouseEvent(evt);
    });
  }

  initCommands() {
    this.addCommand({
      id: "open-floating-window",
      name: "Open Dice Roller",
      callback: () => openDiceRoller(this),
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // Reinitialize data store with the new path
    this.initDataStore();
  }
}

class TTRPGSettingsTab extends PluginSettingTab {
  plugin: TTRPGUIToolkitPlugin;

  constructor(app: App, plugin: TTRPGUIToolkitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "TTRPG UI Toolkit Settings" });

    // State File Path Setting
    new Setting(containerEl)
      .setName("State File Path")
      .setDesc(
        "Relative path (from vault root) where the state file will be stored. The statefile contains all the stateful data for components that are interactive and need to be saved. This is a JSON file."
      )
      .addText((text) =>
        text
          .setPlaceholder(".ttrpg-ui-toolkit-state.json")
          .setValue(this.plugin.settings.statePath)
          .onChange(async (value) => {
            this.plugin.settings.statePath = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Dice Roll Settings" });

    new Setting(containerEl)
      .setName("Dice Result Duration")
      .setDesc("The duration of the dice result in milliseconds.")
      .addText((text) =>
        text
          .setPlaceholder("3000")
          .setValue(this.plugin.settings.diceResultDuration.toString())
          .onChange(async (value) => {
            this.plugin.settings.diceResultDuration = parseInt(value);
            await this.plugin.saveSettings();
          })
      );
  }
}
