import { formatModifier } from "@/lib/services/ability/AbilityService";
import { SkillItem } from "@/components/skills/SkillGrid";

export type SkillCardProps = {
  item: SkillItem;
};

export function SkillCard({ item }: SkillCardProps) {
  const classes = ["skill-card"];
  if (item.isExpert) {
    classes.push("expert");
  } else if (item.isProficient) {
    classes.push("proficient");
  } else if (item.isHalfProficient) {
    classes.push("half-proficient");
  }

  return (
    <div className={classes.join(" ")}>
      <div className="skills-values-container">
        <p className="skill-ability">
          <em>{item.ability}</em>
        </p>
        <p className="skill-name">{item.label}</p>
      </div>
      <div className="skills-values-container">
        <p className="skill-value">{formatModifier(item.modifier)}</p>
      </div>
    </div>
  );
}

