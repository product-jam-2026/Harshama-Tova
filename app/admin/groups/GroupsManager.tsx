'use client'; 

import { useState } from "react";
import Link from "next/link";
import AdminGroupCard, { Group } from "./AdminGroupCard"; // Import the card component and the type definition

export default function GroupsManager({ groups }: { groups: Group[] }) {
  const [activeTab, setActiveTab] = useState<'open' | 'active' | 'closed'>('open');
  const now = new Date();

  // 1. Open Groups (including Drafts):
  // Status is 'draft' OR (Status is 'open' AND registration deadline has not passed)
  const openGroups = groups.filter((group) => {
    const regEndDate = new Date(group.registration_end_date);
    
    // If it's a draft, include it here
    if (group.status === 'draft') return true;

    // If it's open and registration is still valid
    return group.status === 'open' && regEndDate > now;
  });

  // 2. Active Groups:
  // Status is 'active' OR (Status was 'open' but registration deadline passed)
  const activeGroups = groups.filter((group) => {
    const regEndDate = new Date(group.registration_end_date);
    const isRegistrationOver = regEndDate <= now;
    
    // Prevent drafts and closed groups from appearing here
    if (group.status === 'draft' || group.status === 'closed') return false;

    return group.status === 'active' || isRegistrationOver;
  });

  // 3. Closed Groups:
  const closedGroups = groups.filter((group) => group.status === 'closed');

  // Helper to select the list to display based on active tab
  const getDisplayList = () => {
    switch (activeTab) {
      case 'open': return openGroups;
      case 'active': return activeGroups;
      case 'closed': return closedGroups;
      default: return [];
    }
  };

  const displayedGroups = getDisplayList();

  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>עמוד ניהול קבוצות</h1>
            
            <Link href="/admin/groups/new">
                <button style={{ padding: '10px 20px', cursor: 'pointer', background: 'black', color: 'white', border: 'none', borderRadius: '5px' }}>
                +
                </button>
            </Link>
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
          פתוחות ({openGroups.length})
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
          onClick={() => setActiveTab('closed')}
          style={{ 
            padding: '10px', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'closed' ? 'bold' : 'normal',
            borderBottom: activeTab === 'closed' ? '2px solid black' : 'none',
            color: activeTab === 'closed' ? 'black' : '#666'
          }}
        >
          סגורות ({closedGroups.length})
        </button>
      </div>

      {/* Group card */}
      <div>
        {displayedGroups.length > 0 ? (
          <div>
            {displayedGroups.map((group) => (
              <AdminGroupCard key={group.id} group={group} />
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