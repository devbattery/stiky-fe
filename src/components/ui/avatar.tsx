import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Avatar({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  const initials = fallback ?? alt.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  if (!src) {
    return (
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground',
          className,
        )}
      >
        {initials || '?'}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className={cn('h-10 w-10 rounded-full object-cover', className)}
    />
  );
}
