import React, { useState } from "react";
import { Search, MapPin, Sliders, Locate, ChevronDown } from "lucide-react";
import { SearchParams } from "../types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "barber shop",
    location: "",
    radius: 5,
  });

  const [isGeolocating, setIsGeolocating] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: name === "radius" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [name]: name === "radius" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert(
        "La géolocalisation n'est pas prise en charge par votre navigateur"
      );
      return;
    }

    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          // Utiliser directement les coordonnées géographiques
          const { latitude, longitude } = position.coords;

          // Format: "latitude,longitude"
          const locationString = `${latitude.toFixed(6)},${longitude.toFixed(
            6
          )}`;

          setSearchParams((prev) => ({
            ...prev,
            location: locationString,
          }));

          setIsGeolocating(false);
        } catch (error) {
          console.error("Erreur de géolocalisation:", error);
          alert(
            "Impossible d'obtenir votre position actuelle. Veuillez entrer manuellement votre localisation."
          );
          setIsGeolocating(false);
        }
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        setIsGeolocating(false);

        let errorMessage = "Impossible d'obtenir votre position actuelle.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Vous avez refusé l'accès à votre position. Veuillez modifier les paramètres de votre navigateur.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Les informations de localisation ne sont pas disponibles.";
            break;
          case error.TIMEOUT:
            errorMessage = "La demande de localisation a expiré.";
            break;
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const advancedFiltersVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="mb-8">
      <Card className="overflow-hidden border-none shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div variants={itemVariants}>
                <div className="space-y-2">
                  <Label
                    htmlFor="query"
                    className="text-sm font-medium text-gray-700">
                    Business Type
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="query"
                      name="query"
                      value={searchParams.query}
                      onChange={handleChange}
                      className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. barber shop, restaurant"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <div className="relative flex">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="location"
                      name="location"
                      value={searchParams.location}
                      onChange={handleChange}
                      className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-r-none"
                      placeholder="City or coordinates"
                    />
                    <Button
                      type="button"
                      onClick={handleGeolocation}
                      disabled={isGeolocating}
                      className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      title="Utiliser ma position actuelle">
                      {isGeolocating ? (
                        <svg
                          className="animate-spin h-5 w-5 text-center text-gray-500"
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
                      ) : (
                        <Locate className="h-5 w-5 text-center text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="space-y-2">
                  <Label
                    htmlFor="radius"
                    className="text-sm font-medium text-gray-700">
                    Search Radius (km)
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Sliders className="h-5 w-5 text-gray-400" />
                    </div>
                    <Select
                      value={searchParams.radius.toString()}
                      onValueChange={(value) =>
                        handleSelectChange("radius", value)
                      }>
                      <SelectTrigger className="pl-10 w-full">
                        <SelectValue placeholder="Select radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 km</SelectItem>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="20">20 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="mt-6 flex items-center justify-between"
              variants={itemVariants}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center text-gray-700"
                    onClick={() =>
                      setShowAdvancedFilters(!showAdvancedFilters)
                    }>
                    <Sliders className="h-4 w-4 mr-2" />
                    Filtres avancés
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">
                        Filtres avancés
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Configurez des options de recherche supplémentaires
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="minRating">Note minimale</Label>
                        <Input id="minRating" placeholder="ex: 4.0" />
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="maxResults">Résultats max</Label>
                        <Input id="maxResults" placeholder="ex: 50" />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  disabled={
                    isLoading || !searchParams.location || !searchParams.query
                  }
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200">
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Recherche en cours...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Search className="h-5 w-5 mr-2" />
                      Extraire les leads
                    </div>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SearchForm;
