import { useEffect, useState } from "react";
import { Col, Container, Row, Table, Toast, ToastContainer } from 'react-bootstrap';
import styles from "@/app/page.module.css";
import Loading from '@/components/loading';
import moment from "moment";

export default function TopCustomersReporting({ filterBy, fMonth, fYear }){

  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });
  
  const [data, setData] = useState([]);

  async function getCustomers(){
    setIsLoading(true);

    const filters = new URLSearchParams({
      report: "top_customers",
      month: fMonth,
      year: fYear,
      filter: filterBy
    });

    const response = await fetch(`/api/sales/report?${filters}`, {
      method: "GET",
    });

    const result = await response.json();
    if(!response.ok){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "danger";
        newState.message = result.message || "SOMETHING WENT WRONG!";
        return newState;
      });

      setData([])
      setShowToast(true);
      return;
    }

    setData(result?.data || [])

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }

  useEffect(()=>{
    
    getCustomers();

  }, [filterBy, fMonth, fYear]);

  return (
    <>
      <ToastContainer
        className="p-3"
        position="top-center"
        style={{ zIndex: 1 }}
      >
        <Toast 
          bg={toastMsg.variant}
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={5000} 
          autohide
          position="top-center"
        >
          <Toast.Body className="text-white">{toastMsg.message}</Toast.Body>
        </Toast>
      </ToastContainer>
      <Container className={styles.c_report_container}>
        {isLoading && (
          <Loading variant="light" />
        )}

        {!isLoading && (
          <Row>
            <Col xs={12}>
              <h5 className='text-light'>Top Customers of <span className='fw-bold'>{filterBy=="month" && moment(fMonth).format("MMMM")} {fYear}</span></h5>
            </Col>
            <Col>
              <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>        
                  <th>#Orders</th>        
                </tr>
              </thead>
              <tbody>
                { data.map((d, i)=>{
                  return(
                    <tr key={i+`tableTr`}>
                      <td>{i+1}</td>
                      <td>{d.customer?.name || "!!ERR"}</td>
                      <td>{d.count || 0}</td>
                    </tr>
                  )
                }) }
              </tbody>
            </Table>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}