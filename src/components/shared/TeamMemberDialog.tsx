
import React, { useState } from "react";
import { PopupForm } from "@/components/ui/popup-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSettings } from "@/pages/Settings";

interface TeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember?: {
    id?: string;
    name: string;
    email: string;
    department: string;
    role: string;
  };
  onSave: (teamMember: {
    id?: string;
    name: string;
    email: string;
    department: string;
    role: string;
  }) => void;
}

export const TeamMemberDialog: React.FC<TeamMemberDialogProps> = ({
  open,
  onOpenChange,
  teamMember = { name: "", email: "", department: "", role: "" },
  onSave,
}) => {
  const { companySettings } = useSettings();
  const [member, setMember] = useState(teamMember);
  const isEditing = !!teamMember.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member.name.trim() || !member.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    
    onSave(member);
    onOpenChange(false);
    
    toast.success(`${member.name} has been ${isEditing ? "updated" : "added"} successfully.`);
  };

  return (
    <PopupForm
      title={isEditing ? "Edit Team Member" : "Add Team Member"}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter full name"
            value={member.name}
            onChange={(e) => setMember({...member, name: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={member.email}
            onChange={(e) => setMember({...member, email: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={member.department}
            onValueChange={(value) => setMember({...member, department: value})}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {companySettings.departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            placeholder="Enter role or position"
            value={member.role}
            onChange={(e) => setMember({...member, role: e.target.value})}
          />
        </div>
      </div>
    </PopupForm>
  );
};
