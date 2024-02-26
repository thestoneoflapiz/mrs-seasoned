
import { Table, Pagination } from "react-bootstrap"
import styles from "@/app/page.module.css"
import Link from "next/link";


export default function Datatable({ dataList, pageLink="", onPaginate }){

  function generateFields(){
    const arrOfTitles = ["title", "name", "item", "order_id"];

    const fields = dataList.list.map((li, i)=>{
      const cells = dataList.keys.map((cell,i)=>{
        if(typeof li[cell] != "object"){
          if(arrOfTitles.includes(cell) && li._id){
            return <td key={i}><Link className={styles.ct_link} href={`${pageLink}/${li._id}`}>{li[cell]}</Link></td>;
          }
          return <td key={i}>{li[cell]}</td>;
        }
        
        return <td key={i}>{li[cell].by} | {li[cell].date}</td>;
      });

      return(
        <tr key={i}>
          <td key={i+1}>{i+1}</td>
          {cells}
        </tr>
      )
    });

    return fields;
  }

  function generatePagination(){
    const { page, pages } = dataList;
    
    const paginationLimit = 4;
    let startAt = page-1;
    const endCount = page+paginationLimit;
    const endAt = pages<endCount?pages:endCount;

    const between = startAt-endAt;
    if(between <= 5){
      startAt = Math.round(endAt-5);
      startAt = startAt < 0 ? 0 : startAt;
    }
    const pagination = [];
    for (let i = startAt; i < endAt; i++) {
      pagination.push(i+1);
    }

    const generated = pagination.map((g)=>{
      if(page==g){
        return(<Pagination.Item key={g} linkClassName={styles.cp_link__active} onClick={()=>handlePagination("count", g)}>{g}</Pagination.Item>);
      }
      return(<Pagination.Item key={g} linkClassName={styles.cp_link} onClick={()=>handlePagination("count", g)}>{g}</Pagination.Item>);
    });

    return (
      <Pagination >
        <Pagination.First linkClassName={styles.cp_link} onClick={()=>handlePagination("first", 0)} />
        <Pagination.Prev linkClassName={styles.cp_link} onClick={()=>handlePagination("prev", 0)} />
        {generated}
        <Pagination.Next linkClassName={styles.cp_link} onClick={()=>handlePagination("next", 0)} />
        <Pagination.Last linkClassName={styles.cp_link} onClick={()=>handlePagination("last", 0)} />
      </Pagination>
    );
  }

  function handlePagination(type, count){
    onPaginate(type, count);
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