import "@/styles/global.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { useEffect } from "react";
import ToasterProvider from "@/components/providers/ToasterProvider";
import StyleProvider from "@/components/providers/StyleProvider";

export const metadata: Metadata = {
  title: "הרשמה טובה",
  description:
    "מערכת הרשמה לקבוצות וסדנאות של מרחבי אדמה טובה",
};

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* Google Fonts - Rubik */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
        {/* Browser Favicon */}
        <link rel="icon" href="/icons/logo.png" />
        {/* Apple Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/logo.png"
        />
        {/* Android Icon */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/logo.png"
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