import { useCopy } from '../hooks/useCopy';
import { CheckIcon, CopyIcon } from './Icons';

export default function CopyButton({ text, className = 'btn btn-secondary' }) {
  const { copied, copy } = useCopy();

  return (
    <button type="button" className={className} onClick={() => copy(text)}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
