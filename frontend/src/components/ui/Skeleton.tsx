"use client";

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div
    className={`animate-pulse rounded-lg bg-(--secondary) ${className}`}
    style={{ animationDuration: "1.5s" }}
  />
);

export const SkeletonText = ({
  className = "",
  lines = 1,
}: SkeletonProps & { lines?: number }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 animate-pulse rounded bg-(--secondary) ${
          i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
        }`}
        style={{ animationDuration: "1.5s" }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = "" }: SkeletonProps) => (
  <div
    className={`rounded-xl border border-(--border) bg-(--card) p-5 ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <Skeleton className="h-5 w-32" />
    </div>
    <SkeletonText lines={2} />
  </div>
);
