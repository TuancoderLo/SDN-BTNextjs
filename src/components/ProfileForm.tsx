"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, User, Mail, Calendar, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormData {
  name: string;
  email: string;
  YOB: number;
  gender: boolean;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { backendUser, logout } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>();

  const passwordForm = useForm<PasswordChangeData>();

  useEffect(() => {
    if (backendUser) {
      reset({
        name: backendUser.name,
        email: backendUser.email,
        YOB: backendUser.YOB ?? 1990,
        gender: backendUser.gender ?? true,
      });
    }
  }, [backendUser, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await authAPI.updateProfile(data);
      toast.success("Profile updated successfully!");
      // Refresh the page to get updated user data
      window.location.reload();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordChangeData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsPasswordLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully!");
      passwordForm.reset();
      // Logout user after password change for security
      setTimeout(() => {
        logout();
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to change password.";
      toast.error(errorMessage);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!backendUser) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Profile Information */}
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Profile Information
        </h3>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                type="text"
                className="pl-10"
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                className="pl-10"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="YOB" className="text-foreground">
              Year of Birth
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                {...register("YOB", {
                  required: "Year of birth is required",
                  min: {
                    value: 1900,
                    message: "Year must be after 1900",
                  },
                  max: {
                    value: new Date().getFullYear(),
                    message: "Year cannot be in the future",
                  },
                })}
                type="number"
                className="pl-10"
                placeholder="Enter your year of birth"
              />
            </div>
            {errors.YOB && (
              <p className="mt-1 text-sm text-destructive">
                {errors.YOB.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-foreground">Gender</Label>
            <div className="flex space-x-6 mt-2">
              <label className="flex items-center">
                <input
                  {...register("gender")}
                  type="radio"
                  value="true"
                  className="h-4 w-4 text-primary focus:ring-primary border-border"
                />
                <span className="ml-2 text-sm text-foreground">Male</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register("gender")}
                  type="radio"
                  value="false"
                  className="h-4 w-4 text-primary focus:ring-primary border-border"
                />
                <span className="ml-2 text-sm text-foreground">Female</span>
              </label>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Change Password
        </h3>
        <form
          className="space-y-6"
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        >
          <div>
            <Label htmlFor="currentPassword" className="text-foreground">
              Current Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                {...passwordForm.register("currentPassword", {
                  required: "Current password is required",
                })}
                type={showCurrentPassword ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-sm text-destructive">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-foreground">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                {...passwordForm.register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type={showNewPassword ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.newPassword && (
              <p className="mt-1 text-sm text-destructive">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-foreground">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                {...passwordForm.register("confirmPassword", {
                  required: "Please confirm your new password",
                })}
                type={showConfirmPassword ? "text" : "password"}
                className="pl-10 pr-10"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={isPasswordLoading}
              className="w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPasswordLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
