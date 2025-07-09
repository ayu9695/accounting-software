
import React, { useState } from "react";
import { PopupForm } from "@/components/ui/popup-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useSettings } from "@/pages/Settings";

interface TeamMember {
  name: string;
  email: string;
  department: string;
  position: string;
  baseSalary: number;
  joinDate: string;
}

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (members: TeamMember[]) => void;
}

export const TeamManagementDialog: React.FC<TeamManagementDialogProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const { companySettings } = useSettings();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      name: "",
      email: "",
      department: "",
      position: "",
      baseSalary: 0,
      joinDate: new Date().toISOString().split('T')[0]
    }
  ]);

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string | number) => {
    setTeamMembers(members => members.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, {
      name: "",
      email: "",
      department: "",
      position: "",
      baseSalary: 0,
      joinDate: new Date().toISOString().split('T')[0]
    }]);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMembers = teamMembers.filter(member => 
      member.name && member.email && member.department && member.position && member.baseSalary > 0
    );

    if (validMembers.length === 0) {
      toast.error("Please add at least one complete team member");
      return;
    }

    if (validMembers.length !== teamMembers.length) {
      toast.error("Please complete all team member details or remove incomplete entries");
      return;
    }

    onSave(validMembers);
    onOpenChange(false);
    toast.success(`${validMembers.length} team member(s) added successfully`);
  };

  return (
    <PopupForm
      title="Add Team Members"
      description="Add multiple team members to the system at once"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      className="max-w-6xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Team Members</Label>
          <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Team Member {index + 1}</h4>
                {teamMembers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeamMember(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select
                    value={member.department}
                    onValueChange={(value) => updateTeamMember(index, 'department', value)}
                  >
                    <SelectTrigger>
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
                  <Label>Position *</Label>
                  <Input
                    value={member.position}
                    onChange={(e) => updateTeamMember(index, 'position', e.target.value)}
                    placeholder="Enter position"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base Salary *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={member.baseSalary}
                    onChange={(e) => updateTeamMember(index, 'baseSalary', parseFloat(e.target.value) || 0)}
                    placeholder="Enter base salary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Join Date</Label>
                <Input
                  type="date"
                  value={member.joinDate}
                  onChange={(e) => updateTeamMember(index, 'joinDate', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PopupForm>
  );
};
