import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veriked | Truth you can rely on — for good.",
  description: "Query Somnia data streams in natural language with blockchain-verified answers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
