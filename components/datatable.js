
import { Table, Pagination } from "react-bootstrap"
import styles from "@/app/page.module.css"
import Link from "next/link";


export default function Datatable({ dataList, pageLink="" }){

  function generateFields(){
    const fields = dataList.list.map((li, i)=>{
      const cells = dataList.keys.map((cell,i)=>{
        if(typeof li[cell] != "object"){
          if(cell=="title" && li.id){
            return <td key={i}><Link className={styles.ct_link} href={`${pageLink}/${li.id}`}>{li[cell]}</Link></td>;
          }
          return <td key={i}>{li[cell]}</td>;
        }
        
        return <td key={i}>{li[cell].by} | {li[cell].date}</td>;
      });

      return(
        <tr>
          <td>{i+1}</td>
          {cells}
        </tr>
      )
    });

    return fields;
  }

  function generatePagination(){
    const { page, pages } = dataList;
    
    const paginationLimit = 4;
    const startAt = page-1;
    const endCount = page+paginationLimit;

    const endAt = pages<endCount?pages:endCount;

    const pagination = [];
    for (let i = startAt; i < endAt; i++) {
      pagination.push(i+1);
    }

    const generated = pagination.map((g)=>{
      if(page==g){
        return(<Pagination.Item key={g} linkClassName={styles.cp_link__active}>{g}</Pagination.Item>);
      }
      return(<Pagination.Item key={g} linkClassName={styles.cp_link}>{g}</Pagination.Item>);
    });

    return (
      <Pagination >
        <Pagination.First linkClassName={styles.cp_link}/>
        <Pagination.Prev linkClassName={styles.cp_link}/>
        {generated}
        <Pagination.Next linkClassName={styles.cp_link}/>
        <Pagination.Last linkClassName={styles.cp_link}/>
      </Pagination>
    );
  }

  return (
    <>
      <div>
        <div className={styles.c_table__responsive}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                {dataList.headers.map((hd, i)=><th key={i}>{hd}</th>)}             
              </tr>
            </thead>
            <tbody>
              {generateFields()}
            </tbody>
          </Table>
        </div>
        {generatePagination()}
      </div>
    </>
  )
}