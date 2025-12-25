import GroupForm from "../components/GroupForm";

export default function CreateGroupPage() {
  return (
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>יצירת קבוצה חדשה</h1>
      {/* Render the shared form without props (Create Mode) */}
      <GroupForm />
    </div>
  );
}