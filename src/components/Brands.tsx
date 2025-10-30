"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Package, Star } from "lucide-react";
import { publicAPI } from "@/utils/api";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Brand {
  _id: string;
  brandName: string;
  overview: string;
  productCount: number;
  hasProducts: boolean;
  isDeleted: boolean;
  deletedAt?: string;
}

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setError(null);
        const response = await publicAPI.getOverview();
        // Get brands with products from overview data
        const brandsWithProducts = response.data.brandsWithProducts || [];
        // Filter out deleted brands and show only first 6 brands
        const activeBrands = brandsWithProducts.filter(
          (brand: Brand) => !brand.isDeleted
        );
        setBrands(activeBrands.slice(0, 6));
      } catch (error: any) {
        // Error is already logged by API interceptor
        setError(error.message || "Failed to load brands");
        toast.error("Failed to load brands from backend");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);
  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Premium Brands
            </h2>
            <p className="text-muted-foreground">
              Discover fragrances from the world's most prestigious brands
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-24 h-16 mx-auto mb-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Premium Brands
            </h2>
            <p className="text-muted-foreground">
              Discover fragrances from the world's most prestigious brands
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Unable to load brands
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Our Premium Brands
          </h2>
          <p className="text-muted-foreground">
            Discover fragrances from the world's most prestigious brands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand.brandName
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="group"
            >
              <Card className="hover:shadow-lg transition-shadow group-hover:scale-105 transform transition-transform h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      {brand.brandName}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="h-4 w-4 mr-1" />
                      {brand.productCount} products
                    </div>
                  </div>

                  {brand.overview && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {brand.overview}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-muted-foreground">
                        {brand.hasProducts ? "Active Brand" : "No Products"}
                      </span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        brand.hasProducts
                          ? "bg-green-100 text-green-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {brand.hasProducts ? "Active" : "Inactive"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" asChild>
            <Link href="/brands">View All Brands</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
