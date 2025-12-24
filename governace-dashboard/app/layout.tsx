import "./globals.css";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import ClientLayout from "./components/ClientLayout";
import { ReactQueryProvider } from "./ReactQueryProvider";
import SWRProvider from "./SWRProvider";
import { Metadata } from "next";
import svg from "../public/favicon.png";

export const metadata: Metadata = {
  title: {
    default: "Governance",
    template: "%s | Governance",
  },
  description: "Governance Dashboard",
  icons: {
    icon: svg.src,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased h-screen overflow-hidden`}
      >
        <ReactQueryProvider>
          <SWRProvider>
            <ClientLayout>{children}</ClientLayout>
          </SWRProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
