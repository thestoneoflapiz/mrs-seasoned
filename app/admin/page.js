import Link from 'next/link';
import styles from "../page.module.css";

const pages = [
  {
    name: "Expenses",
    link: "/admin/expenses", 
  },
  {
    name: "Inventory",
    link: "/admin/inventory", 
  },
  {
    name: "Sales",
    link: "/admin/sales", 
  },
  {
    name: "Reporting",
    link: "/admin/report", 
  }
]

function loginUser(){
  
}

function generateNavs(){
  const pageNav = pages.map((page) => <li><Link href={page.link}>{page.name}</Link></li>)
  return <ul>{pageNav}</ul>;
}

export default function Admin(){
  return(
    <main className={styles.main}>
      <h1>Admin</h1>
      {generateNavs()}
    </main>
  );
}