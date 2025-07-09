
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/pages/Settings";

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({ 
  value, 
  onValueChange,
  label
}) => {
  const { currencies } = useSettings();
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.value} value={currency.value}>
              {currency.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currencies = [
    { value: "INR", symbol: "₹" },
    { value: "USD", symbol: "$" },
    { value: "EUR", symbol: "€" },
    { value: "GBP", symbol: "£" },
  ];
  
  return currencies.find(c => c.value === currencyCode)?.symbol || currencyCode;
};
