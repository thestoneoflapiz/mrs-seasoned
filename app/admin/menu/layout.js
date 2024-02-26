import Header from "@/components/header";
import { Suspense } from "react";
import Loading from "@/components/loading";
import styles from "@/app/page.module.css";

export default function DashboardLayout({
  children,
}) {
  return (
    <main className={styles.main}>
      <Header pageTitle="Mrs. Seasoned - Menu" activePage="Menu"/>
      <Suspense fallback={<Loading variant="light" />}>
        {children}
      </Suspense>
    </main>
  )
}