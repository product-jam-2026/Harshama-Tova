import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "הרשמה טובה",
  description:
    "מערכת הרשמה לקבוצות וסדנאות של מרחבי אדמה טובה",
};

export default function ParticipantsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
