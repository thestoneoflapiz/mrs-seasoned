"use client"

import styles from "@/app/page.module.css";
import Datatable from "@/components/datatable";
import AddSaleModal from "./_modals/add";
import ImportSalesCSVModal from "./_modals/import";
import Papa from "papaparse";

import { 
  Container, 
  Row, Col, 
  Breadcrumb, 
  Button, 
  Form,
  ToastContainer,
  Toast,
  Spinner
} from "react-bootstrap";
import { ConstMonths, ConstYears } from "@/helpers/constants";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import Loading from "@/components/loading";
import moment from "moment";
import { useSession } from "next-auth/react";

export default function SalesPage(){
  const { data: session } = useSession();
  const authUser = session?.user || null;

  const [isLoading, setIsLoading] = useState(true);
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

  const [fMonth, setFMonth] = useState(parseInt(moment().format("MM")));
  const [fYear, setFYear] = useState(parseInt(moment().format("YYYY")));
  const [fSearch, setFSearch] = useState("");
  const [fSearchBy, setFSearchBy] = useState("customer");
  const [fSort, setFSort] = useState({
    field: "order_date",
    sort: "desc"
  });
  
  const searchByList = [
    {
      label: "Customer",
      id: "customer",
    },
    {
      label: "Order#",
      id: "order_id",
    },
    {
      label: "MOP",
      id: "mop",
    },
    {
      label: "Address",
      id: "address",
    },
    {
      label: "Remarks",
      id: "remarks",
    },
  ];
  
  const [data, setData] = useState({
    list: [],
    headers: ["Order#","Sold To","D%","DF","Total","MOP","Address","Order Date","Remarks","Created"],
    keys: ["order_id","customer","discount","delivery_fee","total","mop","delivery_address","order_date","remarks","created"],
    sortable: ["order_id","total","delivery_address","order_date"],
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
      return (<option key={i} value={sort}>{sort.replace("_", " ")}</option>)
    });

    return sortable;
  }

  async function getSales(){
    setIsLoading(true);
    const filters = new URLSearchParams({
      month: fMonth,
      year: fYear,
      search: fSearch,
      search_by: fSearchBy,
      sort: fSort.sort,
      by: fSort.field,
      page: page,
      limit: data.limit,
    });

    const response = await fetch(`/api/sales/list?${filters}`, {
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

      setData((prev)=>{
        const newState = prev;
        newState.list = [];
        newState.limit = 10;
        newState.page = 1;
        newState.pages = 0;
        newState.total = 0;
        return newState;
      });
      
      setShowToast(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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
  const handleImportModalOpen = () => setShowImportModal(true);
  const handleModalClose = (data) => {
    if(data){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = data.variant;
        newState.message = data.message;
        return newState;
      });
      setShowToast(true);
      getSales();
    }
    setShowAddModal(false);
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

  const handleSearchByChange = (e) => setFSearchBy(e.target.value);

  const [isLoadingExport, setIsLoadingExport] = useState(false);

  const handleExport = async() => {
    setIsLoadingExport(true);

    const filters = new URLSearchParams({
      month: fMonth,
      year: fYear,
      search: fSearch,
      search_by: fSearchBy,
      sort: fSort.sort,
      by: fSort.field,
    });

    const response = await fetch(`/api/sales/export?${filters}`, {
      method: "GET",
    });

    const result = await response.json();

    if(result && (result.sales && result.customers && result.menu)){
      const remapped = await remapExportList(result);
      const csv = Papa.unparse(remapped);

      const url = window.URL.createObjectURL(new Blob([csv])) 
      const link = document.createElement('a')

      link.href = url

      const fileName = `Sales ${months[fMonth-1]} ${fYear}.csv`;

      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click();
      link.remove()
      
      setTimeout(() => {
        setIsLoadingExport(false);

        setToastMsg((prev)=>{
          const newState = prev;
          newState.variant = "success";
          newState.message = "Data Exported!";
          return newState;
        });
        setShowToast(true);
      }, 1500);

      return;
    }

    setTimeout(() => {
      setIsLoadingExport(false);

      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "danger";
        newState.message = "Failed to export...";
        return newState;
      });
      setShowToast(true);
    }, 2500);
  }
  
  const remapExportList = ({ sales, customers, menu }) => {
    let remap = [];

    sales.forEach((sale) => {
      const customer = customers.find((c)=>c._id==sale.customer_id);

      sale.orders.forEach((order)=>{

        const item = menu.find((m)=>m._id==order.menu_id);
        const total = sale.discount > 0 ? (((100-sale.discount)/100)*order.total) : order.total;

        remap.push({
          "1.Date": moment(sale.order_date).format("MM-DD-YYYY"),
          "2.Time": moment(sale.order_date).format("hh:mm A"),
          "3.Customer": customer?.name ?? sale.customer_id,
          "4.Item": item?.name ?? order.menu_id,
          "5.QT": order.quantity,
          "6.Price": order.price,
          "7.DC": sale.discount,
          "8.Total": total,
          "9.MOP": sale.mop,
          "10.D-Fee": sale.delivery_fee,
          "11.D-Address": sale.delivery_address,
          "12.Order#": sale.order_id,
          "13.Remarks": sale.remarks,
        });
      });
    });

    return remap;
  }
  
  useEffect(()=>{
    getSales();
  }, [page, fMonth, fYear, fSearch, fSort, fSearchBy]);

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
          {
            (authUser && authUser.role !== "staff") && (
              <Row className="justify-content-end align-items-center mb-2">
                <Col lg={2} md={3} sm={6} xs={6}>
                  <Button variant="outline-primary" className="float-end" onClick={handleImportModalOpen}>Import CSV</Button>
                </Col>
              </Row>
            )
          }
          {
            (authUser && authUser.role !== "staff") && (
              <Row className="justify-content-end align-items-center">
                <Col lg={2} md={3} sm={6} xs={6}>
                  <Button variant="light" className="float-end" onClick={handleExport} disabled={isLoadingExport}>
                    Export CSV {isLoadingExport && <Spinner animation="grow" variant="dark" size="sm"/>}
                  </Button>
                </Col>
              </Row>
            )
          }
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
            <Col lg={3} md={3} sm={6} xs={6} className="py-2">
              <Form.Select 
                aria-label="Select Field" 
                defaultValue=""
                onChange={(e)=>handleSort("field", e)}
              >
                <option disabled value="">Sort Field</option>
                {generateSortableFields()}
              </Form.Select>
            </Col>
            <Col lg={3} md={3} sm={6} xs={6} className="py-2">
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
            <Col md={4} xs={12} className="py-2">
              <Form.Select 
                aria-label="" 
                defaultValue={fSearchBy}
                onChange={(e)=>handleSearchByChange(e)}
              >
                <option disabled>Select Month</option>
                {searchByList.map((s,is)=><option key={is} value={s.id}>{s.label}</option>)}
              </Form.Select>
            </Col>
            <Col md={4} xs={12} className="py-2">
              <Form.Group className="mb-3" controlId="searchBy">
                <Form.Control 
                  type="text" 
                  placeholder="Search by..." 
                  onChange={(e)=>handleSearch(e)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            {isLoading ? (<Loading variant="info" />) : (
              data?.list && data.list.length>0 ? 
              (<Datatable 
                dataList={data} 
                pageLink="/admin/sales" 
                onPaginate={(type, count)=>handlePagination(type, count)}
              />) 
            : (<h3 className="text-center fw-bold text-info">No Record Found.</h3>)
            )}
          </Row>
        </div>
      </Container>
      <AddSaleModal show={showAddModal} onModalClose={handleModalClose} />
      <ImportSalesCSVModal show={showImportModal} onModalClose={handleModalClose} />
    </>
  );
}