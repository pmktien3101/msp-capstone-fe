"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import "@/app/styles/change-password.scss";

const ChangePasswordPage = () => {
  const router = useRouter();
  const { userId } = useUser();
  const [step, setStep] = useState<"verify" | "change">("verify");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOldPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oldPassword.trim()) {
      toast.error("Please enter your old password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await userService.checkOldPassword(userId || "", oldPassword);
      
      if (result.success) {
        toast.success("Old password verified");
        setStep("change");
      } else {
        toast.error(result.error || "Old password is incorrect");
      }
    } catch (error) {
      toast.error("Failed to verify password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error("Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const result = await userService.changePassword(userId || "", oldPassword, newPassword);
      
      if (result.success) {
        toast.success("Password changed successfully");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "change") {
      setStep("verify");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      router.back();
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        {/* Header */}
        <div className="change-password-header">
          <button
            onClick={handleBack}
            className="back-button"
            disabled={isLoading}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Change Password</h1>
          <div style={{ width: "20px" }} />
        </div>

        {/* Step 1: Verify Old Password */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOldPassword} className="change-password-form">
            <div className="form-group">
              <label htmlFor="oldPassword">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="toggle-password-btn"
                  disabled={isLoading}
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !oldPassword.trim()}
              className="submit-button"
            >
              {isLoading ? "Verifying..." : "Verify Password"}
            </Button>
          </form>
        )}

        {/* Step 2: Set New Password */}
        {step === "change" && (
          <form onSubmit={handleChangePassword} className="change-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="toggle-password-btn"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="toggle-password-btn"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <p className={newPassword.length >= 6 ? "valid" : ""}>
                ✓ At least 6 characters
              </p>
              <p className={newPassword === confirmPassword && confirmPassword ? "valid" : ""}>
                ✓ Passwords match
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !newPassword.trim() || !confirmPassword.trim() || newPassword !== confirmPassword}
              className="submit-button"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;
