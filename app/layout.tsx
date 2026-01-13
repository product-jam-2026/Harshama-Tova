import "@/styles/global.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import ToasterProvider from "@/components/providers/ToasterProvider";
import StyleProvider from "@/components/providers/StyleProvider";

export const metadata: Metadata = {
  title: "הרשמה טובה",
  description:
    "מערכת הרשמה לקבוצות וסדנאות של מרחבי אדמה טובה",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* Browser Favicon */}
        <link rel="icon" href="/icons/favicon.png" />
        {/* Apple Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-180.png"
        />
        {/* Android Icon */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://accounts.google.com/gsi/client" async></script>
      </head>
      <body>
        {/* Wrap everything in StyleProvider. 
            This ensures MUI styles are injected at the top of the <head>,
            so our custom CSS can override them easily.
        */}
        <StyleProvider>
          <div className="background-overlay"></div>
          <ToasterProvider />
          <div>{children}</div>
        </StyleProvider>
      </body>
    </html>
  );
}