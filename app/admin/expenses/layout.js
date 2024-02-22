import Header from "@/components/header";
import { Suspense } from "react";
import Loading from "./loading";

export default function DashboardLayout({
  children,
}) {
  return (
    <section>
      <Header pageTitle="Mrs. Seasoned - Expenses" activePage="Expenses"/>
      <Suspense fallback={<Loading/>}>
        {children}
      </Suspense>
    </section>
  )
}