import { Skeleton } from '@/components/ui/skeleton';

export default function PostDetailLoading() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
      <Skeleton className="h-12" />
    </article>
  );
}
