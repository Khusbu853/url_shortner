import CopyButton from './CopyButton';
import { CheckIcon, ExternalIcon } from './Icons';
import './ResultCard.css';

export default function ResultCard({ link }) {
  return (
    <section className="card result-card" aria-live="polite">
      <p className="result-title">
        <span className="result-badge">
          <CheckIcon width={14} height={14} />
        </span>
        Your short link is ready
      </p>

      <div className="result-link">
        <a href={link.shortUrl} target="_blank" rel="noreferrer">
          {link.shortUrl}
        </a>
        <div className="result-actions">
          <CopyButton text={link.shortUrl} className="btn btn-primary" />
          <a
            className="btn btn-secondary"
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open short link"
          >
            <ExternalIcon />
          </a>
        </div>
      </div>

      <p className="result-meta">
        <span className="truncate" title={link.originalUrl}>
          → {link.originalUrl}
        </span>
        {link.expirationDate && (
          <span>Expires {new Date(link.expirationDate).toLocaleDateString()}</span>
        )}
      </p>
    </section>
  );
}
