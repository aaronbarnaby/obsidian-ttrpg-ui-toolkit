import { App } from "obsidian";
import { DHEquipmentWithPath, equipmentService } from "@/lib/services/equipment/EquipmentService";

export type { DHEquipmentWithPath };

export function resolveEquipmentList(
  app: App,
  sourcePath: string,
  blockItems: unknown[],
  equipped: unknown
): Promise<DHEquipmentWithPath[]> {
  return equipmentService.resolveEquipmentList(app, sourcePath, blockItems, equipped);
}

