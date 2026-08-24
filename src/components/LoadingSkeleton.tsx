interface SkeletonProps {
  variant: 'hero' | 'card' | 'row' | 'details' | 'text';
  count?: number;
}

function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[170px] sm:w-[190px] md:w-[210px]">
      <div className="skeleton rounded-lg" style={{ aspectRatio: '2/3' }} />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="px-4 sm:px-8 lg:px-12">
      <div className="skeleton h-6 w-40 rounded mb-3" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="relative w-full h-[75vh] min-h-[520px] skeleton">
      <div className="absolute bottom-16 left-8 lg:left-12 flex flex-col gap-4">
        <div className="skeleton h-4 w-24 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="skeleton h-12 w-80 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="skeleton h-4 w-96 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="flex gap-3 mt-2">
          <div className="skeleton h-11 w-28 rounded-lg" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="skeleton h-11 w-28 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8">
      <div className="skeleton h-[400px] w-full rounded-2xl mb-8" />
      <div className="flex gap-8">
        <div className="skeleton w-48 h-72 rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="skeleton h-10 w-64 rounded" />
          <div className="skeleton h-4 w-48 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="flex gap-3 mt-2">
            <div className="skeleton h-12 w-32 rounded-lg" />
            <div className="skeleton h-12 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ variant, count = 1 }: SkeletonProps) {
  if (variant === 'hero') return <HeroSkeleton />;
  if (variant === 'card') return (
    <div className="flex gap-3">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
  if (variant === 'row') return (
    <div className="flex flex-col gap-10">
      {Array.from({ length: count }).map((_, i) => <RowSkeleton key={i} />)}
    </div>
  );
  if (variant === 'details') return <DetailsSkeleton />;
  if (variant === 'text') return <div className="skeleton h-4 w-full rounded" />;
  return null;
}
