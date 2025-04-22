import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrayerSkeleton() {
  return (
    <Card className="prayer-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-4 w-16 mt-2 rounded" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-neutral-dark">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-4 w-10 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
