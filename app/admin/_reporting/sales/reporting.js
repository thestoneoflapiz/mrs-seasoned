"use client"

import { Col, Container, Row, Toast, ToastContainer } from 'react-bootstrap';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from "@/app/page.module.css";
import { useEffect, useState } from 'react';
import moment from 'moment';
import Loading from '@/components/loading';

// defaultProps error in rechartJS
// https://github.com/recharts/recharts/issues/3615
const error = console.error;
console.error = (...args) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

export default function SalesReporting({ filterBy, fMonth, fYear }){

  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });
  
  const [tSalesAchart, setTsalesAchart] = useState([]);

  async function getSalesPerWeek(){
    setIsLoading(true);

    const filters = new URLSearchParams({
      report: "total",
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

      setTsalesAchart([])
      setShowToast(true);
      return;
    }

    setTsalesAchart(result?.data || [])

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }

  useEffect(()=>{
    
    getSalesPerWeek();

  }, [filterBy, fMonth, fYear]);

  return(
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
        <Row className={styles.c_report_wrapper}>
          <Col xs={12}>
            <h5 className='text-secondary'>Total Sales in <span className='fw-bold'>{filterBy=="month" && moment(fMonth).format("MMMM")} {fYear}</span></h5>
          </Col>
          <Col>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                width={500}
                height={400}
                data={tSalesAchart}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#57B5D2" fill="#57B5D2" />
              </AreaChart>
            </ResponsiveContainer>
          </Col>
        </Row>
      )}
    </Container>
    </>
  )
}