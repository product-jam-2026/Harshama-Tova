import Spinner from "@/components/Spinner/Spinner";

export default function Loading() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      width: '100%',
      zIndex: 9999,
    }}>
      {/* With text*/}
      <Spinner label="טוען..." />
    </div>
  );
}