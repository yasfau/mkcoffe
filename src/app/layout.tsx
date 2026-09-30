import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { CartHydrator } from "@/components/cart-hydrator";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MK Coffee",
  description: "Pesan kopi, diantar ke lokasi kamu",
};

export const viewport: Viewport = { themeColor: "#78350f" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-stone-50 text-stone-900">
        <CartHydrator />
        {children}
      </body>
    </html>
  );
}
