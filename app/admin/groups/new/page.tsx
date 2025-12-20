'use client';

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateGroup() {
  const router = useRouter();
  const supabase = createClient();
  
  // State for loading status and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission (page reload)
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    
    // Convert registration date to ISO format for the database
    const rawEndDate = formData.get("registration_end_date") as string;
    const endDateISO = rawEndDate ? new Date(rawEndDate).toISOString() : null;

    // Construct the group object matching DB columns
    const newGroup = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string, // Temporary: just a string URL for now
      mentor: formData.get("mentor") as string,
      date: formData.get("date") as string, 
      registration_end_date: endDateISO,
      max_participants: Number(formData.get("max_participants")),
      whatsapp_link: formData.get("whatsapp_link") as string,
      status: 'open',
    };

    // Insert data into Supabase
    const { error: insertError } = await supabase
      .from("groups")
      .insert([newGroup]);

    if (insertError) {
      console.error(insertError);
      setError("Error creating group: " + insertError.message);
      setLoading(false);
    } else {
      // On success: redirect to groups list and refresh data
      router.push("/admin/groups");
      router.refresh();
    }
  };

  return (
    <div dir="rtl">
      <h1>יצירת קבוצה חדשה</h1>

      <form onSubmit={handleSubmit}>
        
        {/* Group Name */}
        <div>
          <label>שם הקבוצה</label>
          <input required name="name" type="text"/>
        </div>

        {/* Description */}
        <div>
          <label>הסבר קצר</label>
          <textarea required name="description" rows={3}/>
        </div>

        {/* Mentor Name */}
        <div>
          <label>שם המנחה</label>
          <input required name="mentor" type="text" />
        </div>

        {/* Image URL (Temporary) */}
        {/* בהמשך נחליף את זה להעלאת קובץ אמיתית */}
        <div>
          <label>קישור לתמונה (URL)</label>
          <input name="image_url" type="url" placeholder="https://..." />
        </div>

        <div>
            {/* Start Date */}
            <div>
              <label>תאריך פתיחת הקבוצה</label>
              <input required name="date" type="date" />
            </div>

            {/* Registration Deadline */}
            <div>
              <label>תאריך אחרון להרשמה</label>
              <input required name="registration_end_date" type="datetime-local" />
            </div>
        </div>

        <div>
            {/* Max Participants */}
            <div>
              <label>כמות משתתפים מקסימלית</label>
              <input required name="max_participants" type="number" min="1" />
            </div>

            {/* WhatsApp Link */}
            <div>
              <label>לינק לקבוצת WhatsApp</label>
              <input name="whatsapp_link" type="url" />
            </div>
        </div>

        {/* Error Message Display */}
        {error && <div>{error}</div>}

        {/* Buttons */}
        <div>
          <button type="submit" disabled={loading} style={{ cursor: 'pointer' }}>
            {loading ? "שומר..." : "שמור ופרסם"}
          </button>
          <button type="button" onClick={() => router.back()} style={{ cursor: 'pointer' }}>
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}