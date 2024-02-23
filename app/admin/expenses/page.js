"use client"

import styles from "@/app/page.module.css";
import Datatable from "@/components/datatable";
import AddExpenseModal from "./_modals/add";
import ImportExpensesCSVModal from "./_modals/import";

import { 
  Container, 
  Row, Col, 
  Breadcrumb, 
  Button, 
  Form,
  ToastContainer,
  Toast
} from "react-bootstrap";
import { ConstMonths, ConstYears, ConstCurrentDate } from "@/helpers/constants";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";

export default function ExpensesPage(){
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [page, setPage] = useState(1);

  const months = ConstMonths().months;
  const years = ConstYears("1975-01-01");
  const dateNow = ConstCurrentDate();

  const [fMonth, setFMonth] = useState(dateNow.getMonth()+1);
  const [fYear, setFYear] = useState(dateNow.getFullYear());
  const [fSearch, setFSearch] = useState("");
  const [fSort, setFSort] = useState({
    field: "created_at",
    sort: "desc"
  });
  
  const [data, setData] = useState({
    list: [],
    headers: ["Type","Item","QT","Price","Total","From","Remarks","Date","Created"],
    keys: ["item_type","item","quantity","price","total","bought_from","remarks","bought_date","created"],
    sortable: ["item_type","item", "quantity", "price", "total", "bought_from","remarks","bought_date"],
    limit: 10,
    page: 1,
    pages: 0,
    total: 0,
  });

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

  function generateSortableFields(){
    const sortable = data.sortable.map((sort, i)=>{
      return (<option key={i} value={sort}>{data.headers[i]}</option>)
    });

    return sortable;
  }

  async function getExpenses(){
    const filters = new URLSearchParams({
      month: fMonth,
      year: fYear,
      search: fSearch,
      sort: fSort.sort,
      by: fSort.field,
      page: page,
      limit: 10,
    });

    const response = await fetch(`/api/expenses/list?${filters}`, {
      method: "GET",
    });

    const result = await response.json();

    if(!response.ok){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "danger";
        newState.message = data.message || "SOMETHING WENT WRONG!";
        return newState;
      });

      setShowToast(true);
      return;
    }

    const { list, pagination } = result;
    const newState = {...data};
    newState.list = list;
    newState.limit = pagination.limit;
    newState.page = pagination.page;
    newState.pages = pagination.pages;
    newState.total = pagination.total;
    setData(newState);
  }

  const handleAddModalOpen = () => setShowAddModal(true);
  const handleAddModalClose = (data) => {
    if(data){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = data.variant;
        newState.message = data.message;
        return newState;
      });
      setShowToast(true);
      getExpenses();
    }
    setShowAddModal(false)
  };
  const handleImportModalOpen = () => setShowImportModal(true);
  const handleImportModalClose = (data) => {
    if(data){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = data.variant;
        newState.message = data.message;
        return newState;
      });
      setShowToast(true);
      getExpenses();
    }
    setShowImportModal(false)
  };


  function handlePagination(type, count){
    let newPage = 0;
    switch (type) {
      case "prev":
        newPage = page===1 ? 1 : page-1;
        setPage(newPage);
      break;
      case "next":
        newPage = page===data.pages ? data.pages : page+1;
        setPage(newPage);
      break;
      case "first":
        setPage(1);
      break;
      case "last":
        setPage(data.pages);
      break;
      default:
        setPage(count)
      break;
    }
  }

  function handleDateChange(type, e){
    const value = e.target.value;
    switch (type) {
      case "month":
        setFMonth(value);
      break;
    
      default:
        setFYear(value);
      break;
    }
  }

  const handleSearch = (e) => debounceFn(e.target.value);
  const debounceFn = useCallback(debounce((value)=>setFSearch(value), 500), []);

  const handleSort = (type, e) => {
    let newSort;

    switch (type) {
      case "field":
        newSort = {
          field: e.target.value,
          sort: fSort.sort,
        }
        break;
    
      default:
        newSort = {
          field: fSort.field,
          sort: e.target.value,
        }
        break;
    }

    setFSort(newSort);
  };

  useEffect(()=>{
    getExpenses();
  }, [page, fMonth, fYear, fSearch, fSort]);

  return(
    <>
      <Container className="pb-5">
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
              <Button variant="outline-primary" className="float-end" onClick={handleImportModalOpen}>Import CSV</Button>
            </Col>
          </Row>
        </div>
        <div className={styles.c_div__color}>
          <Row>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select 
                aria-label="Select Month" 
                defaultValue={dateNow.getMonth()+1}
                onChange={(e)=>handleDateChange("month", e)}
              >
                <option disabled>Select Month</option>
                {generateMonths(months)}
              </Form.Select>
            </Col>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select 
                aria-label="Select Year" 
                defaultValue={dateNow.getFullYear()}
                onChange={(e)=>handleDateChange("year", e)}
              >
                <option disabled>Select Year</option>
                {generateYears(years)}
              </Form.Select>
            </Col>
            <Col md={4} xs={12} className="py-2">
              <Form.Group className="mb-3" controlId="searchBy">
                <Form.Control 
                  type="text" 
                  placeholder="Search by Item, Price, Bought" 
                  onChange={(e)=>handleSearch(e)}
                />
              </Form.Group>
            </Col>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select 
                aria-label="Select Field" 
                defaultValue=""
                onChange={(e)=>handleSort("field", e)}
              >
                <option disabled value="">Sort Field</option>
                {generateSortableFields()}
              </Form.Select>
            </Col>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select 
                aria-label="Sort By" 
                defaultValue="desc"
                onChange={(e)=>handleSort("sort", e)}
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </Form.Select>
            </Col>
          </Row>
          <Row>
            {data?.list ? 
              <Datatable 
                dataList={data} 
                pageLink="/admin/expenses" 
                onPaginate={(type, count)=>handlePagination(type, count)}
              /> 
            : <h3>No Record Found.</h3>}
          </Row>
        </div>
      </Container>
      <AddExpenseModal show={showAddModal} onModalClose={handleAddModalClose} />
      <ImportExpensesCSVModal show={showImportModal} onModalClose={handleImportModalClose} />
    </>
  );
}