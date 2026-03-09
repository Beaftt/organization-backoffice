import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ src, name, size = 24, className = '' }: AvatarProps) {
  const style = { width: size, height: size, minWidth: size, minHeight: size };

  if (src) {
    return (
      <span
        className={`inline-flex shrink-0 overflow-hidden rounded-full ${className}`}
        style={style}
      >
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className='h-full w-full object-cover'
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--sidebar)] font-semibold text-white ${className}`}
      style={{ ...style, fontSize: Math.max(8, Math.round(size * 0.42)) }}
      aria-label={name}
      role='img'
    >
      {getInitials(name)}
    </span>
  );
}
