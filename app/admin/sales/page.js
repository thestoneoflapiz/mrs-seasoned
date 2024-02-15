"use client"

import styles from "@/app/page.module.css";
import Header from '@/components/header';
import Datatable from "@/components/datatable";
import AddSalesModal from "./_modals/add";
import ImportSalesCSVModal from "./_modals/import";

import { 
  Container, 
  Row, Col, 
  Breadcrumb, 
  Button, 
  Form 
} from "react-bootstrap";
import { ConstMonths, ConstYears, ConstCurrentDate } from "@/helpers/constants";
import { useEffect, useState } from "react";

export default function SalesPage(){
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
      id: "Order#1A2023",
      title: "Order#1A2023",
      sold_to: "Mr. Guillera Asuncion",
      street: "BLK 9 Lot 10",
      address: "Venezia, San Vicente",
      discount: 5,
      delivery_id: "",
      delivery_fee: 0,
      total_amount: 299.25,
      order_date: "2024-02-01 1PM",
      created: {
        by: "Levi",
        date: "2024-02-01 1PM"
      }
    }],
    headers: ["Order#", "Sold To", "Street","Address","Discount","Delivery#","DF","Total","Date","Created"],
    keys: ["title","sold_to","street","address","discount","delivery_id","delivery_fee", "total_amount", "order_date","created"],
    sortable: ["title","sold_to","address","discount","delivery_id","delivery_fee", "total_amount", "order_date"],
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

  function generateSortableFields(){
    const sortable = data.sortable.map((sort, i)=>{
      return (<option key={i} value={sort}>{data.headers[i]}</option>)
    });

    return sortable;
  }

  function getSales(){
    // month, year, search, sort
    console.log("Sales DATA HERE");
  }

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const handleAddModalOpen = () => setShowAddModal(true);
  const handleAddModalClose = () => setShowAddModal(false);
  const handleImportModalOpen = () => setShowImportModal(true);
  const handleImportModalClose = () => setShowImportModal(false);
  
  useEffect(()=>{
    getSales();

  }, []);

  return(
    <main className={styles.main}>
      <Header pageTitle="Mrs. Seasoned - Sales" activePage="Sales"/>
      <Container>
        <div className={styles.c_div}>
          <Row>
            <Col>
              <h3 className="text-light">Sales</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} active>Sales</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row className="justify-content-end align-items-center mb-2">
            <Col lg={2} md={3} sm={6} xs={6}>
              <Button variant="primary" className="float-end" onClick={handleAddModalOpen}>Add Sales</Button>
            </Col>
          </Row>
          <Row className="justify-content-end align-items-center">
            <Col lg={2} md={3} sm={6} xs={6}>
              <Button variant="outline-primary" className="float-end" onClick={handleImportModalOpen}>Import CSV</Button>
            </Col>
          </Row>
        </div>
        <div className={styles.c_div__color}>
          <Row>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select aria-label="Select Month" defaultValue={months[dateNow.getMonth()]}>
                <option disabled>Select Month</option>
                {generateMonths(months)}
              </Form.Select>
            </Col>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select aria-label="Select Year" defaultValue={dateNow.getFullYear()}>
                <option disabled>Select Year</option>
                {generateYears(years)}
              </Form.Select>
            </Col>
            <Col md={4} xs={12} className="py-2">
              <Form.Group className="mb-3" controlId="searchBy">
                <Form.Control type="text" placeholder="Search by Item, Price, Bought" />
              </Form.Group>
            </Col>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select aria-label="Select Field" defaultValue="">
                <option disabled value="">Sort Field</option>
                {generateSortableFields()}
              </Form.Select>
            </Col>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select aria-label="Sort By" defaultValue="">
                <option disabled value="">Sort By</option>
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </Form.Select>
            </Col>
          </Row>
          <Row>
            {data ? <Datatable dataList={data} pageLink="/admin/sales"/> : <h3>No Record Found.</h3>}
          </Row>
        </div>
      </Container>
      <AddSalesModal show={showAddModal} onModalClose={handleAddModalClose} />
      <ImportSalesCSVModal show={showImportModal} onModalClose={handleImportModalClose} />
    </main>
  );
}