
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, CalendarIcon, TrashIcon, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface Tax {
  id: string;
  name: string;
  percentage: number;
}

interface CustomField {
  id: string;
  name: string;
  value: string;
}

interface LineItem {
  id: string;
  description: string;
  resourceName?: string;
  period?: string;
  monthlyCharge: number;
  rate: number;
  quantity: number;
  amount: number;
}

interface InvoiceFormValues {
  invoiceNumber: string;
  client: string;
  department: string;
  issueDate: Date | undefined;
  dueDate: Date | undefined;
  amount: string;
  taxes: Tax[];
  customFields: CustomField[];
  lineItems: LineItem[];
  companyInfo: {
    name: string;
    gstin: string;
    address: string;
    state: string;
    stateCode: string;
  };
  clientInfo: {
    name: string;
    gstin: string;
    address: string;
    state: string;
    stateCode: string;
  };
  hsnCode: string;
}

// Sample client list - would come from database in a real app
const clients = [
  { 
    id: "1", 
    name: "Test Private Limited",
    gstin: "079865467897",
    address: "test address",
    state: "Maharashtra",
    stateCode: "27"
  },
  { id: "2", name: "Globex Corp" },
  { id: "3", name: "Wayne Enterprises" },
  { id: "4", name: "Stark Industries" },
  { id: "5", name: "Umbrella Corp" },
  { id: "6", name: "Cyberdyne Systems" },
  { id: "7", name: "Initech" },
];

// Department options
const departments = [
  "Sales",
  "Digital",
  "Technical"
];

// Company information
const companyInfo = {
  name: "Test Services Pvt. Ltd.",
  gstin: "087675865474764567576",
  address: "test address",
  state: "Delhi",
  stateCode: "09",
  bankName: "Bosss Bank",
  branch: "new branch",
  accountNumber: "463216756425",
  ifsc: "bosss00968"
};

const CreateInvoiceDialog = () => {
  const { toast } = useToast();
  const [taxes, setTaxes] = useState<Tax[]>([
    { id: "1", name: "CGST", percentage: 0 },
    { id: "2", name: "SGST", percentage: 0 },
    { id: "3", name: "IGST", percentage: 18 },
  ]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxPercentage, setNewTaxPercentage] = useState("");
  const [newCustomFieldName, setNewCustomFieldName] = useState("");
  const [newCustomFieldValue, setNewCustomFieldValue] = useState("");
  const [open, setOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "Resource Outsource Services",
      resourceName: "Test User",
      period: "1st April to 30th April'25",
      monthlyCharge: 120,
      rate: 87.3,
      quantity: 2,
      amount: 16
    }
  ]);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceFormValues | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      invoiceNumber: "",
      client: "",
      department: "",
      issueDate: undefined,
      dueDate: undefined,
      amount: "",
      taxes: [],
      customFields: [],
      lineItems: [],
      companyInfo: { ...companyInfo },
      clientInfo: {
        name: "",
        gstin: "",
        address: "",
        state: "",
        stateCode: ""
      },
      hsnCode: "998513"
    },
  });

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      form.setValue("client", clientId);
      form.setValue("clientInfo", {
        name: selectedClient.name,
        gstin: selectedClient.gstin || "",
        address: selectedClient.address || "",
        state: selectedClient.state || "",
        stateCode: selectedClient.stateCode || ""
      });
      setSelectedClient(clientId);
    }
  };

  const addLineItem = () => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "",
      resourceName: "",
      period: "",
      monthlyCharge: 0,
      rate: 0,
      quantity: 0,
      amount: 0
    };
    setLineItems([...lineItems, newLineItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate amount when rate or quantity changes
          if (field === "rate" || field === "quantity") {
            const rate = field === "rate" ? value : item.rate;
            const quantity = field === "quantity" ? value : item.quantity;
            updatedItem.amount = rate * quantity;
          }
          return updatedItem;
        }
        return item;
      });
    });
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const onSubmit = (data: InvoiceFormValues) => {
    // Add taxes and custom fields to the form data
    const formData = {
      ...data,
      taxes,
      customFields,
      lineItems
    };
    
    // Generate a invoice number if not provided
    if (!formData.invoiceNumber) {
      formData.invoiceNumber = `WIT-${Math.floor(Math.random() * 10000).toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`;
    }
    
    console.log("Invoice data:", formData);
    
    // In a real application, this would save the invoice to a database
    setGeneratedInvoice(formData);
    setShowInvoicePreview(true);
    
    // Show toast
    toast({
      title: "Invoice Created",
      description: `Invoice ${formData.invoiceNumber} has been created successfully.`,
    });
  };

  const addTax = () => {
    if (newTaxName && newTaxPercentage) {
      const percentage = parseFloat(newTaxPercentage);
      if (!isNaN(percentage)) {
        const newTax = {
          id: `tax-${Date.now()}`,
          name: newTaxName,
          percentage,
        };
        setTaxes([...taxes, newTax]);
        setNewTaxName("");
        setNewTaxPercentage("");
      }
    }
  };

  const removeTax = (id: string) => {
    setTaxes(taxes.filter((tax) => tax.id !== id));
  };
  
  const addCustomField = () => {
    if (newCustomFieldName && newCustomFieldValue) {
      const newField = {
        id: `field-${Date.now()}`,
        name: newCustomFieldName,
        value: newCustomFieldValue,
      };
      setCustomFields([...customFields, newField]);
      setNewCustomFieldName("");
      setNewCustomFieldValue("");
    }
  };
  
  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter((field) => field.id !== id));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTaxAmount = (subtotal: number, taxPercentage: number) => {
    return subtotal * (taxPercentage / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = taxes.reduce((sum, tax) => {
      return sum + calculateTaxAmount(subtotal, tax.percentage);
    }, 0);
    return subtotal + taxAmount;
  };

  const closePreview = () => {
    setShowInvoicePreview(false);
    setGeneratedInvoice(null);
    form.reset();
    setTaxes([
      { id: "1", name: "CGST", percentage: 0 },
      { id: "2", name: "SGST", percentage: 0 },
      { id: "3", name: "IGST", percentage: 18 },
    ]);
    setCustomFields([]);
    setOpen(false);
  };

  // Convert number to words
  const numberToWords = (num: number) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertLessThanOneThousand = (n: number) => {
      if (n === 0) return '';
      
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
      }
      return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
    };

    if (num === 0) return 'Zero';

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remaining = num % 1000;

    let result = '';
    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + ' Thousand ';
    }
    if (remaining > 0) {
      result += convertLessThanOneThousand(remaining);
    }
    return result.trim();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  };

  if (showInvoicePreview && generatedInvoice) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <PlusIcon size={16} className="mr-2" />
            Create Invoice
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Invoice Preview</span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // In a real app, this would generate a PDF
                    toast({
                      title: "PDF Generated",
                      description: "Invoice PDF has been generated and is ready for download."
                    });
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={closePreview}>Close Preview</Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-white p-4 border rounded-lg space-y-4 print:shadow-none">
            {/* Invoice Header */}
            <div className="grid grid-cols-12 border border-gray-300">
              <div className="col-span-4 border-r border-gray-300 p-4 flex items-center justify-center">
                <div className="text-4xl font-bold text-accounting-primary">W</div>
              </div>
              <div className="col-span-8 p-4 text-center">
                <h1 className="text-xl font-bold">{companyInfo.name}</h1>
                <p className="text-sm">Reg. Address - {companyInfo.address}</p>
                <p className="text-sm">New Delhi, India</p>
                <p className="text-sm font-semibold">GSTIN: {companyInfo.gstin}</p>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="bg-gray-300 p-2 text-center">
              <h2 className="text-xl font-bold">Tax Invoice</h2>
            </div>

            {/* Company and Invoice Info */}
            <div className="grid grid-cols-12 border border-gray-300">
              <div className="col-span-6 p-2 border-r border-gray-300">
                <p className="font-semibold">{companyInfo.name}</p>
                <p>GSTIN: {companyInfo.gstin}</p>
                <p>State Name: {companyInfo.state}, Code - {companyInfo.stateCode}</p>
              </div>
              <div className="col-span-6 p-2 grid grid-cols-2">
                <div>Invoice No.</div>
                <div>: {generatedInvoice.invoiceNumber}</div>
                <div>Invoice Date</div>
                <div>: {generatedInvoice.issueDate ? format(generatedInvoice.issueDate, "dd-MM-yyyy") : ""}</div>
                <div>HSN Code</div>
                <div>: {generatedInvoice.hsnCode}</div>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-1 border border-gray-300">
              <div className="p-2 bg-gray-100">
                <p className="font-semibold">Invoice To :</p>
              </div>
              <div className="p-2">
                <p className="font-semibold">Name: {generatedInvoice.clientInfo.name}</p>
                <p>Address: {generatedInvoice.clientInfo.address}</p>
                <p>GSTIN: {generatedInvoice.clientInfo.gstin}</p>
                <p>State Name: {generatedInvoice.clientInfo.state}, Code - {generatedInvoice.clientInfo.stateCode}</p>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">S. No.</th>
                    <th className="border border-gray-300 p-2 text-left">Description Of Services</th>
                    <th className="border border-gray-300 p-2 text-right">Monthly Charge</th>
                    <th className="border border-gray-300 p-2 text-right">Rate</th>
                    <th className="border border-gray-300 p-2 text-center">Period</th>
                    <th className="border border-gray-300 p-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-gray-200" : ""}>
                      <td className="border border-gray-300 p-2">{index + 1}</td>
                      <td className="border border-gray-300 p-2">
                        <div>{item.description}</div>
                        {item.resourceName && <div>Resource Name: {item.resourceName}</div>}
                        {item.period && <div>Period: {item.period}</div>}
                        <div>L O P: 2</div>
                      </td>
                      <td className="border border-gray-300 p-2 text-right">₹{formatCurrency(item.monthlyCharge)}</td>
                      <td className="border border-gray-300 p-2 text-right">₹{formatCurrency(item.rate)}</td>
                      <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 p-2 text-right">₹{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary */}
            <div className="grid grid-cols-12 border border-gray-300">
              <div className="col-span-8 border-r border-gray-300 p-2">
                {/* Empty space or additional info */}
              </div>
              <div className="col-span-4 p-2">
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="font-semibold">Sub Total</div>
                  <div className="text-right">₹{formatCurrency(calculateSubtotal())}</div>
                  
                  <div className="font-semibold">Discount</div>
                  <div className="text-right">₹0.00</div>
                  
                  <div className="font-semibold">Sub Total After Discount</div>
                  <div className="text-right">₹{formatCurrency(calculateSubtotal())}</div>
                  
                  {taxes.map(tax => (
                    <React.Fragment key={tax.id}>
                      <div className="font-semibold">{tax.name}</div>
                      <div className="text-right">
                        {tax.percentage}% - ₹{formatCurrency(calculateTaxAmount(calculateSubtotal(), tax.percentage))}
                      </div>
                    </React.Fragment>
                  ))}
                  
                  <div className="font-semibold text-lg">Total</div>
                  <div className="text-right font-bold text-lg">₹{formatCurrency(calculateTotal())}</div>
                </div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="border border-gray-300 p-2">
              <div className="font-semibold">Amount Chargeable (in words)</div>
              <div className="font-semibold">
                Rupees {numberToWords(Math.round(calculateTotal()))} Only
              </div>
            </div>

            {/* Bank Details */}
            <div className="border border-gray-300 p-2">
              <div className="font-semibold">Name: {companyInfo.name}</div>
              <div>Bank & Branch: {companyInfo.bankName}, {companyInfo.branch}</div>
              <div>Bank A/c No.: {companyInfo.accountNumber}</div>
              <div>Bank IFSC: {companyInfo.ifsc}</div>
            </div>

            {/* Footer */}
            <div className="border border-gray-300 p-2 text-right">
              <div className="mb-10">{companyInfo.name}</div>
              <div className="text-center mt-4">Thank You For Your Business!</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusIcon size={16} className="mr-2" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="WIT-XX-XXX (auto-generated if empty)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hsnCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HSN Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select 
                      onValueChange={(value) => handleClientChange(value)} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client Information Section */}
            <div className="space-y-2 border p-3 rounded-md">
              <h3 className="font-semibold">Client Information</h3>
              {selectedClient ? (
                <div className="text-sm">
                  <FormField
                    control={form.control}
                    name="clientInfo.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name="clientInfo.gstin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GSTIN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="clientInfo.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clientInfo.stateCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="clientInfo.address"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Please select a client to load information.</p>
              )}
            </div>

            {/* Line Items Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Line Items</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addLineItem}
                  className="h-8"
                >
                  <PlusIcon size={14} className="mr-1" />
                  Add Item
                </Button>
              </div>
              
              {lineItems.length > 0 ? (
                <div className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="p-3 border rounded-md bg-muted/20">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeLineItem(item.id)}
                          className="h-8 text-destructive"
                        >
                          <TrashIcon size={14} className="mr-1" />
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                            placeholder="Service description"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Resource Name</Label>
                            <Input
                              value={item.resourceName || ""}
                              onChange={(e) => updateLineItem(item.id, "resourceName", e.target.value)}
                              placeholder="Resource name"
                            />
                          </div>
                          <div>
                            <Label>Period</Label>
                            <Input
                              value={item.period || ""}
                              onChange={(e) => updateLineItem(item.id, "period", e.target.value)}
                              placeholder="e.g. 1st April to 30th April'25"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label>Monthly Charge</Label>
                            <Input
                              type="number"
                              value={item.monthlyCharge || ""}
                              onChange={(e) => updateLineItem(item.id, "monthlyCharge", parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Rate</Label>
                            <Input
                              type="number"
                              value={item.rate || ""}
                              onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={item.quantity || ""}
                              onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        
                        <div className="border-t pt-2 mt-1">
                          <div className="flex justify-between">
                            <span className="font-medium">Amount:</span>
                            <span className="font-bold">₹{formatCurrency(item.amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-2 p-3 border rounded-md">
                  No line items added yet. Click "Add Item" to add your first invoice item.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Taxes</Label>
              <div className="space-y-2">
                {taxes.map((tax) => (
                  <div key={tax.id} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                    <div className="font-medium">
                      {tax.name} ({tax.percentage}%)
                    </div>
                    <Input
                      type="number"
                      className="w-20 ml-2"
                      value={tax.percentage}
                      onChange={(e) => {
                        const newPercentage = parseFloat(e.target.value) || 0;
                        setTaxes(taxes.map(t => 
                          t.id === tax.id ? {...t, percentage: newPercentage} : t
                        ));
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Adjust tax percentages as needed. For interstate transactions, use IGST. For intrastate, use CGST and SGST.
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Fields</Label>
              {customFields.length > 0 ? (
                <div className="flex flex-col space-y-2 mb-3">
                  {customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                      <div className="font-medium">
                        {field.name}: {field.value}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCustomField(field.id)}
                      >
                        <TrashIcon size={16} />
                        <span className="ml-1">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-2">No custom fields added yet. Add fields below.</div>
              )}
              
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Field Name"
                  value={newCustomFieldName}
                  onChange={(e) => setNewCustomFieldName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Field Value"
                  value={newCustomFieldValue}
                  onChange={(e) => setNewCustomFieldValue(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addCustomField}
                  className="whitespace-nowrap"
                >
                  <PlusIcon size={16} className="mr-1" />
                  Add Field
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="text-right mb-4 space-y-1">
                <div className="flex justify-end">
                  <span className="w-32 text-right font-medium">Subtotal:</span>
                  <span className="w-28 text-right">₹{formatCurrency(calculateSubtotal())}</span>
                </div>
                {taxes.map(tax => (
                  <div key={tax.id} className="flex justify-end">
                    <span className="w-32 text-right font-medium">{tax.name} ({tax.percentage}%):</span>
                    <span className="w-28 text-right">₹{formatCurrency(calculateTaxAmount(calculateSubtotal(), tax.percentage))}</span>
                  </div>
                ))}
                <div className="flex justify-end font-bold text-lg">
                  <span className="w-32 text-right">Total:</span>
                  <span className="w-28 text-right">₹{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Invoice</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
