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
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./components/ui/button";

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

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "8px",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "white",
            },
          },
        }}
      />
      <Navbar />

      <motion.main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}>
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Google Maps Lead Extractor
          </h1>
          <p className="text-gray-600">
            Find potential clients who need website creation or redesign
            services
          </p>
        </motion.div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        <AnimatePresence>
          {leads.length > 0 && (
            <>
              <Dashboard leads={leads} />

              <motion.div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={toggleFilterNoWebsite}
                    variant={filterNoWebsite ? "default" : "outline"}
                    className={`inline-flex items-center ${
                      filterNoWebsite
                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}>
                    <Filter className="h-4 w-4 mr-2" />
                    {filterNoWebsite
                      ? "Showing No Website Only"
                      : "Show All Leads"}
                  </Button>

                  <Button
                    onClick={handleRefresh}
                    disabled={isLoading || !lastSearchParams}
                    variant="outline"
                    className="inline-flex items-center text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Results
                  </Button>
                </div>

                <ExportOptions leads={filteredLeads} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}>
                <LeadsTable
                  leads={filteredLeads}
                  onDeleteLead={handleDeleteLead}
                  onUpdateLead={handleUpdateLead}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

export default App;
