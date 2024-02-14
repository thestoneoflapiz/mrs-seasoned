import styles from "../page.module.css";
import Header from '@/components/header';

export default function Admin(){
  return(
    <main className={styles.main}>
      <Header pageTitle="Admin Dashboard" />
    </main>
  );
}