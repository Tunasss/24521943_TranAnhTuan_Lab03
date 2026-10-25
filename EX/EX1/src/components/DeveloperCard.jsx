export function DeveloperCard({
  name = "Alex Morgan",
  title = "Staff Frontend Engineer & Pro Gamer",
  bio = "Building high-performance, accessible web applications by day; competitive tactical FPS enthusiast by night.",
}) {
  return (
    <article aria-labelledby="developer-name">
      <header>
        <hgroup>
          <h2 id="developer-name">{name}</h2>
          <p>{title}</p>
        </hgroup>
      </header>
      <p>{bio}</p>
    </article>
  );
}

export default DeveloperCard;
