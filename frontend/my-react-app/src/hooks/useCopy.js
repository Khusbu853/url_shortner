import { useEffect, useRef, useState } from 'react';

// Copies text to the clipboard; `copied` is true for 2 seconds afterwards
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context): leave the button as is
    }
  };

  return { copied, copy };
}
