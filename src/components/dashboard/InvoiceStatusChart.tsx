
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Paid", value: 65, color: "#10B981" },
  { name: "Unpaid", value: 25, color: "#EF4444" },
  { name: "Partially Paid", value: 10, color: "#F59E0B" },
];

interface Invoice {
  _id: string;
  tenantId: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
}

interface AllInvoicesProps {
  invoices: Invoice[];
}

const getInvoiceStatusData = (invoices: Invoice[]) => {
  const statusTotals = {
    paid: 0,
    unpaid: 0,
    partial: 0,
    overdue:0
  };

  let grandTotal = 0;

  for (const inv of invoices) {
    if (inv.status === 'paid') {
      statusTotals.paid += inv.total;
    } else if (inv.status === 'unpaid') {
      statusTotals.unpaid += inv.total;
    } else if (inv.status === 'partial') {
      statusTotals.partial += inv.total;
    } else if (inv.status === 'overdue') {
      statusTotals.overdue += inv.total;
    }
    grandTotal += inv.total;
  }

  if (grandTotal === 0) return [];
  
  const rawData = [
    {
      name: 'Paid',
      amount: statusTotals.paid,
      color: '#10B981',
    },
    {
      name: 'Unpaid',
      amount: statusTotals.unpaid,
      color: '#EF4444',
    },
    {
      name: 'Partially Paid',
      amount: statusTotals.partial,
      color: '#F59E0B',
    },
    ,
    {
      name: 'Overdue',
      amount: statusTotals.overdue,
      color: '#F59E0B',
    },
  ];

  return rawData
    .filter((d) => d.amount > 0)
    .map((d) => ({
      name: d.name,
      value: Number(((d.amount / grandTotal) * 100).toFixed(2)),
      color: d.color,
    }));
};

// const InvoiceStatusChart: React.FC = () => {
//   return (
//     <Card className="col-span-1">
//       <CardHeader>
//         <CardTitle className="text-lg">Invoice Status</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-[240px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie
//                 data={data}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={60}
//                 outerRadius={80}
//                 paddingAngle={5}
//                 dataKey="value"
//                 label={({ name, percent }) => 
//                   `${name}: ${(percent * 100).toFixed(0)}%`
//                 }
//                 labelLine={false}
//               >
//                 {data.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip 
//                 formatter={(value) => [`${value}%`, "Percentage"]}
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

const InvoiceStatusChart: React.FC<AllInvoicesProps> = ({ invoices }) => {
  const chartData = getInvoiceStatusData(invoices);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Invoice Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};


export default InvoiceStatusChart;
