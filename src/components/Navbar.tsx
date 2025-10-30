"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, User, Menu, X, LogOut, Sparkles, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { publicAPI } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { backendUser, loading, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{
      _id: string;
      perfumeName: string;
      brand?: { brandName?: string } | string;
      price?: number;
      uri?: string;
    }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchWrapRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const submitSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsMenuOpen(false);
    router.push(`/perfumes?search=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
  };

  // Debounced search suggestions
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSearchLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await publicAPI.getPerfumes({ q });
        const items: any[] = Array.isArray(res.data) ? res.data : [];
        setSuggestions(items.slice(0, 8));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  // Close dropdown on outside click or ESC
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSuggestions(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <nav className="bg-background/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PerfumeStore
              </span>
              <span className="text-xs text-gray-500 -mt-1">
                Premium Fragrances
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/perfumes">Perfumes</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/brands">Brands</Link>
            </Button>
            {backendUser?.isAdmin && (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/about">About</Link>
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <form
              onSubmit={submitSearch}
              className="relative group"
              ref={searchWrapRef}
            >
              <Input
                type="text"
                placeholder="Search perfumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                className="w-72 px-4 py-2.5 pl-11 pr-10"
              />
              <button
                type="submit"
                className="absolute left-3.5 top-3 text-muted-foreground group-focus-within:text-primary"
              >
                <Search className="h-4 w-4" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                    // Only navigate to /perfumes if we're already on a perfumes route
                    if (pathname && pathname.startsWith("/perfumes")) {
                      router.push("/perfumes");
                    }
                  }}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showSuggestions && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {searchLoading && (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      Searching...
                    </div>
                  )}
                  {!searchLoading && suggestions.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No results
                    </div>
                  )}
                  {!searchLoading && suggestions.length > 0 && (
                    <ul className="max-h-80 overflow-auto">
                      {suggestions.map((p) => (
                        <li key={p._id}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSuggestions(false);
                              setIsMenuOpen(false);
                              router.push(`/perfumes/${p._id}`);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 border">
                              {/* optional image */}
                              {p.uri ? (
                                <img
                                  src={p.uri}
                                  alt={p.perfumeName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {p.perfumeName}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {typeof p.brand === "string"
                                  ? p.brand
                                  : p.brand?.brandName || ""}
                              </div>
                            </div>
                            {typeof p.price === "number" && (
                              <div className="ml-auto text-sm font-medium text-green-600">
                                ${p.price}
                              </div>
                            )}
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          type="submit"
                          className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </form>

            {/* Cart removed */}
          </div>

          {/* User Authentication */}
          {loading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-blue-200">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">
                    {backendUser?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {backendUser?.isAdmin ? "Admin" : "Welcome back!"}
                  </p>
                </div>
              </div>
              {backendUser?.isAdmin && (
                <Link
                  href="/dashboard"
                  className="p-2.5 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                  title="Admin Dashboard"
                >
                  <Shield className="h-5 w-5" />
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t bg-background/95 backdrop-blur-md">
            <div className="flex flex-col space-y-2">
              {/* Regular Navigation */}
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    Home
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/perfumes" onClick={() => setIsMenuOpen(false)}>
                    Perfumes
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/brands" onClick={() => setIsMenuOpen(false)}>
                    Brands
                  </Link>
                </Button>
                {backendUser?.isAdmin && (
                  <Button variant="ghost" asChild className="justify-start">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/about" onClick={() => setIsMenuOpen(false)}>
                    About
                  </Link>
                </Button>
              </>

              {/* Admin Navigation */}
              {backendUser?.isAdmin && (
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Shield className="h-5 w-5 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}

              <div className="pt-4 border-t border-gray-200">
                {/* Search and Cart */}
                <>
                  <form onSubmit={submitSearch} className="relative mb-4">
                    <Input
                      type="text"
                      placeholder="Search perfumes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-11"
                    />
                    <button
                      type="submit"
                      className="absolute left-3.5 top-3.5 text-muted-foreground"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSuggestions([]);
                          setShowSuggestions(false);
                          // Only navigate to /perfumes if we're already on a perfumes route
                          if (pathname && pathname.startsWith("/perfumes")) {
                            router.push("/perfumes");
                          }
                          setIsMenuOpen(false);
                        }}
                        aria-label="Clear search"
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </form>

                  {/* Cart removed */}
                </>

                {/* User Authentication */}
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {backendUser?.name || "User"}
                        </span>
                        <p className="text-xs text-gray-500">
                          {backendUser?.isAdmin ? "Admin" : "Welcome back!"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="ghost" asChild>
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link
                        href="/register"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
