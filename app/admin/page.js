"use client"

import styles from "../page.module.css";
import Header from '@/components/header';
import ExpensesReporting from "./_reporting/expenses/reporting";
import { useEffect, useState } from "react";
import { Col, Container, Form, Row } from 'react-bootstrap';
import { ConstMonths, ConstYears } from '@/helpers/constants';
import moment from "moment";
import SalesReporting from "./_reporting/sales/reporting";
import ReportingCardPage from "./_reporting/card";
import { useSession } from "next-auth/react";
import TopCustomersReporting from "./_reporting/sales/topCustomers";
import BestSellerReporting from "./_reporting/sales/bestSeller";

export default function Admin(){
  const { data: session } = useSession();
  const [filterBy, setFilterBy] = useState("month");
  const [fMonth, setFMonth] = useState(moment().format("MM"));
  const [fYear, setFYear] = useState(moment().format("YYYY"));
  const [showFilterAccess, setShowFilterAccess] = useState(false);
  const const_months = ConstMonths();
  const const_years = ConstYears("2024");

  function generateMonths(months){
    const monthArr = months.map((mon, i)=>{
      return (<option key={i} value={i+1}>{mon}</option>)
    });

    return monthArr;
  }

  function generateYears(years){
    const yearArr = years.map((yr, i)=>{
      return (<option key={i} value={yr}>{yr}</option>)
    });

    return yearArr;
  }

  function displayFilterAccess(){
    console.log(session);
    if(session && session.user){
      if(session.user.role == "staff"){
        setShowFilterAccess(false);

        return;
      }

      setShowFilterAccess(true)
    }
  }

  useEffect(()=>{
    displayFilterAccess();
  }, [session]);

  return(
    <main className={styles.main}>
      <Header pageTitle="Admin Dashboard" activePage="Home" />
      { showFilterAccess && (
        <Container className={styles.c_report_container}>
          <Row>
            <Form.Group as={Col} lg={2} md={3} sm={4} xs={4} className='py-1'>
              <Form.Select 
                onChange={(e)=>setFilterBy(e.target.value)} 
                size="sm"
                defaultValue={filterBy}
              >
                <option value="month">Month</option>
                <option value="year">Year</option>
              </Form.Select>
            </Form.Group>
            {filterBy=="month" && (
              <Form.Group 
                as={Col} lg={2} md={3} sm={4} xs={4} 
                className='py-1'
              >
                <Form.Select 
                  size="sm"
                  onChange={(e)=>setFMonth(e.target.value)}
                  defaultValue={parseInt(fMonth)}
                >
                  {generateMonths(const_months.monthsFull)}
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group 
              as={Col} lg={2} md={3} sm={4} xs={4} 
              className='py-1'
              defaultValue={fYear}
            >
              <Form.Select 
                size="sm"
                onChange={(e)=>setFYear(e.target.value)}
              >
                {generateYears(const_years)}
              </Form.Select>
            </Form.Group>
          </Row>
        </Container>
      ) }
      <ReportingCardPage filterBy={filterBy} fMonth={fMonth} fYear={fYear}/>
      <ExpensesReporting filterBy={filterBy} fMonth={fMonth} fYear={fYear}/>
      <SalesReporting filterBy={filterBy} fMonth={fMonth} fYear={fYear}/>
      <TopCustomersReporting filterBy={filterBy} fMonth={fMonth} fYear={fYear}/>
      <BestSellerReporting  filterBy={filterBy} fMonth={fMonth} fYear={fYear}/>
    </main>
  );
}