import styles from "./page.module.css";
import Login from "@/components/auth/login";

export default function Home() {
  return (
    <main className={styles.main}>
      <Login />
    </main>
  );
}
