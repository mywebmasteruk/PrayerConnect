import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Prayer, prayerCategories } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";

interface PrayerCardProps {
  prayer: Prayer;
}

export default function PrayerCard({ prayer }: PrayerCardProps) {
  // Find category label
  const categoryLabel = prayerCategories.find(
    c => c.value === prayer.category
  )?.label || prayer.category;
  
  // Format date
  const timeAgo = prayer.created_at 
    ? formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true })
    : "recently";
  
  const ameenMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/prayers/${prayer.id}/ameen`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prayers'] });
    },
  });

  const handleAmeen = () => {
    ameenMutation.mutate();
  };

  return (
    <Card className="prayer-card hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-medium">{prayer.author}</p>
            <p className="text-sm text-muted-foreground">{timeAgo}</p>
          </div>
          {prayer.category && (
            <Badge variant="outline" className="bg-[#f9fafb] text-dark/70 text-xs">
              {categoryLabel}
            </Badge>
          )}
        </div>
        
        <p className="text-dark mb-6">{prayer.content}</p>
        
        <div className="flex justify-between items-center pt-2 border-t border-neutral-dark">
          <Button
            onClick={handleAmeen}
            variant="ghost"
            size="sm"
            className="ameen-btn flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
            disabled={ameenMutation.isPending}
          >
            <Heart className="h-4 w-4" />
            <span>Ameen</span>
            <span className="text-sm font-medium">{prayer.ameen_count || 0}</span>
          </Button>
          
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{prayer.view_count || 0}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
