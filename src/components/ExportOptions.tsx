import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { Lead } from '../types';

interface ExportOptionsProps {
  leads: Lead[];
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ leads }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportToCSV = () => {
    if (leads.length === 0) return;

    // Get all possible headers from the leads
    const headers = ['Business Name', 'Category', 'Address', 'Phone', 'Email', 'Website', 'Rating', 'Has Website', 'Notes', 'Date Added'];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    leads.forEach(lead => {
      const row = [
        `"${lead.businessName.replace(/"/g, '""')}"`,
        `"${lead.category.replace(/"/g, '""')}"`,
        `"${lead.address.replace(/"/g, '""')}"`,
        `"${lead.phone?.replace(/"/g, '""') || ''}"`,
        `"${lead.email?.replace(/"/g, '""') || ''}"`,
        `"${lead.website?.replace(/"/g, '""') || ''}"`,
        lead.rating || '',
        lead.hasWebsite ? 'Yes' : 'No',
        `"${lead.notes?.replace(/"/g, '""') || ''}"`,
        lead.dateAdded
      ];
      csvContent += row.join(',') + '\n';
    });
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsOpen(false);
  };

  const exportToJSON = () => {
    if (leads.length === 0) return;
    
    const jsonString = JSON.stringify(leads, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={exportToCSV}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <Table className="h-4 w-4 mr-2" />
              Export as CSV
            </button>
            <button
              onClick={exportToJSON}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportOptions;