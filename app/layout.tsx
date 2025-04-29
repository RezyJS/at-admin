import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        <main className="w-[100vw] h-[100vh] p-0 m-0">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
