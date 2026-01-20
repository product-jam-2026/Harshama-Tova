'use client'; 

import { useState } from "react";
import Link from "next/link"; 
import AdminGroupCard, { Group } from "../components/AdminGroupCard"; 
import Tabs, { TabOption } from "@/components/Tabs/Tabs";
import { Plus } from "lucide-react"; 
import { hasGroupEnded } from "@/lib/utils/date-utils";
import styles from './GroupsManager.module.css';

interface GroupsManagerProps {
  groups: Group[];
  onEdit?: (group: Group) => void;
}

export default function GroupsManager({ groups, onEdit }: GroupsManagerProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'active' | 'ended'>('open');
  const now = new Date();

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
    return regEndDate <= now && !hasGroupEnded(group.date, group.meetings_count, group.meeting_time);
  });

  // 3. Ended Groups (Time passed):
  const endedGroups = groups.filter((group) => {
    if (group.status === 'ended') return true;
    
    // Condition: Registration ended AND the group duration has finished
    const regEndDate = new Date(group.registration_end_date);
    
    return group.status === 'open' && regEndDate <= now && hasGroupEnded(group.date, group.meetings_count, group.meeting_time);
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

  // Define tab options dynamically to include counts
  const tabOptions: TabOption[] = [
    { label: 'פתוחות לרישום', value: 'open', count: openGroups.length },
    { label: 'פעילות', value: 'active', count: activeGroups.length },
    { label: 'הסתיימו', value: 'ended', count: endedGroups.length },
  ];

  return (
    <div>
        {/* Header with "Create" Button */}
        <div className={styles.header}>
            <Link href="/admin/groups/new">
                <button className="add-new-button">
                    יצירת קבוצה חדשה
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

      {/* Group card list */}
      <div>
        {displayedGroups.length > 0 ? (
          <div className={styles.groupsList}>
            {displayedGroups.map((group) => (
              <AdminGroupCard 
                key={group.id} 
                group={group}
                pendingCount={group.pending_count}
                onEdit={onEdit ? () => onEdit(group) : undefined} 
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
              אין קבוצות בסטטוס זה כרגע.
          </p>
        )}
      </div>
    </div>
  );
}