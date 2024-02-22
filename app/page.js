"use client"

import styles from "./page.module.css";
import Login from "@/components/auth/login";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  if(status === "authenticated"){
    router.push("/admin");
    return;
  }
   
  return (
    <main className={styles.main}>
      <Login />
    </main>
  );
}
