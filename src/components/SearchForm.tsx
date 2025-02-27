import React, { useState } from "react";
import { Search, MapPin, Sliders, Locate } from "lucide-react";
import { SearchParams } from "../types";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    location: "",
    radius: 5,
  });
  const [isGeolocating, setIsGeolocating] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: name === "radius" ? parseInt(value) : value,
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Find Potential Clients
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              htmlFor="query"
              className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="query"
                name="query"
                value={searchParams.query}
                onChange={handleChange}
                placeholder="restaurants, hotels, shops..."
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                name="location"
                value={searchParams.location}
                onChange={handleChange}
                placeholder="City, neighborhood, area..."
                className="pl-10 block w-full rounded-l-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2"
                required
              />
              <button
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
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="radius"
              className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius (km)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Sliders className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="radius"
                name="radius"
                value={searchParams.radius}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2">
                <option value={1}>1 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}>
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Searching...
              </>
            ) : (
              <>Extract Leads</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
