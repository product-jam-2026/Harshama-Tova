import WorkshopForm from "../components/WorkshopForm";

export default function CreateWorkshop() {
  return (
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>יצירת סדנה חדשה</h1>
       {/* Render the shared form without initial data (Create Mode) */}
      <WorkshopForm />
    </div>
  );
}