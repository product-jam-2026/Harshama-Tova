import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { saveUserCommunityStatus } from '../actions';
import Link from 'next/link';
import { COMMUNITY_STATUSES } from "@/lib/constants";

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

  // Ensure we treat existing data as an array
  const existingStatuses: string[] = userData?.community_status || [];

  async function handleSubmit(formData: FormData) {
    'use server';
    
    // Retrieve ALL selected values as an array
    const communityStatuses = formData.getAll('communityStatus') as string[];

    // Validation: Ensure at least one is selected
    if (communityStatuses.length === 0) {
      return;
    }

    // Call the server action with the array
    const result = await saveUserCommunityStatus(communityStatuses);
    
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
      <p style={{ marginBottom: '30px' }}>בחרו את המצב/ים המתאר/ים אתכם בצורה הטובה ביותר</p>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Checkbox List */}
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
                            name="communityStatus" // All checkboxes share the same name to be collected via getAll
                            value={status.value}
                            defaultChecked={isChecked}
                            style={{ width: '18px', height: '18px', accentColor: 'black' }}
                        />
                        <span style={{ fontSize: '16px' }}>{status.label}</span>
                    </label>
                );
            })}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px' }}>
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