import React, { useState } from "react";
import { Download, FileText, Table, Copy } from "lucide-react";
import { Lead } from "../types";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface ExportOptionsProps {
  leads: Lead[];
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ leads }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    setIsExporting(true);

    try {
      // Get headers from the first lead
      const headers = Object.keys(leads[0]).filter(
        (key) => key !== "id" && key !== "potentialScore"
      );

      // Create CSV content
      const csvContent = [
        // Headers row
        headers.join(","),
        // Data rows
        ...leads.map((lead) =>
          headers
            .map((header) => {
              const value = lead[header as keyof Lead];
              // Handle special cases and ensure proper CSV formatting
              if (value === null || value === undefined) return "";
              if (typeof value === "string") {
                // Escape quotes and wrap in quotes if contains comma or quotes
                if (value.includes(",") || value.includes('"')) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              }
              return String(value);
            })
            .join(",")
        ),
      ].join("\n");

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "leads_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Leads exported successfully");
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast.error("Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
    if (leads.length === 0) {
      toast.error("No leads to copy");
      return;
    }

    try {
      // Create a formatted text representation of the leads
      const textContent = leads
        .map(
          (lead) =>
            `${lead.businessName}\n` +
            `Address: ${lead.address}\n` +
            `Phone: ${lead.phone || "N/A"}\n` +
            `Email: ${lead.email || "N/A"}\n` +
            `Website: ${lead.website || "None"}\n` +
            `Rating: ${lead.rating || "N/A"}\n` +
            `Category: ${lead.category}\n` +
            `Potential: ${lead.potentialCategory}\n` +
            "------------------------"
        )
        .join("\n\n");

      navigator.clipboard.writeText(textContent);
      toast.success("Leads copied to clipboard");
    } catch (error) {
      console.error("Error copying leads:", error);
      toast.error("Failed to copy leads to clipboard");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={leads.length === 0 || isExporting}>
            <Download className="h-4 w-4" />
            <span>Export</span>
            {isExporting && (
              <svg
                className="animate-spin ml-1 h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-1 bg-white rounded-md shadow-lg border border-gray-200">
        <DropdownMenuItem
          className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-150"
          onClick={exportToCSV}>
          <FileText className="h-4 w-4 text-gray-500" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-150"
          onClick={copyToClipboard}>
          <Copy className="h-4 w-4 text-gray-500" />
          <span>Copy to clipboard</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportOptions;
