import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  googleReviewUrl: z.string().url({ message: "Please enter a valid URL" }),
  prefillRating: z.boolean(),
  feedbackFormUrl: z.string().url({ message: "Please enter a valid URL" }),
  passRating: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Links() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: links, isLoading } = useQuery({
    queryKey: ["/api/links"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        if (res.status === 404) {
          return {
            googleReviewUrl: "",
            prefillRating: true,
            feedbackFormUrl: "",
            passRating: true,
          };
        }
        return await res.json();
      } catch (error) {
        return {
          googleReviewUrl: "",
          prefillRating: true,
          feedbackFormUrl: "",
          passRating: true,
        };
      }
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      googleReviewUrl: links?.googleReviewUrl || "",
      prefillRating: links?.prefillRating ?? true,
      feedbackFormUrl: links?.feedbackFormUrl || "",
      passRating: links?.passRating ?? true,
    },
  });

  // Update form values when links data is loaded
  React.useEffect(() => {
    if (links) {
      form.reset({
        googleReviewUrl: links.googleReviewUrl || "",
        prefillRating: links.prefillRating ?? true,
        feedbackFormUrl: links.feedbackFormUrl || "",
        passRating: links.passRating ?? true,
      });
    }
  }, [links, form]);

  const updateLinksMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/links", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Links updated",
        description: "Your destination links have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateLinksMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Destination Links</h2>
      
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Positive Review Destination (5 Stars)</h3>
                
                <FormField
                  control={form.control}
                  name="googleReviewUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Review URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://g.page/r/..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This is where customers who give 5 stars will be directed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="prefillRating"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Automatically Pre-fill Rating</FormLabel>
                          <FormDescription>
                            Automatically set maximum rating in Google review form
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Feedback Form Destination (1-4 Stars)</h3>
                
                <FormField
                  control={form.control}
                  name="feedbackFormUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Form URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://forms.gle/..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This is where customers who give 1-4 stars will be directed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="passRating"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Pass Rating Information</FormLabel>
                          <FormDescription>
                            Include star rating in form URL as parameter
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="mt-6"
                disabled={updateLinksMutation.isPending}
              >
                {updateLinksMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Links
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
