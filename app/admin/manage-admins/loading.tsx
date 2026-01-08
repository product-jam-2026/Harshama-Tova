import Spinner from "@/components/Spinner/Spinner";

export default function Loading() {
  return (
    <div className="loading-container">
      <Spinner label="טוען מנהלים..." />
    </div>
  );
}