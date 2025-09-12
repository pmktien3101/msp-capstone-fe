"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import '../styles/landing-page.scss';

export default function LandingPage() {
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('accessToken');
    if (token) {
      // If user is authenticated, redirect to dashboard
      router.push('/dashboard');
    }
  }, [router]);

  const stats = [
    { number: '10K+', label: 'Doanh Nghiệp Sử Dụng' },
    { number: '98%', label: 'Tỷ Lệ Hài Lòng' },
    { number: '24/7', label: 'Hỗ Trợ Khách Hàng' },
    { number: '50K+', label: 'Cuộc Họp Mỗi Ngày' }
  ];

  const features = [
    {
      icon: '🎯',
      title: 'Lập Kế Hoạch Thông Minh',
      description: 'Tự động lên lịch và đề xuất thời gian họp phù hợp nhất cho mọi người.'
    },
    {
      icon: '⚡',
      title: 'Tối Ưu Hóa Hiệu Suất',
      description: 'Công cụ phân tích giúp đo lường và cải thiện hiệu quả cuộc họp.'
    },
    {
      icon: '🤝',
      title: 'Hợp Tác Thời Gian Thực',
      description: 'Tương tác trực tiếp với đồng đội trong và sau cuộc họp.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: isYearlyBilling ? '29' : '39',
      description: 'Cho doanh nghiệp nhỏ mới bắt đầu',
      features: [
        'Tối đa 10 thành viên',
        'Lịch họp không giới hạn',
        'Tích hợp cơ bản',
        'Email hỗ trợ'
      ]
    },
    {
      name: 'Professional',
      price: isYearlyBilling ? '99' : '119',
      description: 'Cho doanh nghiệp đang phát triển',
      features: [
        'Không giới hạn thành viên',
        'Phân tích nâng cao',
        'Tích hợp API đầy đủ',
        'Hỗ trợ 24/7'
      ],
      featured: true
    },
    {
      name: 'Enterprise',
      price: isYearlyBilling ? '299' : '349',
      description: 'Giải pháp tùy chỉnh cho doanh nghiệp lớn',
      features: [
        'Triển khai riêng',
        'Quản lý chuyên dụng',
        'SLA cam kết',
        'Hỗ trợ ưu tiên 24/7'
      ]
    }
  ];

  const testimonials = [
    {
      content: 'MSP đã thay đổi hoàn toàn cách chúng tôi quản lý cuộc họp. Hiệu quả tăng rõ rệt!',
      name: 'Nguyễn Văn A',
      role: 'CEO',
      company: 'Tech Solutions',
      avatar: '👨‍💼'
    },
    {
      content: 'Giải pháp tuyệt vời cho việc theo dõi và quản lý cuộc họp một cách chuyên nghiệp.',
      name: 'Trần Thị B',
      role: 'Project Manager',
      company: 'Creative Agency',
      avatar: '👩‍💼'
    }
  ];

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
                <span className='text-3xl'>MSP</span>
              </div>
            </div>
            
            <div className="nav-menu">
              <Link href="#features">Tính Năng</Link>
              <Link href="#pricing">Giá Cả</Link>
              <Link href="#about">Giới Thiệu</Link>
              <Link href="#testimonials">Đánh Giá</Link>
              <Link href="#contact">Liên Hệ</Link>
            </div>
            
            <div className="nav-actions">
              <Link href="/sign-in" className="btn btn-outline">Đăng Nhập</Link>
              <Link href="/sign-up" className="btn btn-primary">Đăng Ký Doanh Nghiệp</Link>
            </div>
          </nav>

          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Biến Đổi
                <span className="gradient-text">Cuộc Họp Kinh Doanh</span>
                Thành Thành Công
              </h1>
              <p className="hero-description">
                Nền tảng hỗ trợ cuộc họp tối ưu được thiết kế cho chủ doanh nghiệp và nhóm.
                Tối ưu hóa hợp tác, theo dõi tiến độ và đạt được mục tiêu kinh doanh nhanh hơn bao giờ hết.
              </p>
              <div className="hero-actions">
                <Link href="/sign-up" className="btn btn-primary btn-large">
                  Đăng Ký Doanh Nghiệp
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <button className="btn btn-play">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="#FF5E13"/>
                  </svg>
                  Xem Demo
                </button>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="hero-image">
                {/* Floating Cards */}
                <div className="floating-card card-1">
                  <div className="card-icon">📅</div>
                  <div className="card-content">
                    <div className="card-title">Cuộc Họp Đã Lên Lịch</div>
                    <div className="card-time">2:00 PM Hôm Nay</div>
                  </div>
                </div>
                <div className="floating-card card-2">
                  <div className="card-icon">✅</div>
                  <div className="card-content">
                    <div className="card-title">Công Việc Hoàn Thành</div>
                    <div className="card-status">Đánh Giá Dự Án</div>
                  </div>
                </div>
                <div className="floating-card card-3">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <div className="card-title">Tiến Độ</div>
                    <div className="card-progress">85% Hoàn Thành</div>
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
            <h2 className="section-title">Tại Sao Chủ Doanh Nghiệp Chọn MSP?</h2>
            <p className="section-description">
              Được xây dựng với công nghệ hiện đại và nhu cầu kinh doanh,
              MSP cung cấp mọi thứ doanh nghiệp của bạn cần để thành công.
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
            <h2 className="section-title">Chọn Gói Của Bạn</h2>
            <p className="section-description">
              Tùy chọn giá cả linh hoạt được thiết kế cho doanh nghiệp mọi quy mô.
              Bắt đầu với dùng thử miễn phí và nâng cấp khi bạn sẵn sàng.
            </p>
          </div>

          <div className="pricing-toggle">
            <span>Theo Tháng</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isYearlyBilling}
                onChange={() => setIsYearlyBilling(!isYearlyBilling)}
                aria-label="Toggle yearly billing"
              />
              <span className="slider"></span>
            </label>
            <span>Theo Năm <span className="save-badge">Tiết Kiệm 20%</span></span>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/{isYearlyBilling ? 'năm' : 'tháng'}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>
                
                <div className="plan-features">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="feature-item">
                      <svg className="feature-check" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="plan-actions">
                  <Link 
                    href="/sign-up"
                    className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {plan.featured ? 'Đăng Ký Ngay' : 'Đăng Ký'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Người Dùng Nói Gì</h2>
            <p className="section-description">
              Tham gia hàng nghìn nhóm hài lòng đã thay đổi
              trải nghiệm cuộc họp của họ với MSP.
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
                    <div className="author-role">{testimonial.role} at {testimonial.company}</div>
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
            <h2 className="cta-title">Sẵn Sàng Biến Đổi Cuộc Họp Kinh Doanh Của Bạn?</h2>
            <p className="cta-description">
              Tham gia hàng nghìn chủ doanh nghiệp đã sử dụng MSP để
              tối ưu hóa hoạt động và đạt được kết quả kinh doanh tốt hơn.
            </p>
            <div className="cta-actions">
              <Link href="/sign-up" className="btn btn-primary btn-large">
                Đăng Ký Doanh Nghiệp
              </Link>
              <Link href="/sign-in" className="btn btn-outline btn-large">
                Đăng Nhập
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
              <p>Biến đổi cuộc họp của bạn thành thành công với nền tảng thông minh của chúng tôi.</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Sản Phẩm</h4>
                <Link href="#features">Tính Năng</Link>
                <Link href="#pricing">Giá Cả</Link>
                <Link href="#integrations">Tích Hợp</Link>
              </div>
              <div className="footer-column">
                <h4>Công Ty</h4>
                <Link href="#about">Giới Thiệu</Link>
                <Link href="#careers">Tuyển Dụng</Link>
                <Link href="#contact">Liên Hệ</Link>
              </div>
              <div className="footer-column">
                <h4>Hỗ Trợ</h4>
                <Link href="#help">Trung Tâm Trợ Giúp</Link>
                <Link href="#docs">Tài Liệu</Link>
                <Link href="#status">Trạng Thái</Link>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copyright">
              © {new Date().getFullYear()} MSP. All rights reserved.
            </div>
            <div className="footer-legal">
              <Link href="#privacy">Chính Sách Bảo Mật</Link>
              <Link href="#terms">Điều Khoản Dịch Vụ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
