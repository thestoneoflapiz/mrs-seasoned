import Header from "@/components/header";
import { Suspense } from "react";
import Loading from "@/components/loading";
import styles from "@/app/page.module.css";

export default function DashboardLayout({
  children,
}) {
  return (
    <main className={styles.main}>
      <Header pageTitle="Mrs. Seasoned - Expenses" activePage="Expenses"/>
      <Suspense fallback={<Loading variant="light" />}>
        {children}
      </Suspense>
    </main>
  )
}