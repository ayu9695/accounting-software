import React, { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { User, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Create a context to share settings across the app
export const SettingsContext = React.createContext<{
  companySettings: any;
  emailSettings: any;
  taxSettings: any;
  currencies: any[];
}>({
  companySettings: {},
  emailSettings: {},
  taxSettings: {},
  currencies: [],
});

export const useSettings = () => React.useContext(SettingsContext);

// Define available currencies
const availableCurrencies = [
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
];

const Settings = () => {
  const { toast } = useToast();
  
  const [companySettings, setCompanySettings] = useState({
    name: "CloudScribe Finance",
    email: "admin@cloudscribe.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Plaza, Suite 101, San Francisco, CA 94107",
    taxId: "TAX87654321",
    logo: "",
    currency: "INR",
    departments: ["Sales", "Digital", "Technical"]
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "notifications@cloudscribe.com",
    smtpPassword: "************",
    enableEmailNotifications: true,
    sendInvoiceReminders: true,
    sendPaymentReceipts: true
  });

  const [taxSettings, setTaxSettings] = useState({
    gstRate: "18",
    tdsRate: "10",
    enableAutoCalculation: true,
    taxes: [
      { id: "1", name: "CGST", percentage: 9 },
      { id: "2", name: "SGST", percentage: 9 },
      { id: "3", name: "IGST", percentage: 18 },
    ]
  });

  // Function to save settings and display toast notification
  const saveSettings = (settingType: string) => {
    toast({
      title: "Settings Saved",
      description: `Your ${settingType} settings have been saved successfully.`,
    });

    // In a real app, we would save to backend here
    // For now, we'll save to localStorage for persistence
    if (settingType === "company") {
      localStorage.setItem("companySettings", JSON.stringify(companySettings));
    } else if (settingType === "email") {
      localStorage.setItem("emailSettings", JSON.stringify(emailSettings));
    } else if (settingType === "tax") {
      localStorage.setItem("taxSettings", JSON.stringify(taxSettings));
    }
  };

  interface Settings {
  tenantId: string;
  domain: string;
  tenantNumber: number;
  name: string;
  email: string;
  gstNumber: string;
  fiscalYearStart: string;    // or Date
  fiscalYearEnd: string;      // or Date
  currency: string;
  gstEnabled: boolean;
  defaultTaxRates: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  phone?: string;
  address?: string;
  invoicePrefix?: string;
  expenseCategories: string[];
  paymentMethods: string[];
  createdAt: string;          // or Date
  updatedAt: string;          // or Date
  updatedBy?: string;
  updateHistory: Array<{
    attribute: string;
    oldValue: any;
    newValue: any;
    updatedAt: string;        // or Date
    updatedBy?: string;
  }>;
}

interface Department {
  _id: string;
  tenantId: string;
  name: string;
  description: string;
}

  const [settings, setSettings] = useState<Settings | null>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Load settings from localStorage on component mount
  // useEffect(() => {
  //   const savedCompanySettings = localStorage.getItem("companySettings");
  //   const savedEmailSettings = localStorage.getItem("emailSettings");
  //   const savedTaxSettings = localStorage.getItem("taxSettings");
    
  //   if (savedCompanySettings) {
  //     setCompanySettings(JSON.parse(savedCompanySettings));
  //   }
  //   if (savedEmailSettings) {
  //     setEmailSettings(JSON.parse(savedEmailSettings));
  //   }
  //   if (savedTaxSettings) {
  //     setTaxSettings(JSON.parse(savedTaxSettings));
  //   }
  // }, []);
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${baseUrl}/settings`, {
          method: 'GET',
          credentials: 'include', // 🔑 This makes the browser send cookies
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data: Settings = await response.json();
        setSettings(data);
      } catch (err: any) {
        console.error('Failed to fetch settings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try{
      const res = await fetch(`${baseUrl}/departments`, {
        credentials: 'include'
      });

      if(!res.ok) {
        const errortext = await res.text();
        throw new Error(`Error ${res.status}: ${errortext}`);
      }
      const data: Department[] = await res.json();
      console.log("fetched departements: ", data);
      setDepartments(data);
    } catch(err: any){
      console.error('Faied to fetch departments:', err);
      setError(err.message);
    }
    // finally{
    //   setLoading(false);
    // }
    };
    fetchDepartments();
  }, []);

  const handleAddDepartment = async () => {
  if (!newDepartment.name.trim()) {
    toast({ title: "Error", description: "Department name is required", variant: "destructive" });
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: newDepartment.name,
        description: newDepartment.description
      })
    });

    if (!response.ok) throw new Error('Failed to create department');
    
    const createdDept: Department = await response.json();
    setDepartments([...departments, createdDept]);
    setNewDepartment({ name: '', description: '' });
    toast({ title: 'Success', description: 'Department created successfully' });
  } catch (err) {
    toast({ title: 'Error', description: 'Failed to create department', variant: 'destructive' });
  }
};

const handleUpdateDepartment = async (deptId: string, updatedData: Partial<Department>) => {
  try {
    const response = await fetch(`${baseUrl}/departments/${deptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) throw new Error('Failed to update department');
    
    const updatedDept: Department = await response.json();
    setDepartments(prev => prev.map(dept => dept._id === deptId ? updatedDept : dept));
    toast({ title: 'Success', description: 'Department updated successfully' });
  } catch (err) {
    toast({ title: 'Error', description: 'Failed to update department', variant: 'destructive' });
  }
};

// Function to delete department
const handleDeleteDepartment = async (deptId: string) => {
  try {
    const response = await fetch(`${baseUrl}/departments/${deptId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to delete department');
    
    setDepartments(prev => prev.filter(dept => dept._id !== deptId));
    toast({ title: 'Success', description: 'Department deleted successfully' });
  } catch (err) {
    toast({ title: 'Error', description: 'Failed to delete department', variant: 'destructive' });
  }
};

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p>Error loading settings: {error}</p>;
  if (!settings) return <p>No settings found.</p>;
  return (
    <PageLayout title="Settings">
      <SettingsContext.Provider value={{ 
        companySettings, 
        emailSettings, 
        taxSettings,
        currencies: availableCurrencies
      }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">System Settings</h1>
          <p className="text-muted-foreground">Manage your application settings and preferences.</p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="w-full border-b rounded-none h-auto p-0 bg-transparent justify-start">
            <TabsTrigger 
              value="company"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accounting-blue pb-2 pt-2"
            >
              Company Profile
            </TabsTrigger>
            <TabsTrigger 
              value="email"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accounting-blue pb-2 pt-2"
            >
              Email Settings
            </TabsTrigger>
            <TabsTrigger 
              value="tax"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accounting-blue pb-2 pt-2"
            >
              Tax Settings
            </TabsTrigger>
            <TabsTrigger 
              value="departments"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accounting-blue pb-2 pt-2"
            >
              Departments
            </TabsTrigger>
            {/* <TabsTrigger 
              value="security"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accounting-blue pb-2 pt-2"
            >
              Security
            </TabsTrigger> */}
          </TabsList>
        
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Manage your company details and branding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src='' alt="Company Logo" />
                    <AvatarFallback className="text-xl">
                      Fallback
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Upload Logo</Button>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      value={settings.name}
                      // onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Business Email</Label>
                    <Input 
                      id="companyEmail" 
                      type="email"
                      value={settings.email}
                      // onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Business Phone</Label>
                    <Input 
                      id="companyPhone" 
                      value={settings.phone}
                      // onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / GST Number</Label>
                    <Input 
                      id="taxId" 
                      value={settings.gstNumber}
                      // onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Input 
                      id="address" 
                      value={settings.address}
                      // onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select
                      value={companySettings.currency}
                      // onValueChange={(value) => setCompanySettings({...companySettings, currency: value})}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCurrencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("company")}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure your email server and notification settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input 
                      id="smtpServer" 
                      value={emailSettings.smtpServer}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input 
                      id="smtpPort" 
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input 
                      id="smtpUsername" 
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input 
                      id="smtpPassword" 
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableEmailNotifications" className="text-base">Enable Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Allow the system to send automated emails</p>
                    </div>
                    <Switch 
                      id="enableEmailNotifications" 
                      checked={emailSettings.enableEmailNotifications}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableEmailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sendInvoiceReminders" className="text-base">Invoice Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send automatic reminders for unpaid invoices</p>
                    </div>
                    <Switch 
                      id="sendInvoiceReminders" 
                      checked={emailSettings.sendInvoiceReminders}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendInvoiceReminders: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sendPaymentReceipts" className="text-base">Payment Receipts</Label>
                      <p className="text-sm text-muted-foreground">Send receipts when payments are received</p>
                    </div>
                    <Switch 
                      id="sendPaymentReceipts" 
                      checked={emailSettings.sendPaymentReceipts}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, sendPaymentReceipts: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("email")}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax Configuration</CardTitle>
                <CardDescription>Configure tax rates and calculation methods.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gstRate">Default GST Rate (%)</Label>
                    <Input 
                      id="gstRate" 
                      value={settings.defaultTaxRates.cgst + settings.defaultTaxRates.sgst}
                      onChange={(e) => setTaxSettings({...taxSettings, gstRate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tdsRate">Default TDS Rate (%)</Label>
                    <Input 
                      id="tdsRate" 
                      value={taxSettings.tdsRate}
                      onChange={(e) => setTaxSettings({...taxSettings, tdsRate: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Available Taxes</h3>
                  <div className="border rounded-md p-4 space-y-4">
                    {taxSettings.taxes.map((tax, index) => (
                      <div key={tax.id} className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <Input 
                            value={tax.name}
                            className="w-40"
                            onChange={(e) => {
                              const updatedTaxes = [...taxSettings.taxes];
                              updatedTaxes[index].name = e.target.value;
                              setTaxSettings({...taxSettings, taxes: updatedTaxes});
                            }}
                          />
                          <Input 
                            type="number"
                            value={tax.percentage}
                            className="w-20"
                            onChange={(e) => {
                              const updatedTaxes = [...taxSettings.taxes];
                              updatedTaxes[index].percentage = Number(e.target.value);
                              setTaxSettings({...taxSettings, taxes: updatedTaxes});
                            }}
                          />
                          <span className="flex items-center">%</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => {
                            const updatedTaxes = taxSettings.taxes.filter((_, i) => i !== index);
                            setTaxSettings({...taxSettings, taxes: updatedTaxes});
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const newId = (parseInt(taxSettings.taxes[taxSettings.taxes.length - 1]?.id || "0") + 1).toString();
                        setTaxSettings({
                          ...taxSettings, 
                          taxes: [...taxSettings.taxes, { id: newId, name: "New Tax", percentage: 0 }]
                        });
                      }}
                    >
                      Add Tax Type
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAutoCalculation" className="text-base">Automatic Tax Calculation</Label>
                      <p className="text-sm text-muted-foreground">Automatically calculate taxes on invoices</p>
                    </div>
                    <Switch 
                      id="enableAutoCalculation" 
                      checked={taxSettings.enableAutoCalculation}
                      onCheckedChange={(checked) => setTaxSettings({...taxSettings, enableAutoCalculation: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("tax")}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Department Management</CardTitle>
                <CardDescription>Manage your company's departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Departments</h3>
                  <div className="border rounded-md p-4 space-y-4">
                    {/* Existing Departments */}
      {departments.map((dept) => (
        <div key={dept._id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Input 
                value={dept.name}
                placeholder="Department name"
                onChange={(e) => {
                  const updatedName = e.target.value;
                  setDepartments(prev => 
                    prev.map(d => d._id === dept._id ? { ...d, name: updatedName } : d)
                  );
                }}
                onBlur={() => {
                  if (dept._id) {
                    handleUpdateDepartment(dept._id, { name: dept.name });
                  }
                }}
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-500"
              onClick={() => {
                if (dept._id) {
                  handleDeleteDepartment(dept._id);
                }
              }}
            >
              Remove
            </Button>
          </div>
          <Textarea
            value={dept.description}
            placeholder="Department description"
            className="min-h-[60px]"
            onChange={(e) => {
              const updatedDescription = e.target.value;
              setDepartments(prev => 
                prev.map(d => d._id === dept._id ? { ...d, description: updatedDescription } : d)
              );
            }}
            onBlur={() => {
              if (dept._id) {
                handleUpdateDepartment(dept._id, { description: dept.description });
              }
            }}
          />
        </div>
      ))}
      
      {/* Add New Department Form */}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-2">Add New Department</h4>
        <div className="space-y-2">
          <Input
            value={newDepartment.name}
            placeholder="Department name"
            onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
          />
          <Textarea
            value={newDepartment.description}
            placeholder="Department description"
            className="min-h-[60px]"
            onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
          />
          <Button 
            variant="outline" 
            onClick={handleAddDepartment}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>    
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("company")}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage account security and authentication.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Password Settings</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="sm:col-span-2">
                      <Separator />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">Secure your account with two-factor authentication.</p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-red-600">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">These actions are irreversible.</p>
                  <div className="flex gap-4">
                    <Button variant="destructive">Delete Account</Button>
                    <Button variant="outline">Export All Data</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SettingsContext.Provider>
    </PageLayout>
  );
};

export default Settings;
