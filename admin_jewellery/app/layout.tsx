import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Jewellery Admin Panel",
  description: "Admin dashboard for Jewellery Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: "Outfit, sans-serif",
                fontSize: "14px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
