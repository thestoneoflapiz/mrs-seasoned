import styles from "@/app/page.module.css";

export default function Header(){
  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src="/img/logo.png" alt="Mrs.Seasoned Logo Original" className={styles.logo} /> 
            &nbsp; Mrs. Seasoned App
          </a>
        </div>
      </nav>
    </>
  )
}