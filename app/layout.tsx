import "@/styles/global.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import ToasterProvider from "@/components/providers/ToasterProvider";
import StyleProvider from "@/components/providers/StyleProvider";

export const metadata: Metadata = {
  title: "הרשמה טובה",
  description:
    "מערכת הרשמה לקבוצות וסדנאות של מרחבי אדמה טובה",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Browser Favicon */}
        <link rel="icon" href="/icons/logo.svg" />
        {/* Apple Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/BlackFlower.svg"
        />
        {/* Android Icon */}
        <link
          rel="icon"
          type="image/svg+xml"
          sizes="192x192"
          href="/icons/BlackFlower.svg"
        />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://accounts.google.com/gsi/client" async></script>
      </head>
      <body>
        <RegisterServiceWorker />
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