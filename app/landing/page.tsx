"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import packageService from "@/services/packageService";
import { Package } from "@/types/package";
import { ScrollAnimate } from "@/components/ui/ScrollAnimate";
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
  Target,
  Sparkles,
  TrendingUp,
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

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <ScrollAnimate animation="fade-up">
            <div className="section-header">
              <h2 className="section-title">About MSP</h2>
              <p className="section-description">
                We are dedicated to transforming how businesses conduct and manage
                their meetings.
              </p>
            </div>
          </ScrollAnimate>

          <div className="about-grid">
            {/* Mission Card */}
            <ScrollAnimate animation="fade-up" delay={100}>
              <div className="about-card">
                <div className="about-card-icon">
                  <Target className="about-icon" />
                </div>
                <h3 className="about-card-title">Our Mission</h3>
                <p className="about-card-description">
                  MSP (Meeting Support Platform) was created with a vision to help
                  businesses optimize their meeting processes and improve team
                  collaboration. We understand that effective meetings are the
                  cornerstone of successful projects and business growth.
                </p>
              </div>
            </ScrollAnimate>

            {/* What We Offer Card */}
            <ScrollAnimate animation="fade-up" delay={200}>
              <div className="about-card">
                <div className="about-card-icon">
                  <Sparkles className="about-icon" />
                </div>
                <h3 className="about-card-title">What We Offer</h3>
                <p className="about-card-description">
                  Our platform combines cutting-edge technology with intuitive
                  design to provide a comprehensive solution for meeting
                  management. From video conferencing to AI-powered transcription
                  and automatic task assignment, MSP streamlines your entire
                  meeting workflow.
                </p>
              </div>
            </ScrollAnimate>

            {/* Why Choose Us Card */}
            <ScrollAnimate animation="fade-up" delay={300}>
              <div className="about-card">
                <div className="about-card-icon">
                  <TrendingUp className="about-icon" />
                </div>
                <h3 className="about-card-title">Why Choose Us</h3>
                <p className="about-card-description">
                  We focus on delivering real value to business owners and teams.
                  Our platform is designed to save time, increase productivity,
                  and ensure that important decisions and action items from
                  meetings are never lost or forgotten.
                </p>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <ScrollAnimate animation="fade-up">
            <div className="section-header">
              <h2 className="section-title">Why Business Owners Choose MSP?</h2>
              <p className="section-description">
                Built with modern technology and business needs, MSP provides
                everything your business needs to succeed.
              </p>
            </div>
          </ScrollAnimate>

          <div className="features-grid">
            {features.map((feature, index) => (
              <ScrollAnimate 
                key={index} 
                animation="fade-up" 
                delay={(index % 3) * 100 + 100}
              >
                <div className="feature-card">
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
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-bg-shape"></div>

        <div className="container pricing-content">
          <ScrollAnimate animation="fade-up">
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
          </ScrollAnimate>

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
                <ScrollAnimate 
                  key={pkg.id}
                  animation="fade-up"
                  delay={index * 100 + 100}
                >
                  <div
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
                </ScrollAnimate>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <ScrollAnimate animation="scale">
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
          </ScrollAnimate>
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
