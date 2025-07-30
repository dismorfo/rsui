import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const LoadingSkeleton = () => {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-10 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-6 mb-2 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </Card>
          ))}
        </div>
      </div>
    );
};

export default LoadingSkeleton;
