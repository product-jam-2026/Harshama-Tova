import Link from "next/link";

interface GroupRequestCardProps {
  groupId: string;
  groupName: string;
  imageUrl: string | null;
  requestCount: number;
}

export default function GroupRequestCard({ 
  groupId, 
  groupName, 
  imageUrl, 
  requestCount 
}: GroupRequestCardProps) {
  
  return (
    <Link 
      href={`/admin/requests/${groupId}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '10px', 
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        cursor: 'pointer',
        transition: '0.2s',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }}>
        {/* Group Info: Image + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '50%', overflow: 'hidden' }}>
            {imageUrl ? (
                <img src={imageUrl} alt={groupName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                // Fallback if no image
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '20px' }}>
                    אין תמונה
                </div>
            )}
          </div>
          
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{groupName}</span>
        </div>

        {/* Badge: Number of requests */}
        <div style={{ background: '#ef4444', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
          {requestCount} בקשות ממתינות
        </div>
      </div>
    </Link>
  );
}