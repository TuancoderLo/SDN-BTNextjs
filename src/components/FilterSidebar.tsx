"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { publicAPI } from "@/utils/api";
import toast from "react-hot-toast";

interface Brand {
  _id: string;
  brandName: string;
  isDeleted: boolean;
}

interface FilterSidebarProps {
  onFiltersChange?: (filters: {
    priceRange?: string[];
    brands?: string[];
    rating?: number[];
    gender?: string[];
  }) => void;
}

export default function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    rating: true,
    gender: true,
  });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [] as string[],
    brands: [] as string[],
    rating: [] as number[],
    gender: [] as string[],
  });

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await publicAPI.getBrands();
        const activeBrands = response.data.filter(
          (brand: Brand) => !brand.isDeleted
        );
        setBrands(activeBrands);
      } catch (error) {
        console.error("Error fetching brands:", error);
        toast.error("Failed to load brands");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const priceRanges = [
    { label: "Under $50", value: "0-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100 - $200", value: "100-200" },
    { label: "Over $200", value: "200+" },
  ];

  const handleFilterChange = (
    filterType: "priceRange" | "brands" | "rating" | "gender",
    value: string | number
  ) => {
    setSelectedFilters((prev) => {
      const newFilters: any = { ...prev };
      const currentArray = newFilters[filterType] as (string | number)[];
      // Special behavior: rating should be single-select ("X stars & up")
      if (filterType === "rating") {
        const num = Number(value);
        if (currentArray.includes(num)) {
          // unselect
          newFilters[filterType] = [];
        } else {
          // replace with single selection
          newFilters[filterType] = [num];
        }
      } else {
        if (currentArray.includes(value)) {
          newFilters[filterType] = currentArray.filter(
            (item) => item !== value
          );
        } else {
          newFilters[filterType] = [...currentArray, value];
        }
      }

      // Notify parent component of filter changes
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }

      return newFilters as typeof prev;
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      priceRange: [] as string[],
      brands: [] as string[],
      rating: [] as number[],
      gender: [] as string[],
    };
    setSelectedFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Price Range
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <label key={range.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.priceRange.includes(range.value)}
                  onChange={() => handleFilterChange("priceRange", range.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("brand")}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Brand
          {expandedSections.brand ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.brand && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center animate-pulse">
                    <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : (
              brands.map((brand) => (
                <label key={brand._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters.brands.includes(brand.brandName)}
                    onChange={() =>
                      handleFilterChange("brands", brand.brandName)
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {brand.brandName}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Rating
          {expandedSections.rating ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.rating.includes(rating)}
                  onChange={() => handleFilterChange("rating", rating)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {rating} stars & up
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Gender */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("gender")}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Gender
          {expandedSections.gender ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.gender && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFilters.gender.includes("male")}
                onChange={() => handleFilterChange("gender", "male")}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Men</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFilters.gender.includes("female")}
                onChange={() => handleFilterChange("gender", "female")}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Women</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFilters.gender.includes("unisex")}
                onChange={() => handleFilterChange("gender", "unisex")}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Unisex</span>
            </label>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button onClick={clearAllFilters} className="w-full btn-secondary">
        Clear All Filters
      </button>
    </div>
  );
}
