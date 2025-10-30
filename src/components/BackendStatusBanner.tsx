"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { publicAPI } from "@/utils/api";
import { useDebounce } from "@/hooks/useDebounce";

export default function BackendStatusBanner() {
  const [status, setStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [isDismissed, setIsDismissed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const debouncedRetryCount = useDebounce(retryCount, 1000);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        setStatus("checking");
        await publicAPI.getBrands();
        setStatus("connected");
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        // Only show disconnected status if it's a backend connection error
        if (
          error.code === "ERR_CONNECTION_REFUSED" ||
          error.code === "ERR_NETWORK" ||
          error.message?.includes("Backend server is not running")
        ) {
          setStatus("disconnected");
          setRetryCount((prev) => prev + 1);
        } else {
          // For other errors, assume connected but with issues
          setStatus("connected");
        }
      }
    };

    checkBackend();
  }, [debouncedRetryCount]);

  // Don't show banner if connected or dismissed
  if (status === "connected" || isDismissed) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "disconnected":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "checking":
        return "Checking backend connection...";
      case "disconnected":
        return "Backend server is not running. Some features may not work properly.";
      default:
        return "";
    }
  };

  return (
    <div className="bg-destructive/10 border-l-4 border-destructive p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium text-destructive">
              {getStatusMessage()}
            </p>
            {status === "disconnected" && (
              <p className="text-xs text-muted-foreground mt-1">
                Please start your backend server on{" "}
                <code className="bg-muted px-1 rounded">
                  http://localhost:3001
                </code>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
