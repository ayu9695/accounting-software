import React, { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit2, Trash2, Users, Filter, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TeamMemberDialog } from "@/components/salaries/TeamMemberDialog";
import { Link } from "react-router-dom";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  department: Department;
  designation: Designation;
  baseSalary: number;
  joinDate: string;
  isActive: boolean;
}

// const initialTeamMembers: TeamMember[] = [
//   { id: "1", name: "Rajesh Kumar", email: "rajesh@company.com", department: "Technical", designation: "Senior Developer", baseSalary: 85000, joinDate: "2023-01-15", isActive: true },
//   { id: "2", name: "Priya Sharma", email: "priya@company.com", department: "Sales", designation: "Project Manager", baseSalary: 95000, joinDate: "2022-08-20", isActive: true },
//   { id: "3", name: "Amit Patel", email: "amit@company.com", department: "Technical", designation: "UI/UX Designer", baseSalary: 75000, joinDate: "2023-03-10", isActive: true },
//   { id: "4", name: "Sneha Gupta", email: "sneha@company.com", department: "Digital", designation: "Business Analyst", baseSalary: 80000, joinDate: "2022-11-05", isActive: true },
//   { id: "5", name: "Rahul Verma", email: "rahul@company.com", department: "Digital", designation: "Marketing Specialist", baseSalary: 70000, joinDate: "2023-02-18", isActive: true },
// ];

const departments = ["Sales", "Digital", "Technical"];
interface Department {
  _id: string;
  name: string;
}

interface Designation {
  _id: string;
  name: string;
}

const TeamMembers: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
                         ;
    const matchesDepartment = selectedDepartment === "all" || 'Sales' === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // const handleAddMember = (memberData: Omit<TeamMember, 'id' | 'isActive'>) => {
  //   const newMember: TeamMember = {
  //     ...memberData,
  //     id: Date.now().toString(),
  //     isActive: true
  //   };
  //   setTeamMembers([...teamMembers, newMember]);
  //   toast.success("Team member added successfully");
  // };

  // const handleUpdateMember = (memberData: Omit<TeamMember, 'id' | 'isActive'>) => {
  //   if (!editingMember) return;
    
  //   setTeamMembers(prev => prev.map(member => 
  //     member.id === editingMember.id 
  //       ? { ...member, ...memberData }
  //       : member
  //   ));
    
  //   setEditingMember(null);
  //   toast.success("Team member updated successfully");
  // };

  // const handleDeleteMember = (id: string) => {
  //   setTeamMembers(prev => prev.filter(member => member.id !== id));
  //   toast.success("Team member removed");
  // };
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      console.log("Running fetchTeamMembers API");
      try {
        const response = await fetch("http://localhost:3000/api/employees", {
          method: "GET",
          credentials: "include"
        });
        const data: TeamMember[] = await response.json();
        setTeamMembers(data);
        console.log(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchTeamMembers();
  }, []); // 👀 Empty dependency array ensures only once


  const totalSalaryBudget = filteredMembers.reduce((sum, member) => sum + member.baseSalary, 0);
  const activeMembers = filteredMembers.filter(member => member.isActive).length;

  return (
    <PageLayout title="Team Members">
      <div className="space-y-6">
        {/* Header Section with Back Navigation */}
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
          {/* <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Team Member
          </Button> */}
        </div>

        {/* Summary Cards */}
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

        {/* Filters */}
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
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                  {/* <TableHead className="text-center">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-gray-600">{member.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        hi
                      </span>
                    </TableCell>
                    <TableCell>to be populated</TableCell>
                    <TableCell className="text-right font-medium">₹{member.baseSalary.toLocaleString()}</TableCell>
                    <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    {/* <TableCell>
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
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* <TeamMemberDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingMember(null);
          }}
          editingMember={editingMember}
          onSave={editingMember ? handleUpdateMember : handleAddMember}
          departments={departments}
        /> */}
      </div>
    </PageLayout>
  );
};

export default TeamMembers;
