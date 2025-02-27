import React from 'react';
import { MapPin, Globe, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Globe className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">LeadMapper</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-700">Dashboard</a>
                <a href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">Leads</a>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Start Mapping
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;