import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { saveUserCity } from '../actions';
import Link from 'next/link';

export default async function RegistrationStep3Page() {
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
    .select('city')
    .eq('id', user.id)
    .maybeSingle();

  async function handleSubmit(formData: FormData) {
    'use server';
    const city = formData.get('city') as string;

    if (!city) {
      return;
    }

    const result = await saveUserCity(city);
    
    if (result.success) {
      // Redirect to next step (will be implemented later)
      redirect('/registration/step4');
    }
  }

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <span>שלב 3 מתוך 5</span>
      </div>

      <h1 style={{ marginBottom: '10px' }}>מקום מגורים</h1>
      <p style={{ marginBottom: '30px' }}>לצורך התאמה ותיאום</p>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="city" style={{ display: 'block', marginBottom: '8px' }}>
            עיר/יישוב
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            defaultValue={userData?.city || ''}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <Link
            href="/registration/step2"
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
            המשך
          </button>
        </div>
      </form>
    </div>
  );
}

