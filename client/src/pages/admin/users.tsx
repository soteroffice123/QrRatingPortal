import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, RefreshCw, User, Mail, KeyRound, AlertCircle } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User as UserType } from "@shared/schema";

// Form schema for adding new users
const newUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isAdmin: z.boolean().default(false),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showActivationCodeDialog, setShowActivationCodeDialog] = useState(false);
  const [activationInfo, setActivationInfo] = useState<{ 
    userId: number; 
    username: string; 
    email: string; 
    activationCode: string 
  } | null>(null);

  // Query for fetching users
  const { data: users, isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      return res.json();
    }
  });

  // Mutation for creating a new user
  const addUserMutation = useMutation({
    mutationFn: async (userData: NewUserFormValues) => {
      const res = await apiRequest("POST", "/api/users", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowAddUserDialog(false);
      toast({
        title: "User added successfully",
        description: "The new user has been added to the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating a user's active status
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User updated",
        description: "The user's status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for resetting an activation code
  const resetActivationMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/users/${userId}/reset-code`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setActivationInfo(data);
      setShowActivationCodeDialog(true);
      toast({
        title: "Activation code reset",
        description: "A new activation code has been generated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reset activation code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for adding new users
  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      isAdmin: false,
    },
  });

  const onSubmit = (values: NewUserFormValues) => {
    addUserMutation.mutate(values);
  };

  // Handle user activation/deactivation
  const handleActiveChange = (userId: number, isActive: boolean) => {
    updateUserMutation.mutate({ id: userId, isActive });
  };

  // Handle resetting activation code
  const handleResetActivation = (userId: number) => {
    resetActivationMutation.mutate(userId);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setShowAddUserDialog(true)}>Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage your users and their access to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {user.username}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <span className="font-medium text-primary">Admin</span>
                        ) : (
                          <span>User</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={(checked) => handleActiveChange(user.id, checked)}
                          />
                          <span>{user.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetActivation(user.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset Activation
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                        <p>No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Enter the details for the new user account.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Admin Privileges</FormLabel>
                      <FormDescription>
                        Allow this user to manage the system
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
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddUserDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addUserMutation.isPending}
                >
                  {addUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Activation Code Dialog */}
      <Dialog open={showActivationCodeDialog} onOpenChange={setShowActivationCodeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Activation Code</DialogTitle>
            <DialogDescription>
              Share this activation code with the user to activate their account.
            </DialogDescription>
          </DialogHeader>
          {activationInfo && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{activationInfo.username}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{activationInfo.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Activation Code</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm font-mono">{activationInfo.activationCode}</code>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                The user account has been set to inactive. Share this code with the user so they can activate their account.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowActivationCodeDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}