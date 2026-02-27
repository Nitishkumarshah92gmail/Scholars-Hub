export default function PostSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full skeleton" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 skeleton rounded" />
          <div className="h-2.5 w-36 skeleton rounded" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="h-[300px] w-full skeleton" />

      {/* Actions Skeleton */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex gap-4">
          <div className="h-7 w-7 skeleton rounded-full" />
          <div className="h-7 w-7 skeleton rounded-full" />
          <div className="h-7 w-7 skeleton rounded-full" />
        </div>
        <div className="h-3.5 w-16 skeleton rounded" />
        <div className="h-3.5 w-48 skeleton rounded" />
        <div className="h-3 w-20 skeleton rounded" />
      </div>
    </div>
  );
}
