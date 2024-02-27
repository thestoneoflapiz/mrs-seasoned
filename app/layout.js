
import { Inter } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/SessionProvider"
import styles from "@/app/page.module.css"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mrs. Seasoned",
  description: "EXPENSE, SALES, AND REPORTING SYSTEM",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className+" "+styles.c_background}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
