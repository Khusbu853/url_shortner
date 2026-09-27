import CopyButton from './CopyButton';
import './RecentLinks.css';

const isExpired = (link) => link.expirationDate && new Date(link.expirationDate) < new Date();

export default function RecentLinks({ links, onClear }) {
  if (links.length === 0) return null;

  return (
    <section className="recent">
      <div className="recent-header">
        <h2>Recent links</h2>
        <button type="button" className="btn-link" onClick={onClear}>
          Clear
        </button>
      </div>

      <ul className="recent-list">
        {links.map((link) => (
          <li key={link.id} className="recent-item">
            <div className="recent-text">
              <a href={link.shortUrl} target="_blank" rel="noreferrer">
                {link.shortUrl.replace(/^https?:\/\//, '')}
              </a>
              {link.isCustom && <span className="tag">custom</span>}
              {isExpired(link) && <span className="tag tag-muted">expired</span>}
              <p className="truncate" title={link.originalUrl}>
                {link.originalUrl}
              </p>
            </div>
            <CopyButton text={link.shortUrl} className="btn btn-secondary btn-sm" />
          </li>
        ))}
      </ul>
      <p className="recent-note">Saved in this browser only.</p>
    </section>
  );
}
