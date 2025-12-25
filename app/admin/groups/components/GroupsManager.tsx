'use client'; 

import { useState } from "react";
import Link from "next/link";
import AdminGroupCard, { Group } from "../components/AdminGroupCard"; 
import PlusButton from "@/components/buttons/PlusButton";

export default function GroupsManager({ groups }: { groups: Group[] }) {
  const [activeTab, setActiveTab] = useState<'open' | 'active' | 'ended'>('open');
  const now = new Date();

  // --- Helper function: Check if group is finished based on duration ---
  const isGroupFinished = (group: Group) => {
    // If start date or meetings count is missing, assume it's not finished
    if (!group.date || !group.meetings_count) return false;

    const startDate = new Date(group.date);
    const daysDuration = group.meetings_count * 7;
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysDuration);

    // Returns true if current date is after the calculated end date
    return now > endDate;
  };

  // 1. Open Groups (Registration is open + Drafts):
  const openGroups = groups.filter((group) => {
    // Include drafts in the Open tab
    if (group.status === 'draft') return true;

    const regEndDate = new Date(group.registration_end_date);
    
    // Condition: Status is open AND registration deadline hasn't passed
    return group.status === 'open' && regEndDate > now;
  });

  // 2. Active Groups (Registration closed, but meetings are ongoing):
  const activeGroups = groups.filter((group) => {
    // Exclude drafts
    if (group.status === 'draft') return false;

    const regEndDate = new Date(group.registration_end_date);
    
    // Condition: Registration ended, but the group duration hasn't finished yet
    return regEndDate <= now && !isGroupFinished(group);
  });

  // 3. Ended Groups (Time passed):
  const endedGroups = groups.filter((group) => {

    if (group.status === 'ended') return true;
    
    // Condition: Registration ended AND the group duration has finished
    const regEndDate = new Date(group.registration_end_date);
    return group.status === 'open' && regEndDate <= now && isGroupFinished(group);
  });

  // Helper to select the list to display based on active tab
  const getDisplayList = () => {
    switch (activeTab) {
      case 'open': return openGroups;
      case 'active': return activeGroups;
      case 'ended': return endedGroups;
      default: return [];
    }
  };

  const displayedGroups = getDisplayList();

  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>עמוד ניהול קבוצות</h1>
            
            <PlusButton 
              href="/admin/groups/new" 
              label="צור קבוצה חדשה" 
            />
        </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #eee' }}>
        <button 
          onClick={() => setActiveTab('open')}
          style={{ 
            padding: '10px', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'open' ? 'bold' : 'normal',
            borderBottom: activeTab === 'open' ? '2px solid black' : 'none',
            color: activeTab === 'open' ? 'black' : '#666'
          }}
        >
          פתוחות לרישום ({openGroups.length})
        </button>

        <button 
          onClick={() => setActiveTab('active')}
          style={{ 
            padding: '10px', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'active' ? 'bold' : 'normal',
            borderBottom: activeTab === 'active' ? '2px solid black' : 'none',
            color: activeTab === 'active' ? 'black' : '#666'
          }}
        >
          פעילות ({activeGroups.length})
        </button>

        <button 
          onClick={() => setActiveTab('ended')}
          style={{ 
            padding: '10px', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'ended' ? 'bold' : 'normal',
            borderBottom: activeTab === 'ended' ? '2px solid black' : 'none',
            color: activeTab === 'ended' ? 'black' : '#666'
          }}
        >
          הסתיימו ({endedGroups.length})
        </button>
      </div>

      {/* Group card list */}
      <div>
        {displayedGroups.length > 0 ? (
          <div>
            {displayedGroups.map((group) => (
              <AdminGroupCard 
                key={group.id} 
                group={group}
                pendingCount={group.pending_count} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
             אין קבוצות בסטטוס זה כרגע.
          </p>
        )}
      </div>
    </div>
  );
}