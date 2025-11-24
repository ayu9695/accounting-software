
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ExpensePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayment: (paymentData: {
    paymentDate: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }) => void;
  expenseId: string;
  expenseAmount: number;
  expenseDescription: string;
}
interface paymentMethods {
  id: string;
  code: string;
  name: string;
};

// const paymentMethods = [
//   { value: "bank_transfer", label: "Bank Transfer" },
//   { value: "credit_card", label: "Credit Card" },
//   { value: "debit_card", label: "Debit Card" },
//   { value: "cash", label: "Cash" },
//   { value: "cheque", label: "Cheque" },
//   { value: "upi", label: "UPI" },
//   { value: "net_banking", label: "Net Banking" }
// ];

export const ExpensePaymentDialog: React.FC<ExpensePaymentDialogProps> = ({
  open,
  onOpenChange,
  onPayment,
  expenseId,
  expenseAmount,
  expenseDescription
}) => {
const [paymentMethods, setPaymentMethods] = useState<paymentMethods[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    reference: "",
    notes: ""
  });
    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(()=> {
      const fetchPaymentMethods = async () => {
        try {
          const response = await fetch(`${baseUrl}/paymentMethods`, {
            credentials: 'include'
          });
          const data = await response.json();
          setPaymentMethods(data);
        } catch(error){
          console.error("Error fetching paymentMethods:", error);
          toast.error("Failed to load Payment Methods");
        }
      };
      fetchPaymentMethods();
    }, []);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    if (!formData.paymentDate) {
      toast.error("Please select a payment date");
      return;
    }

    onPayment({
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      reference: formData.reference.trim() || undefined,
      notes: formData.notes.trim() || undefined
    });

    // Reset form
    setFormData({
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      reference: "",
      notes: ""
    });
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      reference: "",
      notes: ""
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{expenseDescription}</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{expenseAmount.toLocaleString()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.code} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Transaction ID, Cheque number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this payment"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
