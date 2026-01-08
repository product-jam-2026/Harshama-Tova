import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { COMMUNITY_STATUSES, GENDERS } from '@/lib/constants';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('first_name, last_name, age, birth_date, gender, phone_number, city, community_status')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/participants');
  }

  // Get gender label
  const getGenderLabel = (gender: string | null) => {
    if (!gender) return '';
    const genderObj = GENDERS.find(g => g.value === gender);
    return genderObj ? genderObj.label : gender;
  };

  // Get community status labels
  const getCommunityStatusLabels = (statuses: string[] | null) => {
    if (!statuses || statuses.length === 0) return '';
    return statuses.map(status => {
      const statusObj = COMMUNITY_STATUSES.find(s => s.value === status);
      return statusObj ? statusObj.label : status;
    }).join(', ');
  };

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'normal', color: '#666', margin: 0 }}>
          שלום,
        </h2>
        <h2 style={{ fontSize: '24px', fontWeight: 'normal', color: '#666', margin: '5px 0 0 0' }}>
          {userData.first_name || ''}
        </h2>
      </div>

      {/* Information Card */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        border: '1px solid #ddd'
      }}>

        {userData.age !== null && (
          <div style={{ marginBottom: '15px' }}>
            <strong>גיל:</strong> {userData.age}
          </div>
        )}
                
        {userData.gender && (
          <div style={{ marginBottom: '15px' }}>
            <strong>מין:</strong> {getGenderLabel(userData.gender)}
          </div>
        )}
        
        {userData.phone_number && (
          <div style={{ marginBottom: '15px' }}>
            <strong>טלפון:</strong> {userData.phone_number}
          </div>
        )}
        
        {userData.community_status && userData.community_status.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <strong>סטטוס:</strong> {getCommunityStatusLabels(userData.community_status)}
          </div>
        )}
        
        {userData.city && (
          <div style={{ marginBottom: '15px' }}>
            <strong>מיקום:</strong> {userData.city}
          </div>
        )}
      </div>

      {/* Edit Button */}
      <Link
        href="/participants/profile/edit"
        style={{
          display: 'block',
          padding: '12px 24px',
          backgroundColor: 'var(--color-secondary)',
          color: 'black',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          textDecoration: 'none',
          textAlign: 'center',
          width: 'fit-content',
          margin: '0 auto'
        }}
      >
        ערוך פרטים
      </Link>
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link
          href="/logout"
          style={{
            padding: '12px 24px',
            backgroundColor: '#f0f0f0',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            textDecoration: 'none',
            textAlign: 'center',
            marginRight: '10px'
          }}
        >
          התנתקות
        </Link>
      </div>
    </div>
  );
}