'use client'; // Client Component

import { useState } from "react";
import Link from "next/link";

// Define the shape of a Group object
interface Group {
  id: string;
  name: string;
  mentor: string;
  status: string;
  registration_end_date: string;
  created_at: string;
}

export default function GroupsManager({ groups }: { groups: Group[] }) {
  // State to track the currently active tab
  // Options: 'open', 'active', 'closed'
  const [activeTab, setActiveTab] = useState<'open' | 'active' | 'closed'>('open');

  const now = new Date();

  // 1. Open Groups - Open for Registration:
  // Status is not closed AND registration deadline has not passed yet
  const openGroups = groups.filter((group) => {
    const regEndDate = new Date(group.registration_end_date);
    return group.status !== 'closed' && regEndDate > now;
  });

  // 2. Active Groups - closed for Registration but still ongoing:
  // Status is 'active' OR Status is open but registration deadline has passed
  const activeGroups = groups.filter((group) => {
    const regEndDate = new Date(group.registration_end_date);
    const isRegistrationOver = regEndDate <= now;
    
    return group.status !== 'closed' && (group.status === 'active' || isRegistrationOver);
  });

  // 3. Closed Groups - the admin has closed the group (ended or decided to close):
  // Status is 'closed'
  const closedGroups = groups.filter((group) => group.status === 'closed');

  // Helper to determine which list to show based on state
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
        <div>
            <h1>עמוד ניהול קבוצות</h1>
            
            {/* Create New Group Button */}
            <Link href="/admin/groups/new">
                <button style={{cursor: 'pointer'}}>
                +
                </button>
            </Link>
        </div>

      {/* Tabs Navigation */}
      <div>
        <button 
          onClick={() => setActiveTab('open')}
          style={{ 
            padding: '10px', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'open' ? 'bold' : 'normal',
            borderBottom: activeTab === 'open' ? '2px solid black' : 'none'
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
            borderBottom: activeTab === 'active' ? '2px solid black' : 'none'
          }}
        >
          קבוצות פעילות ({activeGroups.length})
        </button>

        <button 
          onClick={() => setActiveTab('closed')}
          style={{ 
            padding: '10px', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'closed' ? 'bold' : 'normal',
            borderBottom: activeTab === 'closed' ? '2px solid black' : 'none'
          }}
        >
          קבוצות סגורות ({closedGroups.length})
        </button>
      </div>

      {/* Groups List */}
      <div>
        {displayedGroups.length > 0 ? (
          <ul>
            {displayedGroups.map((group) => (
              <li key={group.id}>
                <div>
                    <div>
                        <p><strong>{group.name}: </strong> מנחה- {group.mentor}</p>
                    </div>
                    {/* Placeholder for future Edit/Delete buttons */}
                    <div>
                        <button>עריכה</button>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#666' }}>אין קבוצות בסטטוס זה.</p>
        )}
      </div>
    </div>
  );
}