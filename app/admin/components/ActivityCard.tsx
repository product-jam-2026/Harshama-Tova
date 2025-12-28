import React from 'react';
import { COMMUNITY_STATUSES } from '@/lib/constants';

interface ActivityCardProps {
  id: string;
  title: string;
  time: string;
  mentor: string | null;
  audience: string[];
  type: 'Group' | 'Workshop'; // To determine the color theme
}

export default function ActivityCard({ 
  title, 
  time, 
  mentor, 
  audience, 
  type 
}: ActivityCardProps) {

  // --- Format Audience String ---
  const formatAudience = (statuses: string[]) => {
    
    if (!statuses || statuses.length === 0) return;

    // If all possible statuses are selected
    if (statuses.length === COMMUNITY_STATUSES.length) {
      return 'מתאים לכולם'; // "Suitable for everyone"
    }

    // Map the values to Hebrew labels
    return statuses.map((statusValue) => {
      const statusObj = COMMUNITY_STATUSES.find(s => s.value === statusValue);
      return statusObj ? statusObj.label : statusValue;
    }).join(', ');
  };

  const audienceLabel = formatAudience(audience);

  // --- Define colors based on activity type ---
  const themeColor = type === 'Group' ? '#8b5cf6' : '#0d9488'; 
  const bgColor = type === 'Group' ? '#f5f3ff' : '#f0fdfa';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch', // Stretch vertically to fill the colored strip
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', // Very subtle shadow
      marginBottom: '12px',
      overflow: 'hidden', // Important for border radius
      border: '1px solid #f0f0f0',
      transition: 'transform 0.2s ease',
      cursor: 'default'
    }}>
      
      {/* Colored Identifier Strip (Right side in RTL) */}
      <div style={{ width: '6px', backgroundColor: themeColor, flexShrink: 0 }}></div>

      {/* Card Content */}
      <div style={{ 
        flex: 1, 
        padding: '16px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        
        {/* Right Side: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          {/* Title + Type Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>
              {title}
            </span>
            <span style={{ 
              fontSize: '11px', 
              padding: '2px 8px', 
              borderRadius: '10px', 
              backgroundColor: bgColor, 
              color: themeColor,
              fontWeight: '600'
            }}>
              {type === 'Group' ? 'קבוצה' : 'סדנה'}
            </span>
          </div>

          {/* Target Audience */}
          <span style={{ fontSize: '13px', color: '#888' }}>
            {audienceLabel}
          </span>

          {/* Mentor (with small icon) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px' }}>👤</span>
            <span style={{ fontSize: '13px', color: '#555', fontWeight: '500' }}>
              {mentor || 'לא צוין מנחה'}
            </span>
          </div>
        </div>

        {/* Left Side: Time */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '10px',
          borderRadius: '8px',
          minWidth: '60px',
          border: '1px solid #eee'
        }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', lineHeight: '1' }}>
            {time}
          </span>
        </div>

      </div>
    </div>
  );
}