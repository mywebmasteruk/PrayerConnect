import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { insertPrayerSchema, prayerCategories } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2 } from "lucide-react";

// Extend the insertPrayerSchema with additional validation
const formSchema = insertPrayerSchema.extend({
  content: z.string().min(10, {
    message: "Prayer must be at least 10 characters long",
  }),
  author: z.string().optional(),
  category: z.string().optional(),
});

export default function PrayerForm() {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      author: "",
      category: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // If author is empty, set it to Anonymous
      if (!values.author) {
        values.author = "Anonymous";
      }
      
      const response = await apiRequest("POST", "/api/prayers", values);
      return response.json();
    },
    onSuccess: () => {
      form.reset();
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/prayers'] });
      toast({
        title: "Prayer Shared!",
        description: "Thank you for sharing your du'aa with the community.",
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
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

  return (
    <section id="new-prayer" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Share Your Du'aa</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Anonymous" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Prayer <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your du'aa..." 
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please be respectful and follow Islamic guidelines for du'aa.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prayerCategories.map((category) => (
                          <SelectItem 
                            key={category.value} 
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Share Prayer"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          
          {success && (
            <Alert className="mt-6 border-green-500 bg-green-50 text-green-700">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Your prayer has been shared!</AlertTitle>
              <AlertDescription>
                Thank you for sharing your du'aa with the community.
              </AlertDescription>
            </Alert>
          )}
          
          {mutation.isError && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>There was a problem sharing your prayer</AlertTitle>
              <AlertDescription>
                Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </section>
  );
}
