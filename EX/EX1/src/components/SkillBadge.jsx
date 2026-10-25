/**
 * SkillBadge component rendering an individual skill as a semantic list item.
 * @param {Object} props
 * @param {string} props.name - The name of the skill or technical competency.
 * @param {string} [props.tier='Core'] - The mastery tier (e.g., 'Core', 'Advanced', 'Specialist').
 * @returns {JSX.Element} A semantic list item element representing the badge.
 */
export function SkillBadge({ name, tier = 'Core' }) {
  return <li>{name} ({tier})</li>;
}

export default SkillBadge;
