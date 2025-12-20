import "@/app/styles/confirm-email.scss";

export default function Loading() {
  return (
    <div className="confirm-email__loading">
      <div className="confirm-email__loading-container">
        <div className="confirm-email__loading-content">
          <div className="confirm-email__loading-spinner"></div>
          <h2 className="confirm-email__loading-title">
            Loading email confirmation page...
          </h2>
          <p className="confirm-email__loading-text">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
}
