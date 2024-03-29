"use client"

import styles from "@/app/page.module.css";
import Datatable from "@/components/datatable";
import AddUserModal from "./_modals/add";

import { 
  Container, 
  Row, Col, 
  Breadcrumb, 
  Button, 
  Form,
  ToastContainer,
  Toast
} from "react-bootstrap";
import { ConstMonths, ConstYears } from "@/helpers/constants";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import Loading from "@/components/loading";
import moment from "moment";
import { useSession } from "next-auth/react";

export default function UsersPage(){
  const { status, data: session } = useSession();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);

  const months = ConstMonths().months;
  const years = ConstYears("1975-01-01");

  const [fMonth, setFMonth] = useState(parseInt(moment().format("MM")));
  const [fYear, setFYear] = useState(parseInt(moment().format("YYYY")));
  const [fSearch, setFSearch] = useState("");
  const [fSort, setFSort] = useState({
    field: "created_at",
    sort: "desc"
  });
  
  const [data, setData] = useState({
    list: [],
    headers: ["Name", "Username", "Created"],
    keys: ["name", "username", "created"],
    sortable: ["name","username","created_at"],
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

  async function getUsers(){
    setIsLoading(true);
    const filters = new URLSearchParams({
      ne_id: session?.user?._id || "",
      month: fMonth,
      year: fYear,
      search: fSearch,
      sort: fSort.sort,
      by: fSort.field,
      page: page,
      limit: data.limit,
    });

    const response = await fetch(`/api/users/list?${filters}`, {
      method: "GET",
    });

    const result = await response.json();

    if(!response.ok){
      setData((prev)=>{
        const newState = prev;
        newState.list = [];
        newState.limit = 10;
        newState.page = 1;
        newState.pages = 0;
        newState.total = 0;
        return newState;
      });
      
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "danger";
        newState.message = result.message || "SOMETHING WENT WRONG!";
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
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }

  const handleAddModalOpen = () => setShowAddModal(true);
  const handleModalClose = (data) => {
    if(data){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = data.variant;
        newState.message = data.message;
        return newState;
      });
      setShowToast(true);
      getUsers();
    }
    setShowAddModal(false);
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
        setPage(1);
      break;
    
      default:
        setFYear(value);
        setPage(1);
      break;
    }
  }

  const handleSearch = (e) => {
    debounceFn(e.target.value)
    setPage(1);
  };
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
    getUsers();
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
              <h3 className="text-light">Users</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} active>Users</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row className="justify-content-end align-items-center mb-2">
            <Col lg={2} md={3} sm={6} xs={6}>
              <Button variant="primary" className="float-end" onClick={handleAddModalOpen}>Add User</Button>
            </Col>
          </Row>
        </div>
        <div className={styles.c_div__color}>
          <Row>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select 
                aria-label="Select Month" 
                defaultValue={parseInt(moment().format("MM"))}
                onChange={(e)=>handleDateChange("month", e)}
              >
                <option disabled>Select Month</option>
                {generateMonths(months)}
              </Form.Select>
            </Col>
            <Col lg={2} md={3} sm={6} xs={6} className="py-2">
              <Form.Select 
                aria-label="Select Year" 
                defaultValue={parseInt(moment().format("YYYY"))}
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
                  placeholder="Search by name or username" 
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
            {isLoading ? (<Loading variant="info" />) : (
              data?.list && data.list.length>0 ? 
              (<Datatable 
                dataList={data} 
                pageLink="/admin/users" 
                onPaginate={(type, count)=>handlePagination(type, count)}
              />) 
            : (<h3 className="text-center fw-bold text-info">No Record Found.</h3>)
            )}
          </Row>
        </div>
      </Container>
      <AddUserModal show={showAddModal} onModalClose={handleModalClose} />
    </>
  );
}