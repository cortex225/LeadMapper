import React from "react";
import { Users, Globe, TrendingUp, AlertTriangle } from "lucide-react";
import { Lead } from "../types";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      hoverColor: "hover:bg-blue-600",
      shadowColor: "shadow-blue-200",
    },
    {
      name: "Without Website",
      value: leadsWithoutWebsite,
      icon: Globe,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      shadowColor: "shadow-purple-200",
    },
    {
      name: "Potential Clients",
      value: potentialClients,
      icon: TrendingUp,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      shadowColor: "shadow-green-200",
    },
    {
      name: "High Priority",
      value: highPriorityLeads,
      icon: AlertTriangle,
      color: "bg-amber-500",
      hoverColor: "hover:bg-amber-600",
      shadowColor: "shadow-amber-200",
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
  };

  return (
    <motion.div
      className="mb-8"
      initial="hidden"
      animate="show"
      variants={container}>
      <motion.h2
        className="text-2xl font-bold text-gray-800 mb-4"
        variants={item}>
        Dashboard
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            variants={item}
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.2 },
            }}>
            <Card
              className={`overflow-hidden border-none ${stat.shadowColor} shadow-lg transition-all duration-200`}>
              <CardHeader className={`${stat.color} text-white p-4`}>
                <CardTitle className="text-lg font-medium">
                  {stat.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                  <div className={`rounded-full p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;
