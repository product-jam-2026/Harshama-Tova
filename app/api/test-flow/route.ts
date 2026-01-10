import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { createNotification } from '@/app/participants/notifications/actions'; // הפונקציה המקורית מהמערכת

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'לא מחובר' });

  // אנחנו קוראים לפונקציה האמיתית של המערכת!
  // זה מדמה מצב שבו המנהלת אישרה את ההרשמה שלך
  const result = await createNotification(
    user.id,
    'group_approved', // סוג ההודעה
    'מזל טוב! זוהי בדיקת מערכת אמיתית דרך השרת 🎉', // ההודעה
    undefined // אין ID אמיתי של קבוצה, זה בסדר
  );

  return NextResponse.json({ result });
}