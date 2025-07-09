import React, { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/auth/AuthContext';
import { Users, Plus, Edit, Trash2 } from "lucide-react";

interface User {
  _id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'team_member';
  avatar?: string;
  isActive?: boolean;
  address?: string;
  createdAt: string;
  updatedAt: string;
  country?: string;
  updateHistory?: Array<{
    attribute: string;
    oldValue: any;
    newValue: any;
    updatedAt: string;
    updatedBy?: string;
  }>;
}

const Profile = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'team_member' as 'admin' | 'team_member',
    department: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManageUsers = ['superadmin', 'admin'].includes(user?.role);
  const canAddAdmins = user?.role === 'superadmin';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // useEffect(() => {
  //   const fetchCurrentUser = async () => {
  //     try {
  //       const response = await fetch('http://localhost:3000/api/user', {
  //         method: 'GET',
  //         credentials: 'include'
  //       });
  //       if (!response.ok) throw new Error('Failed to fetch current user');
  //       const data: User = await response.json();
  //       setCurrentUser(data);
  //     } catch (err: any) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const fetchUsers = async () => {
  //     try {
  //       const response = await fetch('http://localhost:3000/api/users', {
  //         method: 'GET',
  //         credentials: 'include'
  //       });
  //       const data: User[] = await response.json();
  //       setUsers(data);
  //     } catch (err) {
  //       console.error('Error fetching users:', err);
  //     }
  //   };

  //   fetchCurrentUser();
  //   if (canManageUsers) fetchUsers();
  // }, [canManageUsers]);
  
    useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user', {
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch current user');
        const data: User = await response.json();
        setCurrentUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingUsers(false);
    }
  };

  fetchCurrentUser();
}, []);

useEffect(() => {
  const fetchUsers = async () => {
    console.log("Running fetchusers API");
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'GET',
        credentials: 'include'
      });
      const data: User[] = await response.json();
      setUsers(data);
      console.log(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') {
    fetchUsers();
  }
}, [currentUser]); // 👀 Run only after currentUser is available

    const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'team-member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.department || !newUser.password) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newUser)
      });
      if (!response.ok) throw new Error('Failed to create user');
      const created = await response.json();
      setUsers([...users, created]);
      setNewUser({ name: '', email: '', role: 'team_member', department: '', password: '' });
      setIsAddUserOpen(false);
      toast({ title: 'Success', description: 'User created successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Error creating user', variant: 'destructive' });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: currentUser?.name,
          email: currentUser?.email
        })
      });
      if (!response.ok) throw new Error('Failed to update profile');
      toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handleToggleOnOff = async (userId: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/users/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error('Failed to toggle user status');

    const updatedUser = await response.json();

    setUsers(prev =>
      prev.map(user =>
        user._id === userId ? { ...user, isActive: updatedUser.isActive } : user
      )
    );
  } catch (err) {
    console.error('Toggle failed:', err);
  }
};

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser._id) {
    toast({
      title: "Error",
      description: "You cannot delete your own account",
      variant: "destructive"
    });
    return;
  }
  try {
    const res = await fetch('http://localhost:3000/api/user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ userId }) // Only sending email
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    // // Optionally update UI after deletion
    setUsers(prev => prev.filter(u => u._id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been deleted successfully"
    });
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message,
      variant: "destructive"
    });
  }
};

  const handleUpdatePassword = async () => {
  if (!oldPassword || !newPassword || !confirmPassword) {
    toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
    return;
  }

  if (newPassword !== confirmPassword) {
    toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
    return;
  }
  console.log("userid: ", currentUser._id, " oldpassword: ", oldPassword, " new password: ", newPassword);

  try {
    const response = await fetch('http://localhost:3000/api/user/password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: currentUser._id,
        email: currentUser.email, // comes from fetched user data
        oldPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Password update failed');
    }

    toast({ title: 'Success', description: 'Password updated successfully' });

    // clear fields
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  } catch (err: any) {
    toast({ title: 'Error', description: err.message, variant: 'destructive' });
  }
};

  if (loading) return <p>Loading settings...</p>;
  if (error || !currentUser) return <p>Error loading settings: {error}</p>;

  return (
    <PageLayout title="My Account">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground mt-2">Manage your profile and account settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {canManageUsers && <TabsTrigger value="users">User Management</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl">{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.replace('super', 'super ').toUpperCase()}
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Change Picture
                </Button>
              </CardContent>
            </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentUser.email}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button onClick={handleUpdatePassword}>Update Password</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">Secure your account with two-factor authentication</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {canManageUsers && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage system users and their permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6}>Loading users...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>No users found.</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>TBD</TableCell>
                        <TableCell>
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => handleToggleOnOff(user._id)}
                            disabled={user._id === currentUser._id}
                          />
                        </TableCell>
                        {/* <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </TableCell> */}
                        <TableCell>NEVER</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user._id !== currentUser._id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          )}
      </Tabs>
    </PageLayout>
  );
};

export default Profile;
