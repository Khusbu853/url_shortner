import { useState } from 'react';
import { shortenUrl, SHORT_DOMAIN } from '../api/urlApi';
import { AlertIcon, LinkIcon } from './Icons';
import './ShortenForm.css';

const EMPTY_FORM = { originalUrl: '', customAlias: '', expirationDate: '' };

// Earliest allowed expiry: tomorrow, as YYYY-MM-DD
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default function ShortenForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const link = await shortenUrl({
        originalUrl: form.originalUrl.trim(),
        customAlias: form.customAlias.trim(),
        expirationDate: form.expirationDate,
      });
      onCreated(link);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card shorten-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="originalUrl">Long URL</label>
        <div className="input-icon">
          <LinkIcon />
          <input
            id="originalUrl"
            name="originalUrl"
            type="url"
            className="input"
            placeholder="https://example.com/a/very/long/link"
            value={form.originalUrl}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="customAlias">
            Custom alias <span className="optional">optional</span>
          </label>
          <div className="input-prefix">
            <span>{SHORT_DOMAIN}/</span>
            <input
              id="customAlias"
              name="customAlias"
              className="input"
              placeholder="my-portfolio"
              value={form.customAlias}
              onChange={handleChange}
              pattern="[a-zA-Z0-9_\-]{3,30}"
              title='3-30 characters: letters, numbers, "-" or "_"'
              autoComplete="off"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="expirationDate">
            Expires on <span className="optional">optional</span>
          </label>
          <input
            id="expirationDate"
            name="expirationDate"
            type="date"
            className="input"
            min={tomorrow()}
            value={form.expirationDate}
            onChange={handleChange}
          />
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          <AlertIcon /> {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? <span className="spinner" aria-hidden /> : null}
        {loading ? 'Shortening…' : 'Shorten URL'}
      </button>
    </form>
  );
}
