import React from "react";
import { MapPin, Globe, Menu, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  return (
    <motion.nav
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}>
            <div className="flex-shrink-0 flex items-center">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}>
                <Globe className="h-8 w-8 mr-2" />
              </motion.div>
              <span className="font-bold text-xl tracking-tight">
                LeadMapper
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <motion.a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-700 hover:bg-indigo-800 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  Dashboard
                </motion.a>
                <motion.a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  Leads
                </motion.a>
              </div>
            </div>
          </motion.div>
          <div className="hidden md:block">
            <motion.div
              className="ml-4 flex items-center md:ml-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Button className="bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700 transition-colors duration-200">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Start Mapping</span>
                  <motion.div
                    className="ml-1"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}>
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-indigo-500">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuItem className="cursor-pointer">
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Leads
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Start Mapping</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
