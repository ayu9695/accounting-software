
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  _id?: string;
  code: string;
  name: string;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayment: (paymentData: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    paymentMethodName: string;
    reference?: string;
    notes?: string;
  }) => void;
  totalAmount: number;
  title: string;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  onPayment,
  totalAmount,
  title
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [formData, setFormData] = useState({
    amount: totalAmount.toString(),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    reference: "",
    notes: ""
  });

  const baseUrl = import.meta.env.VITE_API_URL;

  // Fetch payment methods from API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${baseUrl}/paymentMethods`, {
          credentials: 'include'
        });
        const data = await response.json();
        setPaymentMethods(data);
      } catch (error) {
        console.error("Error fetching paymentMethods:", error);
        toast.error("Failed to load Payment Methods");
      }
    };
    fetchPaymentMethods();
  }, []);

  // Update amount when totalAmount changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, amount: totalAmount.toString() }));
  }, [totalAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.paymentDate) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!formData.paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    // Find the selected payment method to get its name
    const selectedPaymentMethod = paymentMethods.find(m => (m.id || m._id) === formData.paymentMethod);
    const paymentMethodName = selectedPaymentMethod?.name || '';

    onPayment({
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,      // ID for BE
      paymentMethodName: paymentMethodName,        // Name for display
      reference: formData.reference,
      notes: formData.notes
    });

    onOpenChange(false);
    setFormData({
      amount: totalAmount.toString(),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      reference: "",
      notes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              />
            </div>
          </div>

          <div>
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
                  <SelectItem key={method.id || method._id} value={method.id || method._id || ''}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference">Payment Reference</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Transaction ID, Cheque Number, etc."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional payment details"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
