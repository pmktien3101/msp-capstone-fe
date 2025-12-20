import "@/app/styles/forgot-password.scss";

export default function Loading() {
  return (
    <div className="forgot-password__loading">
      <div className="forgot-password__loading-container">
        <div className="forgot-password__loading-content">
          <div className="forgot-password__loading-spinner"></div>
          <h2 className="forgot-password__loading-title">
            Loading password recovery page...
          </h2>
          <p className="forgot-password__loading-text">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
}
