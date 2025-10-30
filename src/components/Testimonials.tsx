import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York, USA",
    rating: 5,
    comment:
      "The quality of perfumes here is exceptional. I've been a customer for over 2 years and never disappointed.",
    avatar: "/api/placeholder/60/60",
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "London, UK",
    rating: 5,
    comment:
      "Amazing collection and fast shipping. The customer service is outstanding!",
    avatar: "/api/placeholder/60/60",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    location: "Madrid, Spain",
    rating: 5,
    comment:
      "I found my signature scent here. The staff was very helpful in choosing the perfect fragrance.",
    avatar: "/api/placeholder/60/60",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">
            Read reviews from our satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <CardContent className="p-6">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-muted" />

                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full mr-4 flex items-center justify-center">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-muted-foreground italic">
                  "{testimonial.comment}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
