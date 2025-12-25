import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { saveUserCommunityStatus } from '../actions';
import Link from 'next/link';

const COMMUNITY_STATUSES = [
  { value: 'survivors', label: 'שורדי ושורדות המסיבות' },
  { value: 'parents', label: 'הורים שכולים' },
  { value: 'families', label: 'משפחות וקרובים של פצועי טראומה' },
  { value: 'otef', label: 'תושבי העוטף ומפונים' },
  { value: 'trauma_victims', label: 'נפגעי טראומה מה7.10 ומהמלחמה' },
  { value: 'siblings', label: 'אחים.ות שכולים' },
  { value: 'distant_circle', label: 'מעגל שני ושלישי של משפחות השכול' },
];

export default async function RegistrationStep4Page() {
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
    .select('community_status')
    .eq('id', user.id)
    .maybeSingle();

  async function handleSubmit(formData: FormData) {
    'use server';
    const communityStatus = formData.get('communityStatus') as string;

    if (!communityStatus) {
      return;
    }

    const result = await saveUserCommunityStatus(communityStatus);
    
    if (result.success) {
      // Redirect to next step (will be implemented later)
      redirect('/registration/step5');
    }
  }

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <span>שלב 4 מתוך 5</span>
      </div>

      <h1 style={{ marginBottom: '10px' }}>הסטטוס הקהילתי שלכם</h1>
      <p style={{ marginBottom: '30px' }}>בחרו את המצב המתאר אתכם בצורה הטובה ביותר</p>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="communityStatus" style={{ display: 'block', marginBottom: '8px' }}>
            בחרו מהרשימה
          </label>
          <select
            name="communityStatus"
            required
            defaultValue={userData?.community_status || ''}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="" disabled>בחרו מהרשימה</option>
            {COMMUNITY_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <Link
            href="/registration/step3"
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

