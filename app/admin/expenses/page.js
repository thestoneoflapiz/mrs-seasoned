"use client"

import styles from "@/app/page.module.css";
import Header from '@/components/header';
import Datatable from "@/components/datatable";
import AddExpenseModal from "./modal";

import { 
  Container, 
  Row, Col, 
  Breadcrumb, 
  Button, 
  Form 
} from "react-bootstrap";
import { ConstMonths, ConstYears, ConstCurrentDate } from "@/helpers/constants";
import { useEffect, useState } from "react";

export default function ExpensesPage(){
  const months = ConstMonths().months;
  const years = ConstYears("1975-01-01");
  const dateNow = ConstCurrentDate();

  const [fMonth, setFMonth] = useState(months[dateNow.getMonth()]);
  const [fYear, setFYear] = useState(dateNow.getFullYear());
  const [fSearch, setFSearch] = useState("");
  const [fSort, setFSort] = useState({
    field: "",
    sort: "asc"
  });
  const [data, setData] = useState({
    list: [{
      id: "As22Agg",
      title: "Esophaguys",
      price: 1000,
      quantity: 1,
      total: 1000,
      bought_from: "SM Smalls",
      bought_date: "2024-02-01",
      created: {
        by: "Levi",
        date: "2024-02-01 1PM"
      }
    }],
    headers: ["Item","Price","QT", "Total", "From","Date","Created"],
    keys: ["title","price","quantity","total","bought_from","bought_date","created"],
    limit: 10,
    page: 1,
    pages: 1,
    total: 1,
    sort: {
      field: "",
      sort: "asc"
    }
  });

  function generateMonths(months){
    const monthArr = months.map((mon, i)=>{
      return (<option key={i} value={mon}>{mon}</option>)
    });

    return monthArr;
  }

  function generateYears(years){
    const yearArr = years.map((yr, i)=>{
      return (<option key={i} value={yr}>{yr}</option>)
    });

    return yearArr;
  }

  function getExpenses(){
    // month, year, search, sort
    console.log("EXPENSES DATA HERE");
  }

  const [showAddModal, setShowAddModal] = useState(false);
  const handleAddModalOpen = () => setShowAddModal(true);
  const handleAddModalClose = () => setShowAddModal(false);
  
  useEffect(()=>{
    getExpenses();

  }, []);

  return(
    <main className={styles.main}>
      <Header pageTitle="Mrs. Seasoned - Expenses" />
      <Container>
        <div className={styles.c_div}>
          <Row>
            <Col>
              <h3 className="text-light">Expenses</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} active>Expenses</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row className="justify-content-end align-items-center mb-2">
            <Col lg={2} md={3} sm={6} xs={6}>
              <Button variant="primary" className="float-end" onClick={handleAddModalOpen}>Add Expense</Button>
            </Col>
          </Row>
          <Row className="justify-content-end align-items-center">
            <Col lg={2} md={3} sm={6} xs={6}>
              <Button variant="outline-primary" className="float-end">Import CSV</Button>
            </Col>
          </Row>
        </div>
        <div className={styles.c_div__color}>
          <Row>
            <Col lg={2} md={3} sm={3} xs={4} className="py-2">
              <Form.Select aria-label="Select Month" defaultValue={months[dateNow.getMonth()]}>
                <option disabled>Select Month</option>
                {generateMonths(months)}
              </Form.Select>
            </Col>
            <Col lg={2} md={3} sm={3} xs={4} className="py-2">
              <Form.Select aria-label="Select Year" defaultValue={dateNow.getFullYear()}>
                <option disabled>Select Year</option>
                {generateYears(years)}
              </Form.Select>
            </Col>
            <Col md={6} xs={12} className="py-2">
              <Form.Group className="mb-3" controlId="searchBy">
                <Form.Control type="text" placeholder="Search by Item, Price, Bought" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Datatable dataList={data} pageLink="/admin/expenses"/>
          </Row>
        </div>
      </Container>
      <AddExpenseModal show={showAddModal} onModalClose={handleAddModalClose} />
    </main>
  );
}