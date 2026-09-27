import { useState } from 'react';
import ShortenForm from './components/ShortenForm';
import ResultCard from './components/ResultCard';
import RecentLinks from './components/RecentLinks';
import { LinkIcon } from './components/Icons';
import { useRecentLinks } from './hooks/useRecentLinks';

export default function App() {
  const [latestLink, setLatestLink] = useState(null);
  const { links, addLink, clearLinks } = useRecentLinks();

  const handleCreated = (link) => {
    setLatestLink(link);
    addLink(link);
  };

  return (
    <div className="page">
      <header className="navbar">
        <span className="logo">
          <span className="logo-mark">
            <LinkIcon />
          </span>
          Shortly
        </span>
      </header>

      <main className="container">
        <section className="hero">
          <h1>
            Make long links <span className="accent">short</span>.
          </h1>
          <p>Paste a URL, pick a custom alias if you like, and share it anywhere.</p>
        </section>

        <ShortenForm onCreated={handleCreated} />
        {latestLink && <ResultCard key={latestLink.id} link={latestLink} />}
        <RecentLinks links={links} onClear={clearLinks} />
      </main>

    </div>
  );
}
