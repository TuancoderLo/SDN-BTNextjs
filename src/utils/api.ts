import axios from "axios";
import { logger } from "./console";

// API Base URL - Update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Helper function to check if error is backend connection related
const isBackendConnectionError = (error: any) => {
  return (
    !error.response &&
    (error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_CONNECTION_REFUSED" ||
      error.message?.includes("Backend server is not running") ||
      error.message?.includes("Network Error"))
  );
};

// Create axios instance with better configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request logging in development (only for successful requests)
if (isDevelopment) {
  api.interceptors.request.use(
    (config) => {
      // Only log successful requests, not errors
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    console.log("Request data details:", JSON.stringify(config.data, null, 2));

    // Only attach token for protected routes (not public endpoints)
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/google");
    // Only treat comments as public for GET (fetch). Mutations must include auth.
    const isPublicRoute =
      url.includes("/api/public") ||
      (method === "get" && url.includes("/api/comments/perfume/"));
    if (!isAuthRoute && !isPublicRoute) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error("API Error Details:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers,
    });
    console.error(
      "Error response data:",
      JSON.stringify(error.response?.data, null, 2)
    );

    // Only log errors that are not backend connection issues
    if (!error._logged && !isBackendConnectionError(error)) {
      logger.error("API Error:", error.message);
      error._logged = true;
    }

    if (error.response?.status === 401) {
      // Do not auto-logout globally; let pages handle gracefully
      // This prevents losing session on public pages when a request fails
    }

    // Handle network errors
    if (!error.response) {
      if (isBackendConnectionError(error)) {
        error.message =
          "Backend server is not running. Please start your backend server.";
      } else {
        error.message =
          "Network error. Please check your connection and try again.";
      }
    }

    // Handle specific error codes
    switch (error.response?.status) {
      case 404:
        error.message = "The requested resource was not found.";
        break;
      case 500:
        error.message = "Server error. Please try again later.";
        break;
      case 403:
        error.message = "You do not have permission to perform this action.";
        break;
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    YOB: number;
    gender: boolean;
  }) => api.post("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),

  googleAuth: (data: {
    idToken?: string;
    email?: string;
    name?: string;
    photoURL?: string;
  }) => api.post("/api/auth/google", data),

  updateProfile: (data: {
    name: string;
    YOB: number;
    gender: boolean;
    photoURL?: string;
  }) => api.put("/api/members/me", data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.put("/api/members/me/password", data),
};

// Public API (no auth required)
export const publicAPI = {
  getPerfumes: (params?: { q?: string; brand?: string }) =>
    api.get("/api/public/perfumes", { params }),

  getPerfumeById: (id: string) => api.get(`/api/public/perfumes/${id}`),

  getBrands: () => api.get("/api/public/brands"),

  getOverview: () => api.get("/api/public/overview"),

  // Comments (public fetch)
  getPerfumeComments: (perfumeId: string) =>
    api.get(`/api/comments/perfume/${perfumeId}`),
};

// Protected API (requires auth)
export const protectedAPI = {
  // Perfumes
  getAllPerfumes: (params?: { q?: string; brand?: string }) =>
    api.get("/api/perfumes", { params }),

  getPerfumeById: (id: string) => api.get(`/api/perfumes/${id}`),

  createPerfume: (data: any) => api.post("/api/perfumes", data),

  updatePerfume: (id: string, data: any) =>
    api.put(`/api/perfumes/${id}`, data),

  deletePerfume: (id: string) => api.delete(`/api/perfumes/${id}`),

  // (legacy perfume comment endpoints removed)

  // Brands
  getAllBrands: () => api.get("/api/brands"),
  getBrandById: (id: string) => api.get(`/api/brands/${id}`),
  getBrandStats: () => api.get("/api/brands/stats"),
  createBrand: (data: any) => api.post("/api/brands", data),
  updateBrand: (id: string, data: any) => api.put(`/api/brands/${id}`, data),
  deleteBrand: (id: string) => api.delete(`/api/brands/${id}`),
  restoreBrand: (id: string) => api.patch(`/api/brands/${id}/restore`),

  // Perfume Tags
  getPerfumeTags: (perfumeId: string) =>
    api.get(`/api/perfume-tags/perfume/${perfumeId}`),
  getUserTaggedPerfumes: (params?: {
    tag?: string;
    favorite?: boolean;
    wishlist?: boolean;
  }) => api.get("/api/perfume-tags/user/tagged", { params }),
  getUserTagStats: () => api.get("/api/perfume-tags/user/stats"),
  addPerfumeTags: (perfumeId: string, data: any) =>
    api.post(`/api/perfume-tags/perfume/${perfumeId}`, data),
  addTag: (perfumeId: string, data: { name: string; color?: string }) =>
    api.post(`/api/perfume-tags/perfume/${perfumeId}/tag`, data),
  removeTag: (perfumeId: string, tagName: string) =>
    api.delete(`/api/perfume-tags/perfume/${perfumeId}/tag/${tagName}`),
  toggleFavorite: (perfumeId: string) =>
    api.patch(`/api/perfume-tags/perfume/${perfumeId}/favorite`),
  toggleWishlist: (perfumeId: string) =>
    api.patch(`/api/perfume-tags/perfume/${perfumeId}/wishlist`),

  // Users
  getUsers: () => api.get("/api/members"),
  createUser: (data: any) => api.post("/api/members", data),
  updateUser: (id: string, data: any) => api.put(`/api/members/${id}`, data),
  deleteUser: (id: string) => api.delete(`/api/members/${id}`),

  // Comments
  getPerfumeComments: (perfumeId: string) =>
    api.get(`/api/comments/perfume/${perfumeId}`),
  addComment: (perfumeId: string, data: { content: string; rating?: number }) =>
    api.post(`/api/comments/perfume/${perfumeId}`, data),
  getAllComments: () => api.get("/api/comments/all"),
  updateComment: (commentId: string, data: any) =>
    api.put(`/api/comments/${commentId}`, data),
  deleteComment: (commentId: string) =>
    api.delete(`/api/comments/${commentId}`),
  getCommentStats: () => api.get("/api/comments/stats"),
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
  try {
    sessionStorage.setItem("token", token);
  } catch {}
};

export const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  } catch {}
};

export const setUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
  try {
    sessionStorage.setItem("user", JSON.stringify(user));
  } catch {}
};

export const getUser = () => {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Utility function to calculate average rating from comments
export const calculateAverageRating = (comments: any[] | undefined): number => {
  if (!comments || comments.length === 0) {
    return 0;
  }

  const validRatings = comments
    .map((comment) => (typeof comment.rating === "number" ? comment.rating : 0))
    .filter((rating) => rating > 0);

  if (validRatings.length === 0) {
    return 0;
  }

  return (
    validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
  );
};

export default api;
