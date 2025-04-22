import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { insertPrayerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Prayer } from "@shared/schema";

// Extend the insertPrayerSchema with additional validation
const formSchema = insertPrayerSchema.extend({
  content: z.string().min(10, {
    message: "Prayer must be at least 10 characters long",
  }),
  author: z.string().optional(),
  category: z.string().optional(),
});

export default function Home() {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      author: "Anonymous",
      category: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!values.author) {
        values.author = "Anonymous";
      }
      
      const response = await apiRequest("POST", "/api/prayers", values);
      return response.json();
    },
    onSuccess: () => {
      form.reset({ content: "", author: "Anonymous", category: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/prayers'] });
      toast({
        title: "Prayer Shared!",
        description: "Thank you for sharing your du'aa with the community.",
      });
    },
    onError: (error) => {
      console.error('Error submitting prayer:', error);
      toast({
        variant: "destructive",
        title: "Failed to share prayer",
        description: "There was a problem sharing your prayer. Please try again.",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  // Query for prayers
  const { data, isLoading } = useQuery<{ 
    prayers: Prayer[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    } 
  }>({
    queryKey: ['/api/prayers'],
    queryFn: () => fetch('/api/prayers').then(res => res.json()),
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Du'aa</h1>
            <p className="text-gray-600">Share your prayers with the community and support others with "Ameen"</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Share Your Prayer</h2>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Textarea 
                placeholder="Type your du'aa here..."
                className="w-full mb-4 resize-none border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                rows={5}
                {...form.register("content")}
              />
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm mb-4">{form.formState.errors.content.message}</p>
              )}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="bg-gray-900 hover:bg-gray-800 text-white flex items-center"
                >
                  {mutation.isPending ? "Sharing..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      <span>Share Prayer</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Prayers</h2>
          
          {isLoading ? (
            <div className="text-center py-8">Loading prayers...</div>
          ) : data?.prayers && data.prayers.length > 0 ? (
            <div className="space-y-4">
              {data.prayers.map((prayer) => (
                <div key={prayer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <p className="text-gray-900 mb-3">{prayer.content}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{prayer.author}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        fetch(`/api/prayers/${prayer.id}/ameen`, { method: 'POST' })
                          .then(() => queryClient.invalidateQueries({ queryKey: ['/api/prayers'] }));
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Ameen ({prayer.ameen_count})
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No prayers have been shared yet. Be the first!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
