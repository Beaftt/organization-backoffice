import type { DocumentType } from '../types';

type Props = {
  type: DocumentType;
  className?: string;
};

export function FileTypeIcon({ type, className = 'h-5 w-5' }: Props) {
  if (type === 'IMAGE') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          ry="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline
          points="21 15 16 10 5 21"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'SPREADSHEET') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="14 2 14 8 20 8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round" />
        <line x1="8" y1="17" x2="16" y2="17" strokeLinecap="round" />
        <line x1="10" y1="9" x2="10" y2="17" strokeLinecap="round" />
      </svg>
    );
  }

  // PDF and OTHER share a document icon
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14 2 14 8 20 8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
      <line x1="9" y1="18" x2="12" y2="18" strokeLinecap="round" />
    </svg>
  );
}
