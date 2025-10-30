import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Discover Your Signature Scent
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-600 animate-fade-in">
            Explore our curated collection of premium perfumes from the world's
            most renowned brands
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up">
            <Button asChild size="lg">
              <Link href="/perfumes">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/brands">View Brands</Link>
            </Button>
          </div>

          {/* Featured Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-slate-500">Premium Perfumes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-slate-500">Luxury Brands</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                <span className="text-3xl font-bold ml-2">4.9</span>
              </div>
              <div className="text-slate-500">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-slate-300 opacity-20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-slate-300 opacity-20 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-slate-300 opacity-20 rounded-full"></div>
      </div>
    </section>
  );
}
