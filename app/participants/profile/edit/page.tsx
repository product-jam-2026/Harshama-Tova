import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { updateUserProfile } from '../actions';
import Link from 'next/link';
import BackButton from '@/components/buttons/BackButton';
import { COMMUNITY_STATUSES, GENDERS } from '@/lib/constants';
import formStyles from '@/styles/Form.module.css';
import editStyles from './EditProfile.module.css';
import Button from '@/components/buttons/Button';

export default async function EditProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/?screen=last');
  }

  // Get existing user data
  const { data: userData } = await supabase
    .from('users')
    .select('first_name, last_name, age, birth_date, gender, phone_number, city, community_status, comments')
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
    const commentsRaw = formData.get('comments') as string | null;
    const comments = commentsRaw ?? '';

    const result = await updateUserProfile({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      city: city || undefined,
      birthDate: birthDate || undefined,
      gender: gender || undefined,
      communityStatus: communityStatuses.length > 0 ? communityStatuses : undefined,
      comments, 
    });
    
    if (result.success) {
      redirect('/participants/profile');
    }
  }

  return (
    <div dir="rtl" className={formStyles.formPage} style={{ paddingBottom: '80px' }}>
      <div className={editStyles.backLinkWrap}>
        <BackButton href="/participants/profile" />
      </div>

      <div className={formStyles.formHeader}>
        <h1 className={formStyles.formTitle}>ערוך פרטים</h1>
      </div>

      <form action={handleSubmit} className={formStyles.formStack}>
        <div className={formStyles.formField}>
          <label htmlFor="firstName" className={formStyles.formLabel}>
            שם פרטי
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            defaultValue={userData.first_name || ''}
            className={formStyles.inputField}
          />
        </div>

        <div className={formStyles.formField}>
          <label htmlFor="lastName" className={formStyles.formLabel}>
            שם משפחה
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            defaultValue={userData.last_name || ''}
            className={formStyles.inputField}
          />
        </div>

        <div className={formStyles.formField}>
          <label htmlFor="phone" className={formStyles.formLabel}>
            טלפון
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            defaultValue={userData.phone_number || ''}
            className={formStyles.inputField}
          />
        </div>

        <div className={formStyles.formField}>
          <label htmlFor="city" className={formStyles.formLabel}>
            עיר/יישוב
          </label>
          <input
            type="text"
            name="city"
            id="city"
            defaultValue={userData.city || ''}
            className={formStyles.inputField}
          />
        </div>

        <div className={formStyles.formField}>
          <label htmlFor="birthDate" className={formStyles.formLabel}>
            תאריך לידה
          </label>
          <input
            type="date"
            name="birthDate"
            id="birthDate"
            max={new Date().toISOString().split('T')[0]}
            defaultValue={userData.birth_date ? new Date(userData.birth_date).toISOString().split('T')[0] : ''}
            lang="en"
            className={formStyles.inputField}
          />
        </div>

        <div className={formStyles.formField}>
          <label className={formStyles.formLabel}>מגדר</label>
          <div className={editStyles.optionsGroup}>
            {GENDERS.map((option) => (
              <label
                key={option.value}
                className={`${editStyles.optionCard} ${userData.gender === option.value ? editStyles.optionCardSelected : ''}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  defaultChecked={userData.gender === option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={formStyles.formField}>
          <label className={formStyles.formLabel}>הסטטוס הקהילתי שלכם</label>
          <div className={editStyles.optionsGroup}>
            {COMMUNITY_STATUSES.map((status) => {
              const isChecked = existingStatuses.includes(status.value);
              return (
                <label key={status.value} className={editStyles.optionCard}>
                  <input
                    type="checkbox"
                    name="communityStatus"
                    value={status.value}
                    defaultChecked={isChecked}
                  />
                  <span>{status.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className={formStyles.formTextareaContainer}>
          <label htmlFor="comments" className={formStyles.formLabel}>
            חשוב לי שתדעו
          </label>
          <textarea
            name="comments"
            id="comments"
            rows={4}
            defaultValue={userData.comments || ''}
            placeholder="אנחנו כאן לכל דבר..."
            className={`${formStyles.inputField} ${editStyles.commentsTextarea}`}
          />
        </div>

        <div className={formStyles.buttonsRow}>
          <Button variant='primary' type="submit">
            שמור שינויים
          </Button>
          <Link href="/participants/profile" className={editStyles.cancelBtn}>
            ביטול
          </Link>
        </div>
      </form>
    </div>
  );
}