import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COMMUNITY_STATUSES, GENDERS } from '@/lib/constants';
import ProfileClient from './ProfileClient';
import styles from './Profile.module.css';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/?screen=last');
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('first_name, last_name, age, birth_date, gender, phone_number, city, community_status, comments')
    .eq('id', user.id)
    .single();

  // Get user email from auth
  const userEmail = user.email;

  if (!userData) {
    redirect('/participants');
  }

  // Get gender label
  const genderLabel = userData.gender ? (() => {
    const genderObj = GENDERS.find(g => g.value === userData.gender);
    return genderObj ? genderObj.label : userData.gender;
  })() : '';

  // Get community status labels
  const communityStatusLabel = userData.community_status && userData.community_status.length > 0
    ? userData.community_status.map((status: string) => {
        const statusObj = COMMUNITY_STATUSES.find(s => s.value === status);
        return statusObj ? statusObj.label : status;
      }).join(', ')
    : '';

  return (
    <Suspense
      fallback={
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinnerSimple} />
          <p className={styles.loadingText}>טוען...</p>
        </div>
      }
    >
      <ProfileClient
        userData={{
          ...userData,
          genderLabel,
          communityStatusLabel,
          email: userEmail
        }}
      />
    </Suspense>
  );
}