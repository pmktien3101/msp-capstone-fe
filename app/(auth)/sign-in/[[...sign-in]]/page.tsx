"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { isAuthenticated } from "@/lib/auth";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import "../../../styles/auth.scss";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Always call hooks at the top level
  const { login, isLoading: authLoading } = useUser();

  // Check if user is already authenticated - only run ONCE on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          console.log("User already authenticated, redirecting to dashboard");
          // Get redirect URL from query params, default to /dashboard
          const redirectUrl = searchParams.get("redirect") || "/dashboard";
          if (isMounted) {
            router.replace(redirectUrl); // Use replace instead of push to avoid back button issues
          }
          return;
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    const timer = setTimeout(checkAuth, 100);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // Empty dependency array - only run once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted with email:", formData.email);
    setError(null);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      console.log("Login result:", result);

      if (result.success) {
        console.log("Login successful!");
        
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        }

        // Get redirect URL from query params, default to /dashboard
        const redirectUrl = searchParams.get("redirect") || "/dashboard";
        console.log("Login successful, redirecting to:", redirectUrl);
        console.log("Current localStorage accessToken:", localStorage.getItem("accessToken")?.substring(0, 20) + "...");
        
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          console.log("Pushing to:", redirectUrl);
          router.push(redirectUrl);
        }, 200);
      } else {
        console.log("Login failed:", result.error);
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="auth-checking">
        <div className="loading-spinner"></div>
        <p>Checking sign in status...</p>
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Left Side - Visual */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="logo-container">
              <div className="logo-icon">
                <Image src="/logo.png" alt="MSP Logo" width={60} height={60} />
              </div>
              <h1 className="visual-title">Welcome Back</h1>
              <p className="visual-subtitle">
                Sign in to continue managing your business meetings and projects.
              </p>
            </div>

            <div className="visual-illustration">
              <div className="floating-elements">
                <div className="floating-card">
                  <div className="card-icon">📅</div>
                  <div className="card-text">Smart Scheduling</div>
                </div>
                <div className="floating-card">
                  <div className="card-icon">🤝</div>
                  <div className="card-text">Team Collaboration</div>
                </div>
                <div className="floating-card">
                  <div className="card-icon">📊</div>
                  <div className="card-text">Data Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-card">
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Please sign in to continue</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} color="#FFA463" strokeWidth={2} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} color="#FFA463" strokeWidth={2} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#FFA463" strokeWidth={2} />
                    ) : (
                      <Eye size={20} color="#FFA463" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  {/* <span className="checkmark"></span>
                  Ghi nhớ đăng nhập */}
                </label>
                <Link href="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="login-btn" disabled={authLoading}>
                {authLoading ? <div className="loading-spinner" /> : "Sign In"}
              </button>

              <div className="divider">
                <span>Or</span>
              </div>

              <div className="social-login">
                <GoogleLoginButton 
                  text="signin_with"
                  rememberMe={formData.rememberMe}
                  onSuccess={() => {
                    console.log("Google login successful, redirect will be handled by GoogleLoginButton");
                    // Redirect is handled inside GoogleLoginButton
                  }}
                  onError={(error) => {
                    console.error("Google login error:", error);
                    setError(error);
                  }}
                />
              </div>

              <div className="register-section">
                <p className="register-description">
                  Don’t have an account? <Link href="/sign-up" className="register-link">Sign up for a business account</Link> to start managing your projects and team members.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
