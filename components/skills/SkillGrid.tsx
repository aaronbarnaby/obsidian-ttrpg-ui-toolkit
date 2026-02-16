import { SkillCard } from "@/components/skills/SkillCard";

export type SkillGridProps = {
  items: SkillItem[];
};

export type SkillItem = {
  isProficient?: boolean;
  isExpert?: boolean;
  isHalfProficient?: boolean;
  ability: string;
  label: string;
  modifier: number;
};

export function SkillGrid(props: SkillGridProps) {
  return (
    <div className="skills-grid">
      {props.items.map((item, index) => (
        <SkillCard item={item} key={index} />
      ))}
    </div>
  );
}
