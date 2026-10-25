export function SkillBadge({
  name = "React",
  level = "Intermediate",
  category = "engineering",
}) {
  return (
    <span title={`${name} - ${level} (${category})`}>
      {name}
    </span>
  );
}

export default SkillBadge;
