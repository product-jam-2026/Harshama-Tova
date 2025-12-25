import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { saveUserAgeAndGender } from '../actions';
import Link from 'next/link';

const GENDER_OPTIONS = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'other', label: 'אחר / מעדיף/ה לא לציין' },
];

export default async function RegistrationStep5Page() {
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
    .select('age, gender')
    .eq('id', user.id)
    .maybeSingle();

  async function handleSubmit(formData: FormData) {
    'use server';
    const age = formData.get('age') as string;
    const gender = formData.get('gender') as string;

    if (!gender) {
      return;
    }

    const result = await saveUserAgeAndGender(age, gender);
    
    if (result.success) {
      // Registration completed - redirect to home page
      redirect('/participants');
    }
  }

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <span>שלב 5 מתוך 5</span>
      </div>

      <h1 style={{ marginBottom: '10px' }}>פרטים נוספים</h1>
      <p style={{ marginBottom: '30px' }}>כדי להתאים לכם את החוויה הטובה ביותר</p>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="age" style={{ display: 'block', marginBottom: '8px' }}>
            גיל
          </label>
          <input
            type="number"
            name="age"
            min="0"
            max="120"
            placeholder="הקלידו את הגיל שלכם"
            defaultValue={userData?.age || ''}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="gender" style={{ display: 'block', marginBottom: '8px' }}>
            מגדר
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GENDER_OPTIONS.map((option) => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: userData?.gender === option.value ? '#e3f2fd' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  required
                  defaultChecked={userData?.gender === option.value}
                  style={{ marginLeft: '10px' }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <Link
            href="/registration/step4"
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
            חזור
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
            סיום
          </button>
        </div>
      </form>
    </div>
  );
}

