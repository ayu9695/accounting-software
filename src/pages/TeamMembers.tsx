// ✅ REWRITTEN COMPONENT: Dynamic fetch of departments, designations, and employees

import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Filter, ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { TeamMemberDialog } from "@/components/salaries/TeamMemberDialog";
import { toast } from "@/components/ui/use-toast";

interface Department {
  _id: string;
  name: string;
}

interface Designation {
  _id: string;
  name: string;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  baseSalary: number;
  joinDate: string;
  isActive: boolean;
}

const TeamMembers: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes, desigRes] = await Promise.all([
          fetch("https://accounting-app-production.up.railway.app/api/employees", { credentials: "include" }),
          fetch("https://accounting-app-production.up.railway.app/api/departments", { credentials: "include" }),
          fetch("https://accounting-app-production.up.railway.app/api/designations", { credentials: "include" }),
        ]);

        const [empData, deptData, desigData] = await Promise.all([
          empRes.json(),
          deptRes.json(),
          desigRes.json()
        ]);

        setTeamMembers(empData);
        setDepartments(deptData);
        setDesignations(desigData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const departmentMap = useMemo(() => {
  const map = new Map<string, string>();
  departments.forEach(d => map.set(d._id, d.name));
  return map;
}, [departments]);

const designationMap = useMemo(() => {
  const map = new Map<string, string>();
  designations.forEach(d => map.set(d._id, d.name));
  return map;
}, [designations]);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || member.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const totalSalaryBudget = filteredMembers.reduce((sum, member) => sum + member.baseSalary, 0);
  const activeMembers = filteredMembers.filter(member => member.isActive).length;

const handleAddMember = async (newMember: any) => {
  try {
    const response = await fetch('https://accounting-app-production.up.railway.app/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newMember)
    });
    console.log("new memeber added: ", newMember);

    if (!response.ok) throw new Error('Failed to create user');
    const created = await response.json();

    // Add to local state (optional for instant UI feedback)
    setTeamMembers(prev => [...prev, created]);

    toast({ title: 'Success', description: "Team member added successfully"});
  } catch (err) {
    console.error(err);
    toast({ title: 'Error', description: "Error creating user", variant: 'destructive' });
  }
};

const handleDeleteMember = async (id: string) => {
  try {
    const response = await fetch(`https://accounting-app-production.up.railway.app/api/employees`, {
      method: 'DELETE',
      credentials: 'include',
      body: JSON.stringify(id)
    });
    if (!response.ok) throw new Error('Delete failed');

    setTeamMembers(prev => prev.filter(member => member._id !== id));
    toast({ title: "Deleted", description: "Team member removed successfully" });
  } catch (err) {
    console.error(err);
    toast({ title: "Error", description: "Error deleting user", variant: "destructive" });
  }
};

  const handleUpdateMember = async (updatedMember: any) => {
    // Replace this with actual API PATCH call in future
    console.log("Updating member:", updatedMember);
    try {
    const response = await fetch(`https://accounting-app-production.up.railway.app/api/employees`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: editingMember?._id, // ✅ include ID inside body
        ...updatedMember
      })
    });

    if (!response.ok) throw new Error('Failed to update user');
    const updated = await response.json();

    setTeamMembers(prev =>
      prev.map(member => (member._id === updated._id ? updated : member))
    );

    toast({ title: 'Success', description: "Team member updated successfully" });
  } catch (err) {
    console.error(err);
    toast({ title: 'Error', description: "Error updating user", variant: 'destructive' });
  }
  };

  return (
    <PageLayout title="Team Members">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/salaries">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Salaries
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
              <p className="text-gray-600">Manage your team members and their information</p>
            </div>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{activeMembers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Salary Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">₹{totalSalaryBudget.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{departments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by department" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Base Salary</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-gray-600">{member.email}</TableCell>
                    <TableCell>{departmentMap.get(member.department) || "-"}</TableCell>
                    <TableCell>{designationMap.get(member.designation) || "-"}</TableCell>
                    <TableCell className="text-right font-medium">₹{member.baseSalary.toLocaleString()}</TableCell>
                    <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingMember(member);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member._id)}
                          className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <TeamMemberDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingMember(null);
          }}
          editingMember={editingMember}
          onSave={editingMember ? handleUpdateMember : handleAddMember}
          departments={departments}
          designations={designations}
        />
      </div>
    </PageLayout>
  );
};

export default TeamMembers;
