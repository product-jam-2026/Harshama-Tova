import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { updateUserProfile } from '../actions';
import Link from 'next/link';
import { COMMUNITY_STATUSES, GENDERS } from '@/lib/constants';

export default async function EditProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get existing user data
  const { data: userData } = await supabase
    .from('users')
    .select('first_name, last_name, age, birth_date, gender, phone_number, city, community_status')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/participants');
  }

  // Ensure community_status is an array
  const existingStatuses: string[] = userData.community_status || [];

  async function handleSubmit(formData: FormData) {
    'use server';
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const city = formData.get('city') as string;
    const birthDate = formData.get('birthDate') as string;
    const gender = formData.get('gender') as string;
    const communityStatuses = formData.getAll('communityStatus') as string[];

    const result = await updateUserProfile({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      city: city || undefined,
      birthDate: birthDate || undefined,
      gender: gender || undefined,
      communityStatus: communityStatuses.length > 0 ? communityStatuses : undefined,
    });
    
    if (result.success) {
      redirect('/participants/profile');
    }
  }

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>ערוך פרטים</h1>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="firstName" style={{ display: 'block', marginBottom: '8px' }}>
            שם פרטי
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            defaultValue={userData.first_name || ''}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="lastName" style={{ display: 'block', marginBottom: '8px' }}>
            שם משפחה
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            defaultValue={userData.last_name || ''}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px' }}>
            טלפון
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            defaultValue={userData.phone_number || ''}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="city" style={{ display: 'block', marginBottom: '8px' }}>
            עיר/יישוב
          </label>
          <input
            type="text"
            name="city"
            id="city"
            defaultValue={userData.city || ''}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="birthDate" style={{ display: 'block', marginBottom: '8px' }}>
            תאריך לידה
          </label>
          <input
            type="date"
            name="birthDate"
            id="birthDate"
            max={new Date().toISOString().split('T')[0]}
            defaultValue={userData.birth_date ? new Date(userData.birth_date).toISOString().split('T')[0] : ''}
            lang="en"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            מגדר
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GENDERS.map((option) => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: userData.gender === option.value ? '#e3f2fd' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  defaultChecked={userData.gender === option.value}
                  style={{ marginLeft: '10px' }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            הסטטוס הקהילתי שלכם
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {COMMUNITY_STATUSES.map((status) => {
              const isChecked = existingStatuses.includes(status.value);
              
              return (
                <label
                  key={status.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#fff'
                  }}
                >
                  <input
                    type="checkbox"
                    name="communityStatus"
                    value={status.value}
                    defaultChecked={isChecked}
                    style={{ width: '18px', height: '18px', accentColor: 'black' }}
                  />
                  <span style={{ fontSize: '16px' }}>{status.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px' }}>
          <Link
            href="/participants/profile"
            style={{
              padding: '12px 24px',
              backgroundColor: '#f0f0f0',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            ביטול
          </Link>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            שמור שינויים
          </button>
        </div>
      </form>

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

