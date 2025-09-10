'use client';

import { useState } from 'react';
import '@/app/styles/sign-up.scss';

interface RegisterFormData {
  businessName: string;
  businessType: string;
  industry: string;
  taxCode: string;
  businessAddress: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  agreeTerms: boolean;
  licenseFile: File | null;
  selectedPlan: string;
  yearlyBilling: boolean;
}

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    businessName: '',
    businessType: '',
    industry: '',
    taxCode: '',
    businessAddress: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agreeTerms: false,
    licenseFile: null,
    selectedPlan: '',
    yearlyBilling: false,
  });

  const availablePlans = [
    {
      id: 'basic',
      name: 'Cơ Bản',
      price: 499000,
      description: 'Phù hợp cho doanh nghiệp nhỏ mới bắt đầu',
      features: [
        'Tối đa 5 người dùng',
        'Quản lý dự án cơ bản',
        'Báo cáo hàng tháng',
        'Email support',
      ],
    },
    {
      id: 'pro',
      name: 'Chuyên Nghiệp',
      price: 999000,
      description: 'Dành cho doanh nghiệp đang phát triển',
      features: [
        'Không giới hạn người dùng',
        'Quản lý dự án nâng cao',
        'Báo cáo chi tiết',
        'Hỗ trợ 24/7',
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implement registration logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      console.log('Form submitted:', registerForm);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRegisterForm(prev => ({
        ...prev,
        licenseFile: file,
      }));
    }
  };

  const removeFile = () => {
    setRegisterForm(prev => ({
      ...prev,
      licenseFile: null,
    }));
  };

  const selectPlan = (planId: string) => {
    setRegisterForm(prev => ({
      ...prev,
      selectedPlan: planId,
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFormValid = () => {
    return (
      registerForm.businessName &&
      registerForm.businessType &&
      registerForm.industry &&
      registerForm.taxCode &&
      registerForm.businessAddress &&
      registerForm.firstName &&
      registerForm.lastName &&
      registerForm.email &&
      registerForm.phone &&
      registerForm.agreeTerms &&
      registerForm.licenseFile &&
      registerForm.selectedPlan
    );
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-form-section">
          <div className="form-header">
            <div className="logo-container">
              <div className="logo-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#FF5E13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="#FF5E13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1>Đăng Ký Tài Khoản Business Owner</h1>
              <p>Vui lòng điền thông tin doanh nghiệp và chờ admin duyệt</p>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Thông Tin Doanh Nghiệp</h3>
              
              <div className="form-group">
                <label htmlFor="businessName">Tên Doanh Nghiệp *</label>
                <div className="input-wrapper">
                  <input 
                    type="text"
                    id="businessName"
                    name="businessName"
                    placeholder="Nhập tên doanh nghiệp"
                    value={registerForm.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="businessType">Loại Hình Doanh Nghiệp *</label>
                  <div className="input-wrapper">
                    <select
                      id="businessType"
                      name="businessType"
                      value={registerForm.businessType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn loại hình doanh nghiệp</option>
                      <option value="startup">Startup</option>
                      <option value="small-business">Doanh Nghiệp Nhỏ</option>
                      <option value="medium-business">Doanh Nghiệp Vừa</option>
                      <option value="enterprise">Doanh Nghiệp Lớn</option>
                      <option value="agency">Công Ty Agency</option>
                      <option value="consulting">Công Ty Tư Vấn</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="industry">Ngành Nghề *</label>
                  <div className="input-wrapper">
                    <select
                      id="industry"
                      name="industry"
                      value={registerForm.industry}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn ngành nghề</option>
                      <option value="technology">Công Nghệ</option>
                      <option value="healthcare">Y Tế & Chăm Sóc Sức Khỏe</option>
                      <option value="finance">Tài Chính & Ngân Hàng</option>
                      <option value="education">Giáo Dục & Đào Tạo</option>
                      <option value="retail">Bán Lẻ & Thương Mại</option>
                      <option value="manufacturing">Sản Xuất & Chế Tạo</option>
                      <option value="consulting">Tư Vấn & Dịch Vụ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="businessAddress">Địa Chỉ Doanh Nghiệp *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="businessAddress"
                    name="businessAddress"
                    placeholder="Nhập địa chỉ đầy đủ"
                    value={registerForm.businessAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="taxCode">Mã Số Thuế *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="taxCode"
                    name="taxCode"
                    placeholder="Nhập mã số thuế"
                    value={registerForm.taxCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Thông Tin Liên Hệ</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Họ *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Nhập họ"
                      value={registerForm.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Tên *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Nhập tên"
                      value={registerForm.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Doanh Nghiệp *</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Nhập email doanh nghiệp"
                    value={registerForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <small className="form-help">Tài khoản và mật khẩu sẽ được gửi về email này sau khi admin duyệt</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số Điện Thoại *</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    value={registerForm.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={registerForm.agreeTerms}
                  onChange={handleInputChange}
                  required
                />
                <span className="checkmark"></span>
                Tôi đồng ý với <a href="#" className="terms-link">Điều Khoản Sử Dụng</a> và{' '}
                <a href="#" className="terms-link">Chính Sách Bảo Mật</a>
              </label>
            </div>

            <button type="submit" className="register-btn" disabled={isLoading || !isFormValid()}>
              {isLoading ? <div className="loading-spinner"></div> : <span>Gửi Đăng Ký</span>}
            </button>

            <div className="signin-link">
              <p>Đã có tài khoản? <a href="/auth/sign-in">Đăng nhập</a></p>
            </div>
          </form>
        </div>

        <div className="register-info-section">
          <div className="info-content">
            <div className="upload-section">
              <h3 className="section-title">Giấy Phép Kinh Doanh</h3>
              <p className="section-description">Tải lên giấy phép kinh doanh để xác minh doanh nghiệp của bạn</p>
              
              <div className="form-group">
                <label htmlFor="licenseFile">Tải Lên Giấy Phép Kinh Doanh *</label>
                <div className="file-upload-wrapper">
                  <div 
                    className={`file-upload-area ${registerForm.licenseFile ? 'has-file' : ''}`}
                    onClick={() => document.getElementById('licenseFile')?.click()}
                  >
                    <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#FFA463" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 8L12 3L7 8" stroke="#FFA463" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3V15" stroke="#FFA463" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="upload-text">
                      <span className="upload-title">Tải lên file giấy phép kinh doanh</span>
                      <span className="upload-subtitle">Hỗ trợ: PDF, JPG, PNG (Tối đa 10MB)</span>
                    </div>
                    <input
                      type="file"
                      id="licenseFile"
                      name="licenseFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      required
                    />
                  </div>
                  {registerForm.licenseFile && (
                    <div className="file-info">
                      <div className="file-details">
                        <svg className="file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="file-name">{registerForm.licenseFile.name}</span>
                        <span className="file-size">{formatFileSize(registerForm.licenseFile.size)}</span>
                      </div>
                      <button type="button" className="remove-file" onClick={removeFile} title="Xóa file">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="plan-section">
              <h3 className="section-title">Chọn Gói Dịch Vụ</h3>
              <p className="section-description">Chọn gói phù hợp với nhu cầu doanh nghiệp của bạn</p>
              
              <div className="plan-options">
                {availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-option ${registerForm.selectedPlan === plan.id ? 'selected' : ''}`}
                    onClick={() => selectPlan(plan.id)}
                  >
                    <div className="plan-header">
                      <h4>{plan.name}</h4>
                      <div className="plan-price">
                        <span className="currency">VND</span>
                        <span className="amount">
                          {new Intl.NumberFormat('vi-VN').format(
                            registerForm.yearlyBilling 
                              ? plan.price * 12 * 0.8  // 20% discount for yearly billing
                              : plan.price
                          )}
                        </span>
                        <span className="period">/{registerForm.yearlyBilling ? 'năm' : 'tháng'}</span>
                      </div>
                    </div>
                    <p className="plan-description">{plan.description}</p>
                    <div className="plan-features">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <svg className="feature-check" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="billing-toggle">
                <span>Thanh toán theo tháng</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={registerForm.yearlyBilling}
                    onChange={(e) => setRegisterForm(prev => ({
                      ...prev,
                      yearlyBilling: e.target.checked
                    }))}
                  />
                  <span className="slider"></span>
                </label>
                <span>Thanh toán theo năm <span className="save-badge">Tiết kiệm 20%</span></span>
              </div>
            </div>

            <div className="process-section">
              <h3 className="section-title">Quy Trình Đăng Ký</h3>
              <div className="process-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Điền thông tin</h4>
                    <p>Điền đầy đủ thông tin doanh nghiệp và tải lên giấy phép kinh doanh</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Admin xem xét</h4>
                    <p>Admin sẽ xem xét và duyệt hồ sơ trong vòng 24-48 giờ</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Nhận tài khoản</h4>
                    <p>Tài khoản và mật khẩu sẽ được gửi về email của bạn</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Bắt đầu sử dụng</h4>
                    <p>Bạn có thể đăng nhập và đổi mật khẩu sau đó</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
