
import React, { useState } from "react";
import { PopupForm } from "@/components/ui/popup-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Upload, Calculator, Plus } from "lucide-react";
import { VendorBill, Vendor } from "@/types";

interface VendorBillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (bill: Omit<VendorBill, 'id' | 'uploadDate'>) => void;
  vendors: Vendor[];
}

export const VendorBillForm: React.FC<VendorBillFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  vendors
}) => {
  const [formData, setFormData] = useState({
    vendorId: "",
    vendorName: "",
    billNumber: "",
    billDate: "",
    taxableAmount: "",
    cgst: "",
    sgst: "",
    igst: "",
    tdsRate: "2",
    category: "",
    description: "",
    fileName: "",
    file: null as File | null,
    otherCharges: ""
  });

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    grossAmount: 0,
    tdsAmount: 0,
    netPayable: 0
  });

  const [otherChargesDialog, setOtherChargesDialog] = useState(false);

  const calculateAmounts = () => {
    const taxableAmount = parseFloat(formData.taxableAmount) || 0;
    const cgst = parseFloat(formData.cgst) || 0;
    const sgst = parseFloat(formData.sgst) || 0;
    const igst = parseFloat(formData.igst) || 0;
    const otherCharges = parseFloat(formData.otherCharges) || 0;
    const tdsRate = parseFloat(formData.tdsRate) || 0;
    
    const grossAmount = taxableAmount + cgst + sgst + igst + otherCharges;
    const tdsAmount = (grossAmount * tdsRate) / 100;
    const netPayable = grossAmount - tdsAmount;
    
    setCalculatedAmounts({ grossAmount, tdsAmount, netPayable });
  };

  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    setFormData({
      ...formData,
      vendorId,
      vendorName: vendor?.name || ""
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        file,
        fileName: file.name
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorId || !formData.billNumber || !formData.taxableAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const bill: Omit<VendorBill, 'id' | 'uploadDate'> = {
      vendorId: formData.vendorId,
      vendorName: formData.vendorName,
      billNumber: formData.billNumber,
      billDate: formData.billDate,
      totalAmount: calculatedAmounts.grossAmount,
      taxableAmount: parseFloat(formData.taxableAmount),
      cgst: parseFloat(formData.cgst) || 0,
      sgst: parseFloat(formData.sgst) || 0,
      igst: parseFloat(formData.igst) || 0,
      tdsRate: parseFloat(formData.tdsRate),
      tdsAmount: calculatedAmounts.tdsAmount,
      payableAmount: calculatedAmounts.netPayable,
      status: 'pending',
      category: formData.category,
      description: formData.description,
      fileName: formData.fileName,
      fileUrl: formData.file ? URL.createObjectURL(formData.file) : undefined
    };

    onSubmit(bill);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      vendorId: "",
      vendorName: "",
      billNumber: "",
      billDate: "",
      taxableAmount: "",
      cgst: "",
      sgst: "",
      igst: "",
      tdsRate: "2",
      category: "",
      description: "",
      fileName: "",
      file: null,
      otherCharges: ""
    });
    setCalculatedAmounts({ grossAmount: 0, tdsAmount: 0, netPayable: 0 });
  };

  return (
    <PopupForm
      title="Add Vendor Bill"
      description="Upload and record vendor bill details with TDS calculation"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      className="sm:max-w-[700px]"
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vendor">Vendor *</Label>
            <Select value={formData.vendorId} onValueChange={handleVendorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="billNumber">Bill Number *</Label>
            <Input
              id="billNumber"
              value={formData.billNumber}
              onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
              placeholder="Enter bill number"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="billDate">Bill Date</Label>
            <Input
              id="billDate"
              type="date"
              value={formData.billDate}
              onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Goods">Goods</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Professional Fees">Professional Fees</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="taxableAmount">Taxable Amount *</Label>
          <Input
            id="taxableAmount"
            type="number"
            step="0.01"
            value={formData.taxableAmount}
            onChange={(e) => setFormData({ ...formData, taxableAmount: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cgst">CGST</Label>
            <Input
              id="cgst"
              type="number"
              step="0.01"
              value={formData.cgst}
              onChange={(e) => setFormData({ ...formData, cgst: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="sgst">SGST</Label>
            <Input
              id="sgst"
              type="number"
              step="0.01"
              value={formData.sgst}
              onChange={(e) => setFormData({ ...formData, sgst: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="igst">IGST</Label>
            <Input
              id="igst"
              type="number"
              step="0.01"
              value={formData.igst}
              onChange={(e) => setFormData({ ...formData, igst: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Other Charges (Optional)</Label>
            <Dialog open={otherChargesDialog} onOpenChange={setOtherChargesDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  {formData.otherCharges ? `₹${parseFloat(formData.otherCharges).toFixed(2)}` : 'Add Other Charges'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Other Charges</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otherCharges">Amount</Label>
                    <Input
                      id="otherCharges"
                      type="number"
                      step="0.01"
                      value={formData.otherCharges}
                      onChange={(e) => setFormData({ ...formData, otherCharges: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <Button onClick={() => setOtherChargesDialog(false)}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Label htmlFor="tdsRate">TDS Rate (%)</Label>
            <Select value={formData.tdsRate} onValueChange={(value) => setFormData({ ...formData, tdsRate: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1%</SelectItem>
                <SelectItem value="2">2%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-end">
          <Button type="button" onClick={calculateAmounts} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate TDS & Net Payable
          </Button>
        </div>

        {calculatedAmounts.netPayable > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label>Gross Amount</Label>
              <div className="font-medium">₹{calculatedAmounts.grossAmount.toFixed(2)}</div>
            </div>
            <div>
              <Label>TDS Amount</Label>
              <div className="font-medium">₹{calculatedAmounts.tdsAmount.toFixed(2)}</div>
            </div>
            <div>
              <Label>Net Payable</Label>
              <div className="font-medium text-green-600">₹{calculatedAmounts.netPayable.toFixed(2)}</div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the bill"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="file">Upload Bill Document</Label>
          <div className="border-2 border-dashed rounded-md p-4 text-center">
            <input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formData.file ? formData.file.name : "Click to upload bill document"}
              </span>
              <span className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</span>
            </label>
          </div>
        </div>
      </div>
    </PopupForm>
  );
};
