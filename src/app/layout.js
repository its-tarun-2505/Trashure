import { Geist, Geist_Mono } from "next/font/google";
import RootChrome from "@/components/RootChrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Trashure",
  description: "Trashure is a smart waste management platform designed to connect citizens, collectors, and administrators in one seamless system"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootChrome>
          {children}
        </RootChrome>
      </body>
    </html>
  );
}
