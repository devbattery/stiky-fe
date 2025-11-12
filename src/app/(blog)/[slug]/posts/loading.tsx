import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPostsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/2" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </div>
    </div>
  );
}
