"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import packageService from "@/services/packageService";
import { Package } from "@/types/package";
import "../styles/landing-page.scss";

export default function LandingPage() {
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          console.log("User already authenticated, redirecting to dashboard");
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true);
        const response = await packageService.getPackages();
        if (response.success && response.data) {
          // Filter out deleted packages and sort by price
          const activePackages = (response.data as Package[])
            .filter((pkg) => !pkg.isDeleted)
            .sort((a, b) => a.price - b.price);
          setPackages(activePackages);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const stats = [
    { number: "10K+", label: "Businesses Using" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Customer Support" },
    { number: "50K+", label: "Meetings Per Day" },
  ];

  const features = [
    {
      icon: "🎥",
      title: "Video Meetings",
      description:
        "Host seamless video conferences with your team. High-quality audio and video for productive discussions.",
    },
    {
      icon: "📝",
      title: "AI Transcript",
      description:
        "Automatically transcribe your meetings in real-time. Never miss important details with AI-powered transcription.",
    },
    {
      icon: "📁",
      title: "Project Management",
      description:
        "Organize and track your projects with milestones, deadlines, and team collaboration tools.",
    },
    {
      icon: "📋",
      title: "Task Management",
      description:
        "Create, assign, and track tasks with priorities, due dates, and progress monitoring.",
    },
    {
      icon: "✅",
      title: "Smart To-Do List",
      description:
        "Capture action items during meetings and organize them into structured to-do lists effortlessly.",
    },
    {
      icon: "🔄",
      title: "Auto Task Assignment",
      description:
        "Automatically convert meeting discussions into actionable tasks and assign them to team members.",
    },
  ];

  const testimonials = [
    {
      content:
        "MSP has completely transformed how we manage meetings. Efficiency has increased significantly!",
      name: "John Smith",
      role: "CEO",
      company: "Tech Solutions",
      avatar: "👨‍💼",
    },
    {
      content:
        "An excellent solution for tracking and managing meetings professionally.",
      name: "Sarah Johnson",
      role: "Project Manager",
      company: "Creative Agency",
      avatar: "👩‍💼",
    },
  ];

  const formatPrice = (price: number, billingCycle: number) => {
    if (isYearlyBilling && billingCycle === 1) {
      // If monthly package but yearly billing selected, calculate yearly price with discount
      return Math.round(price * 12 * 0.8); // 20% discount for yearly
    }
    return price;
  };

  const getBillingPeriod = (billingCycle: number) => {
    if (isYearlyBilling) return "/year";
    return billingCycle === 1
      ? "/month"
      : billingCycle === 12
      ? "/year"
      : `/${billingCycle} months`;
  };

  const getPackageFeatures = (pkg: Package): string[] => {
    if (!pkg.limitations || pkg.limitations.length === 0) {
      return ["Contact us for details"];
    }
    return pkg.limitations.map((limitation) => {
      if (limitation.isUnlimited) {
        return `Unlimited ${limitation.name}`;
      }
      return `${limitation.limitValue} ${limitation.name}`;
    });
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="auth-checking">
        <div className="loading-spinner"></div>
        <p>Checking login status...</p>
        <style jsx>{`
          .auth-checking {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: white;
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        <div className="container">
          <nav className="navbar">
            <div className="nav-brand">
              <div className="logo">
                <Image src="/logo.png" alt="MSP Logo" width={62} height={62} />
                <span className="text-3xl">MSP</span>
              </div>
            </div>

            <div className="nav-menu">
              <Link href="#features">Features</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="#about">About</Link>
              <Link href="#testimonials">Testimonials</Link>
              <Link href="#contact">Contact</Link>
            </div>

            <div className="nav-actions">
              <Link href="/sign-in" className="btn btn-outline">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          </nav>

          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Transform
                <span className="gradient-text">Business Meetings</span>
                Into Success
              </h1>
              <p className="hero-description">
                An optimized meeting support platform designed for business
                owners and teams. Optimize collaboration, track progress and
                achieve business goals faster than ever.
              </p>
              <div className="hero-actions">
                <Link href="/sign-up" className="btn btn-primary btn-large">
                  Register Your Business
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image">
                {/* Floating Cards */}
                <div className="floating-card card-1">
                  <div className="card-icon">📅</div>
                  <div className="card-content">
                    <div className="card-title">Meeting Scheduled</div>
                    <div className="card-time">2:00 PM Today</div>
                  </div>
                </div>
                <div className="floating-card card-2">
                  <div className="card-icon">✅</div>
                  <div className="card-content">
                    <div className="card-title">Task Completed</div>
                    <div className="card-status">Project Review</div>
                  </div>
                </div>
                <div className="floating-card card-3">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <div className="card-title">Progress</div>
                    <div className="card-progress">85% Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Business Owners Choose MSP?</h2>
            <p className="section-description">
              Built with modern technology and business needs, MSP provides
              everything your business needs to succeed.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Choose Your Plan</h2>
            <p className="section-description">
              Flexible pricing options designed for businesses of all sizes.
              Start with a free trial and upgrade when you're ready.
            </p>
          </div>

          <div className="pricing-toggle">
            <span>Monthly</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isYearlyBilling}
                onChange={() => setIsYearlyBilling(!isYearlyBilling)}
                aria-label="Toggle yearly billing"
              />
              <span className="slider"></span>
            </label>
            <span>
              Yearly <span className="save-badge">Save 20%</span>
            </span>
          </div>

          <div className="pricing-grid">
            {isLoadingPackages ? (
              <div className="loading-packages">
                <div className="loading-spinner"></div>
                <p>Loading packages...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="no-packages">
                <p>No packages available at the moment.</p>
              </div>
            ) : (
              packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`pricing-card ${index === 1 ? "featured" : ""}`}
                >
                  <div className="plan-header">
                    <h3 className="plan-name">{pkg.name}</h3>
                    <div className="plan-price">
                      <span className="currency">
                        {pkg.currency === "VND" ? "₫" : "$"}
                      </span>
                      <span className="amount">
                        {formatPrice(
                          pkg.price,
                          pkg.billingCycle
                        ).toLocaleString()}
                      </span>
                      <span className="period">
                        {getBillingPeriod(pkg.billingCycle)}
                      </span>
                    </div>
                    <p className="plan-description">
                      {pkg.description || "Perfect for your business needs"}
                    </p>
                  </div>

                  <div className="plan-features">
                    {getPackageFeatures(pkg).map((feature, featureIndex) => (
                      <div key={featureIndex} className="feature-item">
                        <svg
                          className="feature-check"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="#10B981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="plan-actions">
                    <Link
                      href="/sign-up"
                      className={`btn ${
                        index === 1 ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {index === 1 ? "Get Started Now" : "Get Started"}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Users Say</h2>
            <p className="section-description">
              Join thousands of satisfied teams who have transformed their
              meeting experience with MSP.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Transform Your Business Meetings?
            </h2>
            <p className="cta-description">
              Join thousands of business owners who have used MSP to optimize
              operations and achieve better business results.
            </p>
            <div className="cta-actions">
              <Link href="/sign-up" className="btn btn-primary btn-large">
                Register Your Business
              </Link>
              <Link href="/sign-in" className="btn btn-outline btn-large">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <Image src="/logo.png" alt="MSP Logo" width={32} height={32} />
                <span>MSP</span>
              </div>
              <p>
                Transform your meetings into success with our intelligent
                platform.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <Link href="#features">Features</Link>
                <Link href="#pricing">Pricing</Link>
                <Link href="#integrations">Integrations</Link>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <Link href="#about">About</Link>
                <Link href="#careers">Careers</Link>
                <Link href="#contact">Contact</Link>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <Link href="#help">Help Center</Link>
                <Link href="#docs">Documentation</Link>
                <Link href="#status">Status</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © {new Date().getFullYear()} MSP. All rights reserved.
            </div>
            <div className="footer-legal">
              <Link href="#privacy">Privacy Policy</Link>
              <Link href="#terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
