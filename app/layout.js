import "./globals.css";

export const metadata = {
  title: "OnPoint",
  description: "Share posts, connect, and message your circle.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
