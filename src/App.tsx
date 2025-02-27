import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Navbar from "./components/Navbar";
import SearchForm from "./components/SearchForm";
import LeadsTable from "./components/LeadsTable";
import Dashboard from "./components/Dashboard";
import ExportOptions from "./components/ExportOptions";
import { Lead, SearchParams } from "./types";
import { searchBusinesses } from "./services/googleMapsApi";
import { Download, Filter, RefreshCw } from "lucide-react";

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterNoWebsite, setFilterNoWebsite] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(
    null
  );

  useEffect(() => {
    // Apply filters whenever leads or filter settings change
    if (filterNoWebsite) {
      setFilteredLeads(leads.filter((lead) => !lead.hasWebsite));
    } else {
      setFilteredLeads(leads);
    }
  }, [leads, filterNoWebsite]);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setLastSearchParams(params);

    try {
      const results = await searchBusinesses(params);
      setLeads(results);
      toast.success(`Found ${results.length} potential leads!`);
    } catch (error) {
      console.error("Error searching for businesses:", error);
      toast.error("Failed to search for businesses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!lastSearchParams) {
      toast.error("No previous search to refresh. Please search first.");
      return;
    }

    await handleSearch(lastSearchParams);
  };

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter((lead) => lead.id !== id));
    toast.success("Lead deleted successfully");
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(
      leads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
    toast.success("Lead updated successfully");
  };

  const toggleFilterNoWebsite = () => {
    setFilterNoWebsite(!filterNoWebsite);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Google Maps Lead Extractor
          </h1>
          <p className="text-gray-600">
            Find potential clients who need website creation or redesign
            services
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {leads.length > 0 && (
          <>
            <Dashboard leads={leads} />

            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={toggleFilterNoWebsite}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    filterNoWebsite
                      ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Filter className="h-4 w-4 mr-2" />
                  {filterNoWebsite
                    ? "Showing No Website Only"
                    : "Show All Leads"}
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={isLoading || !lastSearchParams}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Results
                </button>
              </div>

              <ExportOptions leads={filteredLeads} />
            </div>

            <LeadsTable
              leads={filteredLeads}
              onDeleteLead={handleDeleteLead}
              onUpdateLead={handleUpdateLead}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
