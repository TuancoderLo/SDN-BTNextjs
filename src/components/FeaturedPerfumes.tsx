"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Star, AlertCircle } from "lucide-react";
import { publicAPI, calculateAverageRating } from "@/utils/api";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Perfume {
  _id: string;
  name: string;
  brand: string;
  price: number;
  uri: string;
  description: string;
  targetAudience: string;
  volume: string;
  concentration: string;
  ingredients: string[];
  comments: Array<{
    rating: number;
    content: string;
    author: { name: string };
  }>;
}

export default function FeaturedPerfumes() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<
    Record<string, { avg: number; count: number }>
  >({});

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        setError(null);
        console.log("Fetching perfumes...");
        const response = await publicAPI.getPerfumes();
        console.log("Perfumes response:", response.data);

        // Transform the data to match our interface
        const transformedPerfumes = response.data.map((perfume: any) => ({
          _id: perfume._id,
          name: perfume.perfumeName,
          brand: perfume.brand?.brandName || "Unknown Brand",
          price: perfume.price,
          uri: perfume.uri,
          description: perfume.description,
          targetAudience: perfume.targetAudience,
          volume: perfume.volume,
          concentration: perfume.concentration,
          ingredients: perfume.ingredients,
          comments: perfume.comments || [],
        }));

        console.log("Transformed perfumes:", transformedPerfumes);

        // Take only first 4 for featured section
        setPerfumes(transformedPerfumes.slice(0, 4));
      } catch (error: any) {
        console.error("Error fetching perfumes:", error);
        // Error is already logged by API interceptor
        setError(error.message || "Failed to load perfumes");
        toast.error("Failed to load perfumes from backend");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfumes();
  }, []);

  // Fetch approved comment stats per perfume to keep in sync with detail page
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const stats: Record<string, { avg: number; count: number }> = {};
        await Promise.all(
          perfumes.map(async (p) => {
            try {
              const r = await publicAPI.getPerfumeComments(p._id);
              const list = r.data || [];
              stats[p._id] = {
                avg: calculateAverageRating(list),
                count: list.length,
              };
            } catch {
              stats[p._id] = { avg: 0, count: 0 };
            }
          })
        );
        setRatings(stats);
      } catch {}
    };
    if (perfumes.length) fetchRatings();
  }, [perfumes]);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Featured Perfumes
            </h2>
            <p className="text-muted-foreground">
              Discover our most popular fragrances
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="bg-muted h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
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
              Featured Perfumes
            </h2>
            <p className="text-muted-foreground">
              Discover our most popular fragrances
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Unable to load perfumes
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
            Featured Perfumes
          </h2>
          <p className="text-muted-foreground">
            Discover our most popular fragrances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {perfumes.map((perfume) => {
            const stat = ratings[perfume._id] || { avg: 0, count: 0 };
            const avgRating = stat.avg;

            return (
              <Link
                key={perfume._id}
                href={`/perfumes/${perfume._id}`}
                className="group block"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <img
                        src={perfume.uri || "/api/placeholder/300/400"}
                        alt={perfume.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button className="absolute top-2 right-2 p-2 bg-background rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="mb-2">
                      <h3 className="font-semibold text-foreground">
                        {perfume.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {perfume.brand}
                      </p>
                    </div>

                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(avgRating)
                                ? "text-yellow-400 fill-current"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({avgRating.toFixed(1)}) {stat.count} reviews
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {perfume.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ${perfume.price}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" asChild>
            <Link href="/perfumes">View All Perfumes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
