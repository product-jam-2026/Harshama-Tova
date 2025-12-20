import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Double security check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <h1>עמוד מנהלות - כאן יהיה את העמוד הראשי של המנהלות עם סרגל ניווט לעמודים: פניות, קבוצות, סדנאות</h1>
    </div>
  )
}