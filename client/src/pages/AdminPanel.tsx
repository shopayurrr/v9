import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminPanel() {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    socialSecurityNumber: "",
    address: "",
    homeAddress: "",
    mailingAddress: "",
    primaryPhone: "",
    secondaryPhone: "",
    alternateEmail: "",
    availableBalance: "0",
    everydayChecking: "0",
    accountType: "Checking",
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery<{users: any[]}>({
    queryKey: ["/api/admin/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      await apiRequest("POST", "/api/admin/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddingUser(false);
      setNewUser({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        socialSecurityNumber: "",
        address: "",
        homeAddress: "",
        mailingAddress: "",
        primaryPhone: "",
        secondaryPhone: "",
        alternateEmail: "",
        availableBalance: "0",
        everydayChecking: "0",
        accountType: "Checking",
      });
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create user", variant: "destructive" });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      await apiRequest("PATCH", `/api/admin/users/${userData.id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setEditingUser(null);
      toast({ title: "Success", description: "User information updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    }
  });

  if (loadingUsers) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Management Panel</h1>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <section className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Profile Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Username</Label>
                    <Input id="new-username" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password</Label>
                    <Input id="new-password" type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-firstName">First Name</Label>
                    <Input id="new-firstName" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-lastName">Last Name</Label>
                    <Input id="new-lastName" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-dob">Date of Birth</Label>
                    <Input id="new-dob" value={newUser.dateOfBirth} onChange={(e) => setNewUser({...newUser, dateOfBirth: e.target.value})} placeholder="MM/DD/YYYY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-ssn">SSN</Label>
                    <Input id="new-ssn" value={newUser.socialSecurityNumber} onChange={(e) => setNewUser({...newUser, socialSecurityNumber: e.target.value})} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Address Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-address">Address</Label>
                    <Input id="new-address" value={newUser.address} onChange={(e) => setNewUser({...newUser, address: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-homeAddress">Home Address</Label>
                    <Input id="new-homeAddress" value={newUser.homeAddress} onChange={(e) => setNewUser({...newUser, homeAddress: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-mailingAddress">Mailing Address</Label>
                    <Input id="new-mailingAddress" value={newUser.mailingAddress} onChange={(e) => setNewUser({...newUser, mailingAddress: e.target.value})} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Phone & Email</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-primaryPhone">Primary Phone</Label>
                    <Input id="new-primaryPhone" value={newUser.primaryPhone} onChange={(e) => setNewUser({...newUser, primaryPhone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-secondaryPhone">Secondary Phone</Label>
                    <Input id="new-secondaryPhone" value={newUser.secondaryPhone} onChange={(e) => setNewUser({...newUser, secondaryPhone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input id="new-email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-alternateEmail">Alternate Email</Label>
                    <Input id="new-alternateEmail" type="email" value={newUser.alternateEmail} onChange={(e) => setNewUser({...newUser, alternateEmail: e.target.value})} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Account Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-availableBalance">Available Balance</Label>
                    <Input id="new-availableBalance" value={newUser.availableBalance} onChange={(e) => setNewUser({...newUser, availableBalance: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-accountType">Account Type</Label>
                    <select 
                      id="new-accountType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newUser.accountType}
                      onChange={(e) => setNewUser({...newUser, accountType: e.target.value})}
                    >
                      <option value="Checking">Checking</option>
                      <option value="Saving">Saving</option>
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="new-everydayChecking">Initial Balance</Label>
                    <Input id="new-everydayChecking" value={newUser.everydayChecking} onChange={(e) => setNewUser({...newUser, everydayChecking: e.target.value})} />
                  </div>
                </div>
              </section>
            </div>
            <Button className="w-full" onClick={() => createUserMutation.mutate(newUser)}>Create User</Button>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Accounts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.isAdmin ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <UserAccountsView userId={user.id} />
                    </TableCell>
                    <TableCell>
                      <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>Edit Profile</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit User: {user.username}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-6 py-4">
                            <section className="space-y-4">
                              <h3 className="font-semibold border-b pb-2">Profile Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="username">Username</Label>
                                  <Input id="username" value={editingUser?.username || ""} disabled />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                                  <Input id="password" type="password" value={editingUser?.password || ""} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="firstName">First Name</Label>
                                  <Input id="firstName" value={editingUser?.firstName || ""} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="lastName">Last Name</Label>
                                  <Input id="lastName" value={editingUser?.lastName || ""} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" type="email" value={editingUser?.email || ""} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="dob">Date of Birth</Label>
                                  <Input id="dob" value={editingUser?.dateOfBirth || ""} onChange={(e) => setEditingUser({...editingUser, dateOfBirth: e.target.value})} placeholder="MM/DD/YYYY" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="ssn">SSN</Label>
                                  <Input id="ssn" value={editingUser?.socialSecurityNumber || ""} onChange={(e) => setEditingUser({...editingUser, socialSecurityNumber: e.target.value})} />
                                </div>
                              </div>
                            </section>

                            <section className="space-y-4">
                              <h3 className="font-semibold border-b pb-2">Address Information</h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="address">Address</Label>
                                  <Input id="address" value={editingUser?.address || ""} onChange={(e) => setEditingUser({...editingUser, address: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="homeAddress">Home Address</Label>
                                  <Input id="homeAddress" value={editingUser?.homeAddress || ""} onChange={(e) => setEditingUser({...editingUser, homeAddress: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="mailingAddress">Mailing Address</Label>
                                  <Input id="mailingAddress" value={editingUser?.mailingAddress || ""} onChange={(e) => setEditingUser({...editingUser, mailingAddress: e.target.value})} />
                                </div>
                              </div>
                            </section>

                            <section className="space-y-4">
                              <h3 className="font-semibold border-b pb-2">Phone & Email</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="primaryPhone">Primary Phone</Label>
                                  <Input id="primaryPhone" value={editingUser?.primaryPhone || ""} onChange={(e) => setEditingUser({...editingUser, primaryPhone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                                  <Input id="secondaryPhone" value={editingUser?.secondaryPhone || ""} onChange={(e) => setEditingUser({...editingUser, secondaryPhone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="alternateEmail">Alternate Email</Label>
                                  <Input id="alternateEmail" type="email" value={editingUser?.alternateEmail || ""} onChange={(e) => setEditingUser({...editingUser, alternateEmail: e.target.value})} />
                                </div>
                              </div>
                            </section>

                            <section className="space-y-4">
                              <h3 className="font-semibold border-b pb-2">Account Summary</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="availableBalance">Available Balance</Label>
                                  <Input id="availableBalance" value={editingUser?.availableBalance || ""} onChange={(e) => setEditingUser({...editingUser, availableBalance: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="accountType">Account Type</Label>
                                  <select 
                                    id="accountType"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editingUser?.accountType || "Checking"}
                                    onChange={(e) => setEditingUser({...editingUser, accountType: e.target.value})}
                                  >
                                    <option value="Checking">Checking</option>
                                    <option value="Saving">Saving</option>
                                  </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor="everydayChecking">Initial Balance</Label>
                                  <Input id="everydayChecking" value={editingUser?.everydayChecking || ""} onChange={(e) => setEditingUser({...editingUser, everydayChecking: e.target.value})} />
                                </div>
                              </div>
                            </section>
                          </div>
                          <Button className="w-full" onClick={() => updateUserMutation.mutate(editingUser)}>Update User</Button>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserAccountsView({ userId }: { userId: number }) {
  const { data: accountsData, isLoading } = useQuery<{accounts: any[]}>({
    queryKey: [`/api/admin/users/${userId}/accounts`],
  });

  const [editValue, setEditValue] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ accountId, balance }: { accountId: number, balance: string }) => {
      await apiRequest("PATCH", `/api/admin/accounts/${accountId}/balance`, { balance });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/accounts`] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setEditingId(null);
      toast({ title: "Success", description: "Balance updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update balance", variant: "destructive" });
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      await apiRequest("POST", "/api/admin/content", { key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({ title: "Success", description: "Content updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update content", variant: "destructive" });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      await apiRequest("DELETE", `/api/admin/accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/accounts`] });
      toast({ title: "Success", description: "Account deleted" });
    }
  });

  if (isLoading) return <span>Loading accounts...</span>;

  return (
    <div className="space-y-2">
      {accountsData?.accounts.map(account => (
        <div key={account.id} className="flex items-center gap-2 text-sm border-b pb-1">
          <span className="w-32">{account.accountType}:</span>
          {editingId === account.id ? (
            <>
              <Input 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 w-24"
              />
              <Button size="sm" onClick={() => updateBalanceMutation.mutate({ accountId: account.id, balance: editValue })}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            </>
          ) : (
            <>
              <span className="font-mono w-24">${account.balance}</span>
              <Button size="sm" variant="ghost" onClick={() => {
                setEditingId(account.id);
                setEditValue(account.balance);
              }}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAccountMutation.mutate(account.id)}>Delete</Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
