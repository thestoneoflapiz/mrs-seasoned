"use client"

import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import Header from '@/components/header';
import { useSession } from "next-auth/react";

export default function Admin(){
  const router = useRouter();
  const { status } = useSession();

  if(status==="unauthenticated"){
    router.push("/");
    return;
  }
   
  return(
    <main className={styles.main}>
      <Header pageTitle="Admin Dashboard" activePage="Home" />
    </main>
  );
}