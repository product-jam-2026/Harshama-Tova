import Link from "next/link";
import Badge from "@/components/Badges/Badge"; 
import styles from "./GroupRequestCard.module.css";

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
      <div className={styles.card}>
        {/* Group Info: Image + Name */}
        <div className={styles.groupInfo}>
          
          <div className={styles.imageContainer}>
            {imageUrl ? (
                <img src={imageUrl} alt={groupName} className={styles.image} />
            ) : (
                // Fallback if no image
                <div className={styles.noImage}>
                    אין תמונה
                </div>
            )}
          </div>
          
          <span className={styles.groupName}>{groupName}</span>
        </div>

        {/* Badge: Number of requests */}
        <Badge variant="blue">
             {requestCount} בקשות ממתינות
        </Badge>

      </div>
    </Link>
  );
}