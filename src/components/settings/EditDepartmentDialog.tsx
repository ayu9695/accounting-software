
import React, { useState } from "react";
import { PopupForm } from "@/components/ui/popup-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

interface EditDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: string;
  onSave: (department: string) => void;
}

export const EditDepartmentDialog: React.FC<EditDepartmentDialogProps> = ({
  open,
  onOpenChange,
  department = "",
  onSave,
}) => {
  const [deptName, setDeptName] = useState(department);
  const isEditing = !!department;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deptName.trim()) {
      toast.error("Department name cannot be empty");
      return;
    }
    
    onSave(deptName);
    onOpenChange(false);
    
    toast.success(`Department "${deptName}" has been ${isEditing ? "updated" : "added"} successfully.`);
  };

  return (
    <PopupForm
      title={isEditing ? "Edit Department" : "Add Department"}
      description="Enter the department name below."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="departmentName">Department Name</Label>
          <Input
            id="departmentName"
            placeholder="Enter department name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
          />
        </div>
      </div>
    </PopupForm>
  );
};
