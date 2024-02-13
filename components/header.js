import styles from "@/app/page.module.css";

export default function Header(){
  return (
    <>
      <img src="/img/logo.png" alt="Mrs.Seasoned Logo Original" className={styles.logo} />
      <h1>Welcome to Mrs. Seasoned System Application.</h1>
    </>
  )
}