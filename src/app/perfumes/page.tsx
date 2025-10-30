"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import PerfumeGrid from "@/components/PerfumeGrid";
import FilterSidebar from "@/components/FilterSidebar";

export default function PerfumesPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    priceRange: [] as string[],
    brands: [] as string[],
    rating: [] as number[],
    gender: [] as string[],
  });
  const [sidebarResetKey, setSidebarResetKey] = useState(0);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const handleFiltersChange = (newFilters: {
    priceRange?: string[];
    brands?: string[];
    rating?: number[];
    gender?: string[];
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearSearchAndFilters = () => {
    setSearchQuery("");
    const cleared = {
      priceRange: [] as string[],
      brands: [] as string[],
      rating: [] as number[],
      gender: [] as string[],
    };
    setFilters(cleared);
    // signal sidebar to clear its internal state
    setSidebarResetKey((k) => k + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Perfumes</h1>
        <p className="text-gray-600">
          Discover our complete collection of premium fragrances
        </p>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search perfumes, brands, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearchAndFilters}
                aria-label="Clear search and filters"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <FilterSidebar
            onFiltersChange={handleFiltersChange}
            resetKey={sidebarResetKey}
          />
        </div>
        <div className="lg:w-3/4">
          <PerfumeGrid searchQuery={searchQuery} filters={filters} />
        </div>
      </div>
    </div>
  );
}
