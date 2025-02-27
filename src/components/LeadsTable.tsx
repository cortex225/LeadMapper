import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  ExternalLink,
  Check,
  X,
  Mail,
  Phone,
  Star,
  Filter,
} from "lucide-react";
import { Lead } from "../types";
import { Badge } from "./ui/badge";

interface LeadsTableProps {
  leads: Lead[];
  onDeleteLead: (id: string) => void;
  onUpdateLead: (lead: Lead) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onDeleteLead,
  onUpdateLead,
}) => {
  const [sortField, setSortField] = useState<keyof Lead>("businessName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Lead | null>(null);

  // Filtres avancés
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    potentialCategory: "",
    hasWebsite: "",
    hasEmail: "",
    hasPhone: "",
    minRating: "",
  });

  const handleSort = (field: keyof Lead) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const resetFilters = () => {
    setFilters({
      potentialCategory: "",
      hasWebsite: "",
      hasEmail: "",
      hasPhone: "",
      minRating: "",
    });
  };

  // Appliquer les filtres aux leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Filtre par catégorie de potentiel
      if (
        filters.potentialCategory &&
        lead.potentialCategory !== filters.potentialCategory
      ) {
        return false;
      }

      // Filtre par présence de site web
      if (filters.hasWebsite) {
        const hasWebsiteValue = filters.hasWebsite === "true";
        if (lead.hasWebsite !== hasWebsiteValue) {
          return false;
        }
      }

      // Filtre par présence d'email
      if (filters.hasEmail) {
        const hasEmailValue = filters.hasEmail === "true";
        if (!!lead.email !== hasEmailValue) {
          return false;
        }
      }

      // Filtre par présence de téléphone
      if (filters.hasPhone) {
        const hasPhoneValue = filters.hasPhone === "true";
        if (!!lead.phone !== hasPhoneValue) {
          return false;
        }
      }

      // Filtre par note minimale
      if (filters.minRating && lead.rating) {
        if (lead.rating < parseFloat(filters.minRating)) {
          return false;
        }
      }

      return true;
    });
  }, [leads, filters]);

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a[sortField] === undefined || b[sortField] === undefined) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return sortDirection === "asc"
        ? aValue === bValue
          ? 0
          : aValue
          ? -1
          : 1
        : aValue === bValue
        ? 0
        : aValue
        ? 1
        : -1;
    }

    return 0;
  });

  const handleEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setEditFormData({ ...lead });
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!editFormData) return;

    const { name, value, type } = e.target as HTMLInputElement;

    setEditFormData({
      ...editFormData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "rating"
          ? parseFloat(value)
          : value,
    });
  };

  const handleEditSubmit = () => {
    if (editFormData) {
      onUpdateLead(editFormData);
      setEditingId(null);
      setEditFormData(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  const SortIcon = ({ field }: { field: keyof Lead }) => {
    if (sortField !== field)
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-indigo-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-indigo-600" />
    );
  };

  // Fonction pour obtenir le libellé de la catégorie de potentiel
  const getPotentialLabel = (category?: "low" | "medium" | "high") => {
    switch (category) {
      case "high":
        return "Élevé";
      case "medium":
        return "Moyen";
      case "low":
        return "Faible";
      default:
        return "Non défini";
    }
  };

  if (leads.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">
          Aucun lead trouvé. Essayez de rechercher des entreprises.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Bouton pour afficher/masquer les filtres */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          <span className="font-medium">{filteredLeads.length}</span> leads
          trouvés sur {leads.length}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-900">
          <Filter className="h-4 w-4 mr-1" />
          {showFilters ? "Masquer les filtres" : "Filtres avancés"}
        </button>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Potentiel
            </label>
            <select
              name="potentialCategory"
              value={filters.potentialCategory}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md">
              <option value="">Tous</option>
              <option value="high">Élevé</option>
              <option value="medium">Moyen</option>
              <option value="low">Faible</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Site Web
            </label>
            <select
              name="hasWebsite"
              value={filters.hasWebsite}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md">
              <option value="">Tous</option>
              <option value="true">Avec site web</option>
              <option value="false">Sans site web</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <select
              name="hasEmail"
              value={filters.hasEmail}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md">
              <option value="">Tous</option>
              <option value="true">Avec email</option>
              <option value="false">Sans email</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <select
              name="hasPhone"
              value={filters.hasPhone}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md">
              <option value="">Tous</option>
              <option value="true">Avec téléphone</option>
              <option value="false">Sans téléphone</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Note minimale
            </label>
            <input
              type="number"
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              min="0"
              max="5"
              step="0.5"
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div className="md:col-span-5 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md">
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("businessName")}>
                <div className="flex items-center">
                  Entreprise
                  <SortIcon field="businessName" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("category")}>
                <div className="flex items-center">
                  Catégorie
                  <SortIcon field="category" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("hasWebsite")}>
                <div className="flex items-center">
                  Site Web
                  <SortIcon field="hasWebsite" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("potentialCategory")}>
                <div className="flex items-center justify-center">
                  Potentiel
                  <SortIcon field="potentialCategory" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("rating")}>
                <div className="flex items-center">
                  Évaluation
                  <SortIcon field="rating" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                {editingId === lead.id ? (
                  // Edit mode
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        name="businessName"
                        value={editFormData?.businessName || ""}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        name="category"
                        value={editFormData?.category || ""}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        name="hasWebsite"
                        checked={editFormData?.hasWebsite || false}
                        onChange={handleEditChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      {editFormData?.hasWebsite && (
                        <input
                          type="text"
                          name="website"
                          value={editFormData?.website || ""}
                          onChange={handleEditChange}
                          placeholder="URL du site"
                          className="w-full mt-1 p-1 border rounded text-xs"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        name="potentialCategory"
                        value={editFormData?.potentialCategory || ""}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded">
                        <option value="">Non défini</option>
                        <option value="low">Faible</option>
                        <option value="medium">Moyen</option>
                        <option value="high">Élevé</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        name="rating"
                        value={editFormData?.rating || 0}
                        onChange={handleEditChange}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="phone"
                          value={editFormData?.phone || ""}
                          onChange={handleEditChange}
                          placeholder="Téléphone"
                          className="w-full p-1 border rounded"
                        />
                        <input
                          type="text"
                          name="email"
                          value={editFormData?.email || ""}
                          onChange={handleEditChange}
                          placeholder="Email"
                          className="w-full p-1 border rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={handleEditSubmit}
                        className="text-green-600 hover:text-green-900 mr-3">
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-900">
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.businessName}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {lead.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {lead.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {lead.hasWebsite ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-center">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full  font-medium bg-red-100 text-red-600">
                            x
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center">
                        <Badge
                          variant={lead.potentialCategory || "outline"}
                          className="border-2">
                          {getPotentialLabel(lead.potentialCategory)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.rating ? (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-1">
                            {lead.rating}
                          </span>
                          <Star className="h-4 w-4 text-yellow-400" />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {lead.phone && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="truncate max-w-[150px]">
                              {lead.phone}
                            </span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="truncate max-w-[150px]">
                              {lead.email}
                            </span>
                          </div>
                        )}
                        {!lead.phone && !lead.email && (
                          <span className="text-sm text-gray-500">
                            Aucun contact
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Modifier">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          <span className="font-medium">{filteredLeads.length}</span> leads
          affichés sur {leads.length} au total
        </div>
      </div>
    </div>
  );
};

export default LeadsTable;
