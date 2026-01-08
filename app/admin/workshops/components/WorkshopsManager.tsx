'use client'; 

import { useState } from "react";
import Link from "next/link";
import AdminWorkshopCard, { Workshop } from "./AdminWorkshopCard"; 
import Button from "@/components/buttons/Button";
import Tabs, { TabOption } from "@/components/Tabs/Tabs";
import { Plus } from "lucide-react"; 

interface WorkshopsManagerProps {
  workshops: Workshop[];
  onEdit?: (workshop: Workshop) => void;
}

export default function WorkshopsManager({ workshops, onEdit }: WorkshopsManagerProps) {
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

  // Define tab options dynamically to include counts
  const tabOptions: TabOption[] = [
    { label: 'מתוכננות', value: 'open', count: openWorkshops.length },
    { label: 'עברו', value: 'past', count: pastWorkshops.length },
  ];

  return (
    <div>
        {/* Header with "Create" Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>            
            <Link href="/admin/workshops/new">
                <Button 
                    variant="primary" 
                    // Inline style to create the "Tile" look (Icon above text)
                    style={{
                        flexDirection: 'column', 
                        height: 'auto',          
                        padding: '10px 20px',    
                        borderRadius: '20px',    
                        gap: '4px',
                        width: 'auto' 
                    }}
                    icon={<Plus size={24} color="white" />}
                >
                    <span style={{ fontSize: '14px' }}>סדנה</span>
                </Button>
            </Link>
        </div>

      {/* Reusable Tabs Component */}
      <Tabs 
        options={tabOptions} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Workshop card list */}
      <div>
        {displayedWorkshops.length > 0 ? (
          <div>
            {displayedWorkshops.map((workshop) => (
              <AdminWorkshopCard 
                key={workshop.id} 
                workshop={workshop}
                onEdit={onEdit ? () => onEdit(workshop) : undefined}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
             אין סדנאות בסטטוס זה כרגע.
          </p>
        )}
      </div>
    </div>
  );
}