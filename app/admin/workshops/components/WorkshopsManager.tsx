'use client'; 

import { useState } from "react";
import Link from "next/link";
import AdminWorkshopCard, { Workshop } from "./AdminWorkshopCard"; 
import PlusButton from "@/components/buttons/PlusButton";

export default function WorkshopsManager({ workshops }: { workshops: Workshop[] }) {
  // Upcoming (Open) or Past (Ended)
  const [activeTab, setActiveTab] = useState<'open' | 'past'>('open');
  const now = new Date();

  // --- Helper function: Check if workshop date has passed ---
  const isWorkshopPassed = (workshop: Workshop) => {
    if (!workshop.date) return false;
    
    // Check if the workshop date is in the past
    const workshopDate = new Date(workshop.date);
    return now > workshopDate;
  };

  // 1. Open/Upcoming Workshops (Future date OR Drafts):
  const openWorkshops = workshops.filter((workshop) => {
    if (workshop.status === 'draft') return true;

    // Condition: Not ended AND date hasn't passed yet
    return workshop.status !== 'ended' && !isWorkshopPassed(workshop);
  });

  // 2. Past Workshops (Date passed OR status is ended):
  const pastWorkshops = workshops.filter((workshop) => {
      if (workshop.status === 'draft') return false;    // Exclude drafts

    // Condition: Status is ended OR date has passed
    return workshop.status === 'ended' || isWorkshopPassed(workshop);
  });

  // Helper to select the list to display based on active tab
  const getDisplayList = () => {
    switch (activeTab) {
      case 'open': return openWorkshops;
      case 'past': return pastWorkshops;
      default: return [];
    }
  };

  const displayedWorkshops = getDisplayList();

  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ניהול סדנאות</h1>
            
            <PlusButton 
              href="/admin/workshops/create" 
              label="צור סדנה חדשה" 
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
          מתוכננות ({openWorkshops.length})
        </button>

        <button 
          onClick={() => setActiveTab('past')}
          style={{ 
            padding: '10px', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'past' ? 'bold' : 'normal',
            borderBottom: activeTab === 'past' ? '2px solid black' : 'none',
            color: activeTab === 'past' ? 'black' : '#666'
          }}
        >
          עברו ({pastWorkshops.length})
        </button>
      </div>

      {/* Workshop card list */}
      <div>
        {displayedWorkshops.length > 0 ? (
          <div>
            {displayedWorkshops.map((workshop) => (
              <AdminWorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
             אין סדנאות בסטטוס זה כרגע.
          </p>
        )}
      </div>
    </div>
  );
}