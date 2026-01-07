import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { saveUserNames } from './actions';

export default async function RegistrationPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Check if user already completed registration
  const { data: userData } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  // If user already has names, redirect to next step (will be implemented later)
  // For now, we'll allow them to update

  async function handleSubmit(formData: FormData) {
    'use server';
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    if (!firstName || !lastName) {
      return;
    }

    const result = await saveUserNames(firstName, lastName);
    
    if (result.success) {
      redirect('/registration/step2');
    } else {
      // If there's an error, stay on the page (error handling can be added later)
      console.error('Error saving names:', result.error);
    }
  }

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <span>שלב 1 מתוך 5</span>
      </div>

      <h1 style={{ marginBottom: '10px' }}>בואו נכיר</h1>
      <p style={{ marginBottom: '30px' }}>נשמח להכיר אתכם יותר טוב</p>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="firstName" style={{ display: 'block', marginBottom: '8px' }}>
            שם פרטי
          </label>
          <input
            type="text"
            name="firstName"
            required
            defaultValue={userData?.first_name || ''}
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
            required
            defaultValue={userData?.last_name || ''}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

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
          המשך
        </button>
      </form>
    </div>
  );
}

