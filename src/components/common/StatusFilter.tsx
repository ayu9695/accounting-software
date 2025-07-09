
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StatusOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  options: StatusOption[];
  placeholder?: string;
  label?: string;
  'aria-label'?: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "All Status",
  label,
  'aria-label': ariaLabel = "Filter by status"
}) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px]" aria-label={ariaLabel}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="all" value="all">All Status</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
