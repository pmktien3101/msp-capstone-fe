"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { authService } from "@/services/authService";
import { uploadFileToCloudinary } from "@/services/uploadFileService";
import "@/app/styles/sign-up.scss";
import {
  User,
  Eye,
  EyeOff,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";

interface RegisterFormData {
  fullName: string;
  organization: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessLicense: string;
}

type Role = "Member" | "BusinessOwner";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<Role>("Member");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string>("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy email và invitation token từ URL
  const invitedEmail = searchParams.get("email");
  const invitationToken = searchParams.get("invitation");
  // Nếu có invitation, lock email và role
  const [isInvitedUser, setIsInvitedUser] = useState(false);

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    fullName: "",
    organization: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessLicense: "",
  });

  // Set initial values từ URL params
  useEffect(() => {
    if (invitedEmail) {
      setRegisterForm((prev) => ({
        ...prev,
        email: decodeURIComponent(invitedEmail),
      }));
      setIsInvitedUser(true);
      setRole("Member"); // Force Member role cho invited users
    }
  }, [invitedEmail]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        console.log("User already authenticated, redirecting to dashboard");
        router.push("/dashboard");
        return;
      }
      setIsCheckingAuth(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="auth-checking">
        <div className="loading-spinner"></div>
        <p>Checking authentication status...</p>
        <style jsx>{`
          .auth-checking {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(
              135deg,
              #f9f4ee 0%,
              #fdf0d2 50%,
              #ffdbbd 100%
            );
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #ff5e13;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          p {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!isFormValid()) {
      setMessage({
        type: "error",
        text:
          role === "BusinessOwner"
            ? "Please fill in all required fields and upload your business license"
            : "Please fill in all required fields",
      });
      setIsLoading(false);
      return;
    }

    try {
      let finalBusinessLicenseUrl = businessLicenseUrl;

      // Upload file to Cloudinary if it hasn't been uploaded yet
      if (businessLicenseFile && !businessLicenseUrl) {
        setMessage({ type: "success", text: "Uploading business license..." });
        try {
          finalBusinessLicenseUrl = await uploadFileToCloudinary(
            businessLicenseFile
          );
          setBusinessLicenseUrl(finalBusinessLicenseUrl);
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          setMessage({
            type: "error",
            text: "Failed to upload business license. Please try again.",
          });
          setIsLoading(false);
          return;
        }
      }

      const registrationData = {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        phoneNumber: registerForm.phoneNumber,
        role: role,
        ...(role === "BusinessOwner" && {
          organization: registerForm.organization,
          businessLicense: finalBusinessLicenseUrl,
        }),
        inviteToken: invitationToken || undefined,
      };

      console.log("Submitting registration:", registrationData);

      const result = await authService.register(registrationData);

      if (result.success) {
        console.log("Registration successful:", result.message);
        // Nếu là invited user, show message khác và redirect về sign-in
        if (isInvitedUser) {
          setMessage({
            type: "success",
            text: "Registration successful! Please sign in, then go to the Business page to accept your invitation.",
          });
        } else {
          setMessage({
            type: "success",
            text: result.message || "Registration successful!",
          });
        }
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (message) {
      setMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ type: "error", text: "File size must not exceed 5MB" });
      return;
    }

    // Store file locally without uploading
    setBusinessLicenseFile(file);
    setRegisterForm((prev) => ({
      ...prev,
      businessLicense: file.name,
    }));
    setMessage(null);
  };

  const isFormValid = () => {
    const baseValid =
      registerForm.fullName &&
      registerForm.phoneNumber &&
      registerForm.email &&
      registerForm.password &&
      registerForm.confirmPassword &&
      registerForm.password === registerForm.confirmPassword;

    if (role === "BusinessOwner") {
      return baseValid && registerForm.organization && businessLicenseFile;
    }

    return baseValid;
  };

  // If already authenticated, show redirect message
  if (isAuthenticated()) {
    return null; // Prevent rendering anything while redirecting
  }

  return (
    <div className="register-container">
      <style jsx>{`
        .register-message {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          animation: slideDown 0.4s ease-out;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 2px solid;
          position: relative;
          overflow: hidden;
        }

        .register-message::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent,
            currentColor,
            transparent
          );
          animation: shimmer 2s infinite;
        }

        .register-message-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .register-message.success {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #064e3b;
          border-color: #10b981;
        }

        .register-message.error {
          background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
          color: #7f1d1d;
          border-color: #ef4444;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .file-upload-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .custom-file-btn {
          flex: 1;
        }

        .preview-btn {
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .preview-btn:hover {
          background: #f3f4f6;
          border-color: #ff5e13;
        }

        .preview-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .preview-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
          position: relative;
          animation: slideUp 0.3s ease-out;
        }

        .preview-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .preview-close:hover {
          background: #f3f4f6;
        }

        .preview-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 8px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="register-content">
        <div className="form-header">
          <div className="logo-container">
            <div className="logo-icon">
              <User size={32} strokeWidth={2} color="white" />
            </div>
            <h1>{isInvitedUser ? "You've been invited!" : "Create Account"}</h1>
            <p>{isInvitedUser ? "Complete the form below to create your account, then accept the invitation." : "Sign up to get started with our platform"}</p>
          </div>
        </div>

        <div className="account-type-tabs">
          {!isInvitedUser &&
            <>
              <button
                type="button"
                className={`tab-button ${role === "Member" ? "active" : ""}`}
                onClick={() => setRole("Member")}
              >
                <Users size={20} />
                <span>Personal Account</span>
              </button>

              <button
                type="button"
                className={`tab-button ${role === "BusinessOwner" ? "active" : ""}`}
                onClick={() => setRole("BusinessOwner")}
              >
                <Building2 size={20} />
                <span>Business Account</span>
              </button>
            </>
          }
        </div>

        <div className="form-and-info-wrapper">
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Message Display */}
            {message && (
              <div
                className={`register-message ${message.type === "success" ? "success" : "error"
                  }`}
              >
                <div className="register-message-content">
                  {message.type === "success" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={registerForm.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {role === "BusinessOwner" && (
                <div className="form-group">
                  <label htmlFor="organizationName">
                    Organization/Business Name *
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="organizationName"
                      name="organization"
                      placeholder="Enter your organization or business name"
                      value={registerForm.organization}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    value={registerForm.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={registerForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={registerForm.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#FFA463" strokeWidth={2} />
                    ) : (
                      <Eye size={18} color="#FFA463" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={registerForm.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="#FFA463" strokeWidth={2} />
                    ) : (
                      <Eye size={18} color="#FFA463" strokeWidth={2} />
                    )}
                  </button>
                </div>
                {registerForm.confirmPassword &&
                  registerForm.password !== registerForm.confirmPassword && (
                    <small className="form-error">Passwords do not match</small>
                  )}
              </div>

              {role === "BusinessOwner" && (
                <div className="form-group">
                  <label htmlFor="businessLicense">Business License *</label>
                  <div className="input-wrapper">
                    <input
                      type="file"
                      id="businessLicense"
                      name="businessLicense"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      required
                      style={{
                        display: "none",
                      }}
                    />
                    <div className="file-upload-wrapper">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("businessLicense")?.click()
                        }
                        className="custom-file-btn"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          background: "#fff",
                          color: "#1a1a1a",
                          cursor: "pointer",
                        }}
                      >
                        {registerForm.businessLicense
                          ? `Selected: ${registerForm.businessLicense}`
                          : "Choose business license file..."}
                      </button>
                      {businessLicenseFile && (
                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() => setShowPreview(true)}
                          title="Preview"
                        >
                          <Eye size={20} color="#ff5e13" />
                        </button>
                      )}
                    </div>
                  </div>
                  {!businessLicenseFile && role === "BusinessOwner" && (
                    <small style={{ color: "#ef4444", fontWeight: "500" }}>
                      Please upload your business license
                    </small>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <span>Create Account</span>
              )}
            </button>

            <div className="signin-link">
              <p>
                Already have an account? <Link href="/sign-in">Sign In</Link>
              </p>
            </div>
          </form>

          {/* Preview Modal */}
          {showPreview && businessLicenseFile && (
            <div
              className="preview-modal"
              onClick={() => setShowPreview(false)}
            >
              <div
                className="preview-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="preview-close"
                  onClick={() => setShowPreview(false)}
                  type="button"
                >
                  <X size={24} color="#1a1a1a" />
                </button>
                <img
                  src={URL.createObjectURL(businessLicenseFile)}
                  alt="Business License Preview"
                  className="preview-image"
                />
              </div>
            </div>
          )}

          <div className="process-section">
            <h3 className="section-title">Registration Process</h3>
            {role === "Member" ? (
              <div className="process-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Fill in your details</h4>
                    <p>Complete the form with your personal information</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Verify your email</h4>
                    <p>Check your inbox and confirm your account</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Start using the platform</h4>
                    <p>Sign in and enjoy all platform features</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="process-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Fill in your details</h4>
                    <p>
                      Complete the form with your personal and business
                      information
                    </p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Submit & Verify email</h4>
                    <p>Submit your registration and verify your email</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Wait for approval</h4>
                    <p>Admin will review and approve your business account</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Account activation</h4>
                    <p>
                      Once approved, you can sign in and start using the
                      platform
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
