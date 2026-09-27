import { useEffect, useState } from 'react';

const STORAGE_KEY = 'shortly:recent-links';
const MAX_LINKS = 10;

function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Links created in this browser, newest first, kept in localStorage
export function useRecentLinks() {
  const [links, setLinks] = useState(loadLinks);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {
      // Storage full or blocked: the list just won't survive a reload
    }
  }, [links]);

  const addLink = (link) =>
    setLinks((prev) => [link, ...prev.filter((l) => l.id !== link.id)].slice(0, MAX_LINKS));

  const clearLinks = () => setLinks([]);

  return { links, addLink, clearLinks };
}
