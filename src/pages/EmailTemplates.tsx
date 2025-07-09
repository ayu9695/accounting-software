
import React, { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Mail } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// Mock email templates data
const generateMockTemplates = () => {
  return [
    {
      id: "1",
      name: "Invoice Payment Reminder",
      subject: "Payment Reminder: Invoice #{{invoice_number}}",
      body: "Dear {{client_name}},\n\nThis is a friendly reminder that invoice #{{invoice_number}} for the amount of {{amount}} is due on {{due_date}}.\n\nPlease process the payment at your earliest convenience.\n\nBest regards,\n{{company_name}}",
      category: "invoices"
    },
    {
      id: "2",
      name: "Invoice Payment Receipt",
      subject: "Payment Receipt: Invoice #{{invoice_number}}",
      body: "Dear {{client_name}},\n\nThank you for your payment of {{amount}} for invoice #{{invoice_number}}.\n\nYour payment has been received and processed.\n\nBest regards,\n{{company_name}}",
      category: "invoices"
    },
    {
      id: "3",
      name: "Monthly Report",
      subject: "Monthly Financial Report: {{month}} {{year}}",
      body: "Dear {{client_name}},\n\nPlease find attached the monthly financial report for {{month}} {{year}}.\n\nIf you have any questions, please do not hesitate to contact us.\n\nBest regards,\n{{company_name}}",
      category: "reports"
    }
  ];
};

const EmailTemplates = () => {
  const [templates, setTemplates] = useState(generateMockTemplates());
  const [isAddTemplateDialogOpen, setIsAddTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<null | {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: string;
  }>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [sendEmailData, setSendEmailData] = useState({
    to: "",
    subject: "",
    body: "",
    templateId: ""
  });

  // Filter templates based on active tab
  const filteredTemplates = activeTab === "all" 
    ? templates 
    : templates.filter(template => template.category === activeTab);

  const handleAddOrUpdateTemplate = () => {
    if (editingTemplate) {
      if (editingTemplate.id) {
        // Update existing template
        setTemplates(templates.map(t => 
          t.id === editingTemplate.id ? editingTemplate : t
        ));
      } else {
        // Add new template
        const newTemplate = {
          ...editingTemplate,
          id: Math.random().toString(36).substr(2, 9)
        };
        setTemplates([...templates, newTemplate]);
      }
      setEditingTemplate(null);
      setIsAddTemplateDialogOpen(false);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate({...template});
    setIsAddTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const handleSendEmail = (template) => {
    setSendEmailData({
      to: "",
      subject: template.subject,
      body: template.body,
      templateId: template.id
    });
    setEmailDialogOpen(true);
  };

  const handleSubmitEmail = () => {
    // This would connect to an email service provider in the future
    console.log("Sending email:", sendEmailData);
    toast({
      title: "Email Queued",
      description: "Your email has been queued for delivery.",
    });
    setEmailDialogOpen(false);
  };

  return (
    <PageLayout title="Email Templates">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Email Templates</h1>
        <Button 
          onClick={() => {
            setEditingTemplate({
              id: "",
              name: "",
              subject: "",
              body: "",
              category: "invoices"
            });
            setIsAddTemplateDialogOpen(true);
          }}
          className="bg-accounting-blue hover:bg-accounting-blue/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Templates</TabsTrigger>
          <TabsTrigger value="reports">Report Templates</TabsTrigger>
          <TabsTrigger value="general">General Templates</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{template.name}</CardTitle>
              <CardDescription className="truncate">
                {template.subject}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-36 overflow-auto">
              <p className="text-sm text-gray-600 whitespace-pre-line">{template.body}</p>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-between">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600" onClick={() => handleSendEmail(template)}>
                  <Mail className="h-4 w-4 mr-1" /> Send
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteTemplate(template.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isAddTemplateDialogOpen} onOpenChange={setIsAddTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate?.id ? "Edit Template" : "Add New Template"}</DialogTitle>
            <DialogDescription>
              Create or edit an email template for your communications.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={editingTemplate?.name || ""}
                  onChange={(e) => setEditingTemplate({...editingTemplate!, name: e.target.value})}
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={editingTemplate?.subject || ""}
                  onChange={(e) => setEditingTemplate({...editingTemplate!, subject: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingTemplate?.category || "invoices"}
                  onChange={(e) => setEditingTemplate({...editingTemplate!, category: e.target.value})}
                >
                  <option value="invoices">Invoices</option>
                  <option value="reports">Reports</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="col-span-4">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  rows={10}
                  value={editingTemplate?.body || ""}
                  onChange={(e) => setEditingTemplate({...editingTemplate!, body: e.target.value})}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Use &#123;&#123;variable_name&#125;&#125; to insert dynamic content.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingTemplate(null);
              setIsAddTemplateDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdateTemplate}>
              {editingTemplate?.id ? "Update Template" : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Enter recipient details to send this email template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="email"
                  value={sendEmailData.to}
                  onChange={(e) => setSendEmailData({...sendEmailData, to: e.target.value})}
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <Label htmlFor="emailSubject">Subject</Label>
                <Input
                  id="emailSubject"
                  value={sendEmailData.subject}
                  onChange={(e) => setSendEmailData({...sendEmailData, subject: e.target.value})}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <Label htmlFor="emailBody">Message</Label>
                <Textarea
                  id="emailBody"
                  rows={8}
                  value={sendEmailData.body}
                  onChange={(e) => setSendEmailData({...sendEmailData, body: e.target.value})}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEmail}>
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default EmailTemplates;
