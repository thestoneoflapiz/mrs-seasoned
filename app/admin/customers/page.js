import Link from "next/link";


export default function CustomersPage(){
  return (
    <>
      Customers
      <h1>Datatable</h1>
      <p><Link href="/admin/customers/12024">Customer 1</Link></p>
      <p><Link href="/admin/customers/22024">Customer 2</Link></p>
    </>
  )
}