
import { Inter } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/SessionProvider"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mrs. Seasoned",
  description: "EXPENSE, INVENTORY, SALES, AND REPORTING SYSTEM",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
