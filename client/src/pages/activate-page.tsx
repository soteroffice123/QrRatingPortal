import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, KeyRound, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const activationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  activationCode: z.string().min(1, "Activation code is required"),
});

type ActivationFormValues = z.infer<typeof activationSchema>;

export default function ActivatePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<ActivationFormValues>({
    resolver: zodResolver(activationSchema),
    defaultValues: {
      email: "",
      activationCode: "",
    },
  });

  const onSubmit = async (values: ActivationFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await apiRequest("POST", "/api/activate", values);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to activate account");
      }
      
      setIsSuccess(true);
      toast({
        title: "Account activated",
        description: "Your account has been activated successfully. You can now log in.",
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        setLocation("/auth");
      }, 3000);
    } catch (error) {
      toast({
        title: "Activation failed",
        description: error instanceof Error ? error.message : "Failed to activate account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Account Activation
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and activation code to activate your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Activation Successful</h3>
              <p className="text-center text-muted-foreground">
                Your account has been activated successfully. You will be redirected to the login page shortly.
              </p>
              <Button 
                className="mt-2" 
                onClick={() => setLocation("/auth")}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                          <span className="pl-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <Input 
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                            placeholder="email@example.com" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the email associated with your account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activation Code</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                          <span className="pl-3">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <Input 
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                            placeholder="Enter activation code" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the activation code you received from your administrator
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Activate Account
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Button
            variant="link"
            onClick={() => setLocation("/auth")}
          >
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}