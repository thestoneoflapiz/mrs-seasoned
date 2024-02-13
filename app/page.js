import styles from "./page.module.css";
import Header from "@/components/header";
import Login from "@/components/auth/login";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Login />
    </main>
  );
}
