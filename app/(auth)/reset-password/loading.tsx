import "@/app/styles/reset-password.scss";

export default function Loading() {
  return (
    <div className="reset-password__loading">
      <div className="reset-password__loading-container">
        <div className="reset-password__loading-content">
          <div className="reset-password__loading-spinner"></div>
          <h2 className="reset-password__loading-title">
            Loading password reset page...
          </h2>
          <p className="reset-password__loading-text">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
}
