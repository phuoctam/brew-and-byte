import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Brew & Byte - Coffee Shop Management",
  description: "Efficiently manage your coffee shop menu and orders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
