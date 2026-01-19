export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner-simple" />
      <p style={{ marginTop: 12, fontFamily: 'var(--font-body)', color: 'var(--text-dark-2)' }}>טוען מנהלים...</p>
    </div>
  );
}