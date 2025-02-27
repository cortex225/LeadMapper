import React from "react";
import { Users, Globe, TrendingUp, AlertTriangle } from "lucide-react";
import { Lead } from "../types";

interface DashboardProps {
  leads: Lead[];
}

const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const leadsWithoutWebsite = leads.filter((lead) => !lead.hasWebsite).length;
  const potentialClients = Math.round(leadsWithoutWebsite * 0.7); // Estimation
  const highPriorityLeads = leads.filter(
    (lead) => !lead.hasWebsite && (lead.rating || 0) >= 4
  ).length;

  const stats = [
    {
      name: "Total Leads",
      value: totalLeads,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Without Website",
      value: leadsWithoutWebsite,
      icon: Globe,
      color: "bg-purple-500",
    },
    {
      name: "Potential Clients",
      value: potentialClients,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      name: "High Priority",
      value: highPriorityLeads,
      icon: AlertTriangle,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm font-medium">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
            <div className={`h-1 ${stat.color}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
