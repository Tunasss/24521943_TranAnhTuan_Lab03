import { useState, Fragment } from 'react';
import { SkillBadge } from './SkillBadge';

/**
 * DeveloperCard component displaying engineer and pro-gamer identity.
 * @param {Object} props
 * @param {string} [props.fullName='Alex Morgan'] - Full name of the developer.
 * @param {string} [props.role='Staff Frontend Engineer & Pro Gamer'] - Professional title or role.
 * @param {string} [props.avatarUrl='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'] - Secure HTTPS avatar image URL.
 * @param {Record<string, string>} [props.metrics={ 'Experience': '6 Years', 'Competitive Rank': 'Grandmaster', 'Repositories': '42+' }] - Key-value performance metrics.
 * @param {Array<{id: string, name: string, tier: string}>} [props.skills=[...]] - List of skills and competencies.
 * @returns {JSX.Element}
 */
export function DeveloperCard({
  fullName = 'Alex Morgan',
  role = 'Staff Frontend Engineer & Pro Gamer',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  metrics = {
    'Experience': '6 Years',
    'Competitive Rank': 'Grandmaster',
    'Repositories': '42+',
  },
  skills = [
    { id: 'skill-1', name: 'React 19', tier: 'Core' },
    { id: 'skill-2', name: 'TypeScript', tier: 'Core' },
    { id: 'skill-3', name: 'Web Accessibility', tier: 'Specialist' },
    { id: 'skill-4', name: 'Aim & Reflexes', tier: 'Grandmaster' },
  ],
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : (words[0]?.[0] || 'D').toUpperCase();

  return (
    <article aria-labelledby="dev-heading">
      <header>
        {imageFailed ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          <img
            src={avatarUrl}
            alt={`Portrait avatar of ${fullName}`}
            width="64"
            height="64"
            onError={() => setImageFailed(true)}
          />
        )}
        <hgroup>
          <h2 id="dev-heading">{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>

      <dl>
        {Object.entries(metrics).map(([k, v]) => (
          <Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </Fragment>
        ))}
      </dl>

      <ul aria-label="Engineered Skills">
        {skills.map((s) => (
          <SkillBadge key={s.id} name={s.name} tier={s.tier} />
        ))}
      </ul>
    </article>
  );
}

export default DeveloperCard;
