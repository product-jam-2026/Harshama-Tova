import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link"; // Component for client-side navigation

export default async function GroupsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch groups from the database to display in the list
  // Ordering by creation date (newest first)
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order('created_at', { ascending: false });

  return (
    <div dir="rtl">
      <h1>עמוד ניהול קבוצות</h1>

      {/* Link for the create new group form */}
      <div>
        <Link href="/admin/groups/new">
          <button style={{ cursor: 'pointer' }}>
            +
          </button>
        </Link>
      </div>

      <hr />

      {/* Temporary list to verify data fetching and display */}      
      {/* Check if groups exist and are not empty */}
      {groups && groups.length > 0 ? (
        <ul>
          {/* Loop through each group and render a list item */}
          {groups.map((group) => (
            <li key={group.id}>
              <strong>{group.name}</strong> - {group.mentor}
            </li>
          ))}
        </ul>
      ) : (
        <p>אין עדיין קבוצות</p>
      )}
    </div>
  );
}