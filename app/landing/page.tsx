"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import packageService from "@/services/packageService";
import { Package } from "@/types/package";
import "@/app/styles/landing-page.scss";
import {
  Video,
  FileText,
  FolderKanban,
  CheckSquare,
  ListTodo,
  RefreshCw,
  ArrowRight,
  Check,
  Menu,
  X,
  Star,
  Shield,
  Users,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    {
      number: "10K+",
      label: "Businesses Using",
      icon: <Users className="stat-svg" />,
    },
    {
      number: "98%",
      label: "Satisfaction Rate",
      icon: <Star className="stat-svg" />,
    },
    {
      number: "24/7",
      label: "Customer Support",
      icon: <Shield className="stat-svg" />,
    },
    {
      number: "50K+",
      label: "Meetings Per Day",
      icon: <Zap className="stat-svg" />,
    },
  ];

  const features = [
    {
      icon: <FolderKanban className="icon-svg" />,
      title: "Project Management",
      description:
        "Organize and track your projects with milestones, deadlines, and team collaboration tools.",
      secondary: false,
    },
    {
      icon: <CheckSquare className="icon-svg" />,
      title: "Task Management",
      description:
        "Create, assign, and track tasks with priorities, due dates, and progress monitoring.",
      secondary: false,
    },
    {
      icon: <Video className="icon-svg" />,
      title: "Video Meetings",
      description:
        "Host seamless video conferences with your team. High-quality audio and video for productive discussions.",
      secondary: false,
    },
    {
      icon: <FileText className="icon-svg" />,
      title: "AI Transcript",
      description:
        "Automatically transcribe your meetings in real-time. Never miss important details with AI-powered transcription.",
      secondary: true,
    },
    {
      icon: <ListTodo className="icon-svg" />,
      title: "Smart To-Do List",
      description:
        "Capture action items during meetings and organize them into structured to-do lists effortlessly.",
      secondary: true,
    },
    {
      icon: <RefreshCw className="icon-svg" />,
      title: "Auto Task Assignment",
      description:
        "Automatically convert meeting discussions into actionable tasks and assign them to team members.",
      secondary: false,
    },
  ];

  const testimonials = [
    {
      content:
        "MSP has completely transformed how we manage meetings. Efficiency has increased significantly!",
      name: "John Smith",
      role: "CEO",
      company: "Tech Solutions",
      avatar: "/avatars/avatar-1.png",
    },
    {
      content:
        "An excellent solution for tracking and managing meetings professionally.",
      name: "Sarah Johnson",
      role: "Project Manager",
      company: "Creative Agency",
      avatar: "/avatars/avatar-2.png",
    },
  ];

  const formatPrice = (price: number, billingCycle: number) => {
    if (isYearlyBilling && billingCycle === 1) {
      return Math.round(price * 12 * 0.8);
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

  if (isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Checking login status...</p>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        {/* Background Shapes */}
        <div className="hero-background">
          <div className="bg-shape bg-shape-1"></div>
          <div className="bg-shape bg-shape-2"></div>
          <div className="bg-shape bg-shape-3"></div>
          <div className="network-dots"></div>
        </div>

        <div className="container">
          {/* Navbar */}
          <nav className="navbar">
            {/* Logo */}
            <div className="nav-brand">
              <div className="logo-image">
                <Image
                  src="/logo.png"
                  alt="MSP Logo"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <span className="logo-text">MSP</span>
            </div>

            {/* Desktop Menu */}
            <div className="nav-menu-wrapper">
              <div className="nav-menu">
                <Link href="#" className="active">
                  Home
                </Link>
                <Link href="#about">About Us</Link>
                <Link href="#features">Features</Link>
                <Link href="#pricing">Pricing</Link>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="nav-actions">
              <Link href="/sign-in" className="nav-signin">
                Sign In
              </Link>
              <Link href="/sign-up" className="nav-signup">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </nav>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="mobile-menu-overlay">
              <div className="mobile-menu-header">
                <span className="mobile-logo">MSP</span>
                <button
                  className="mobile-close-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X />
                </button>
              </div>
              <div className="mobile-menu-links">
                <Link
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link href="#about" onClick={() => setIsMobileMenuOpen(false)}>
                  About
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-signin"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-signup"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Hero Content */}
          <div className="hero-content">
            <div className="hero-text">
              {/* Badge */}
              <div className="hero-badge">
                <span className="badge-dot">
                  <span className="dot-ping"></span>
                  <span className="dot-core"></span>
                </span>
                New: AI-Powered Meeting Insights
              </div>

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
                <Link href="/sign-up" className="hero-cta">
                  Register Your Business
                  <ArrowRight className="cta-icon" />
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              {/* Main Card - Meeting to Task Flow UI */}
              <div className="hero-card">
                <div className="flow-steps">
                  {/* Step 1: Meeting */}
                  <div className="flow-step">
                    <div className="step-icon step-icon-outline">
                      <Video className="step-svg" />
                    </div>
                    <div className="step-content">
                      <p className="step-title">Meeting</p>
                      <p className="step-desc">
                        Start video call with your team
                      </p>
                    </div>
                    <div className="step-status status-check">
                      <Check className="check-icon" />
                    </div>
                  </div>

                  <div className="flow-connector"></div>

                  {/* Step 2: Record */}
                  <div className="flow-step">
                    <div className="step-icon step-icon-outline">
                      <div className="recording-dot"></div>
                    </div>
                    <div className="step-content">
                      <p className="step-title">Recording</p>
                      <p className="step-desc">Auto-record meeting content</p>
                    </div>
                    <div className="step-status status-check">
                      <Check className="check-icon" />
                    </div>
                  </div>

                  <div className="flow-connector"></div>

                  {/* Step 3: AI Summary */}
                  <div className="flow-step">
                    <div className="step-icon step-icon-outline">
                      <FileText className="step-svg" />
                    </div>
                    <div className="step-content">
                      <p className="step-title">AI Summary</p>
                      <p className="step-desc">
                        Generate smart meeting summary
                      </p>
                    </div>
                    <div className="step-status status-check">
                      <Check className="check-icon" />
                    </div>
                  </div>

                  <div className="flow-connector"></div>

                  {/* Step 4: To-Do List */}
                  <div className="flow-step">
                    <div className="step-icon step-icon-outline">
                      <ListTodo className="step-svg" />
                    </div>
                    <div className="step-content">
                      <p className="step-title">To-Do List</p>
                      <p className="step-desc">
                        Extract action items automatically
                      </p>
                    </div>
                    <div className="step-status status-check">
                      <Check className="check-icon" />
                    </div>
                  </div>

                  <div className="flow-connector"></div>

                  {/* Step 5: Auto Assign Tasks */}
                  <div className="flow-step">
                    <div className="step-icon step-icon-filled">
                      <CheckSquare className="step-svg" />
                    </div>
                    <div className="step-content">
                      <p className="step-title">Auto Assign Tasks</p>
                      <p className="step-desc">
                        Assign to team members instantly
                      </p>
                    </div>
                    <div className="step-status status-done">Done!</div>
                  </div>
                </div>
              </div>

              {/* Decorative blob */}
              <div className="hero-blob"></div>
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
                <div className="stat-icon">{stat.icon}</div>
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
                <div
                  className={`feature-icon ${
                    feature.secondary ? "icon-secondary" : ""
                  }`}
                >
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-bg-shape"></div>

        <div className="container pricing-content">
          <div className="section-header">
            <h2 className="section-title">Choose Your Plan</h2>
            <p className="section-description">
              Flexible pricing options designed for businesses of all sizes.
              Start with a free trial and upgrade when you're ready.
            </p>

            <div className="pricing-toggle">
              <button
                className={`toggle-btn ${!isYearlyBilling ? "active" : ""}`}
                onClick={() => setIsYearlyBilling(false)}
              >
                Monthly
              </button>
              <button
                className={`toggle-btn ${isYearlyBilling ? "active" : ""}`}
                onClick={() => setIsYearlyBilling(true)}
              >
                Yearly
                <span className="discount-badge">-20%</span>
              </button>
            </div>
          </div>

          <div className="pricing-grid">
            {isLoadingPackages ? (
              <div className="pricing-loading">
                <div className="pricing-spinner"></div>
                <p>Loading packages...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="pricing-empty">
                <p>No packages available at the moment.</p>
              </div>
            ) : (
              packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`pricing-card ${
                    index === 1
                      ? "pricing-card-featured"
                      : "pricing-card-default"
                  }`}
                >
                  {index === 1 && (
                    <div className="popular-badge">Most Popular</div>
                  )}

                  <div className="plan-header">
                    <h3 className="plan-name">{pkg.name}</h3>
                    <p className="plan-description">
                      {pkg.description || "Perfect for your business needs"}
                    </p>
                  </div>

                  <div className="plan-price">
                    <div className="price-wrapper">
                      <span className="price-currency">
                        {pkg.currency === "VND" ? "₫" : "$"}
                        {formatPrice(
                          pkg.price,
                          pkg.billingCycle
                        ).toLocaleString()}
                      </span>
                      <span className="price-period">
                        {getBillingPeriod(pkg.billingCycle)}
                      </span>
                    </div>
                  </div>

                  <div className="plan-features">
                    {getPackageFeatures(pkg).map((feature, featureIndex) => (
                      <div key={featureIndex} className="feature-item">
                        <div className="feature-check-wrapper">
                          <Check className="feature-check-icon" />
                        </div>
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/sign-up" className="pricing-cta">
                    {index === 1 ? "Get Started Now" : "Get Started"}
                  </Link>
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
                <div className="testimonial-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="star-icon" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <div className="avatar-placeholder">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
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
          <div className="cta-card">
            <div className="cta-circle cta-circle-1"></div>
            <div className="cta-circle cta-circle-2"></div>

            <div className="cta-content">
              <h2 className="cta-title">
                Ready to Transform Your Business Meetings?
              </h2>
              <p className="cta-description">
                Join thousands of business owners who have used MSP to optimize
                operations and achieve better business results.
              </p>
              <div className="cta-actions">
                <Link href="/sign-up" className="cta-primary">
                  Register Your Business
                </Link>
                <Link href="/sign-in" className="cta-secondary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <Image
                  src="/logo.png"
                  alt="MSP Logo"
                  width={32}
                  height={32}
                  className="footer-logo-img"
                />
                <span className="footer-logo-text">MSP</span>
              </div>
              <p className="footer-tagline">
                Transform your meetings into success with our intelligent
                platform.
              </p>
            </div>

            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li>
                  <Link href="#features">Features</Link>
                </li>
                <li>
                  <Link href="#pricing">Pricing</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li>
                  <Link href="#about">About</Link>
                </li>
                <li>
                  <Link href="#contact">Contact</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li>
                  <Link href="#help">Help Center</Link>
                </li>
              </ul>
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
