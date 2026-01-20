'use client'; 

import { useState } from "react";
import Link from "next/link";
import AdminWorkshopCard, { Workshop } from "./AdminWorkshopCard"; 
import Tabs, { TabOption } from "@/components/Tabs/Tabs";
import { Plus } from "lucide-react"; 
import styles from '@/app/admin/groups/components/GroupsManager.module.css';

interface WorkshopsManagerProps {
  workshops: Workshop[];
  onEdit?: (workshop: Workshop) => void;
}

export default function WorkshopsManager({ workshops = [], onEdit }: WorkshopsManagerProps) {
  // Upcoming (Open) or Past (Ended)
  const [activeTab, setActiveTab] = useState<'open' | 'past'>('open');
  const now = new Date();

  // --- Helper function: Check if workshop date AND start time have passed ---
  const isWorkshopPassed = (workshop: Workshop) => {
    if (!workshop.date) return false;
    
    // Create a Date object from the date string (defaults to 00:00:00)
    const workshopDateTime = new Date(workshop.date);

    // If a specific meeting time exists, set the hours and minutes
    if (workshop.meeting_time) {
        const [hours, minutes] = workshop.meeting_time.split(':').map(Number);
        workshopDateTime.setHours(hours, minutes, 0, 0);
    } else {
        // If no time is specified, assume end of day so it stays "Open" all day
        workshopDateTime.setHours(23, 59, 59, 999);
    }

    // Returns true only if the current time is strictly after the workshop start time
    return now > workshopDateTime;
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
        <div className={styles.header}>            
            <Link href="/admin/workshops/new">
                <button className="add-new-button">
                    יצירת סדנה חדשה
                    <Plus size={20} />
                </button>
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
          <div className={styles.groupsList}>
            {displayedWorkshops.map((workshop) => (
              <AdminWorkshopCard 
                key={workshop.id} 
                workshop={workshop}
                onEdit={onEdit ? () => onEdit(workshop) : undefined}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
              אין סדנאות בסטטוס זה כרגע.
          </p>
        )}
      </div>
    </div>
  );
}