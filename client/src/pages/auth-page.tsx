import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to admin if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        setLocation("/admin");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">Feedback QR</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access your admin portal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pt-2 pb-6">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
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
                          type="email"
                          placeholder="Enter your email address" 
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                        <span className="pl-3">
                          <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-center text-sm px-6 pb-8">
          <p className="text-muted-foreground">
            Need to activate your account?{' '}
            <Link href="/activate" className="text-primary hover:underline">
              Activate here
            </Link>
          </p>
          <p className="text-muted-foreground text-xs">
            Only admin users can create new accounts through the admin panel
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
