"use client"

import { useEffect, useState } from "react";
import { Container, Row, Col, Breadcrumb, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import styles from "@/app/page.module.css";
import Datatable from "@/components/datatable";
import EditSalesModal from "../_modals/edit";
import DeleteSalesModal from "../_modals/delete";
import { convertDateToString } from "@/helpers/date";
import Loading from "@/components/loading";
import Link from "next/link";
import moment from "moment";

export default function SalesItem({ params }){
  const [isLoading, setIsLoading] = useState(true);
  const [dtIsLoading, setDtIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });
  const [itemDetails, setItemDetails] = useState(null)
  const [salesHistory, setSalesHistory] = useState({
    list: [],
    headers: ["Order#","Sold To","D%","DF","Total","MOP","Address","Sold Date","Remarks","Created"],
    keys: ["order_id","customer","discount","delivery_fee","total","mop","delivery_address","order_date","remarks","created"],
    limit: 10,
    page: 1,
    pages: 0,
    total: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditModal = () => setShowEditModal(true);
  const handleDeleteModal = () => setShowDeleteModal(true);
  const handleModalClose = (data) => {
    if(data){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = data.variant;
        newState.message = data.message;
        return newState;
      });
      setShowToast(true);
      getSalesItemDetails();
    }
    setShowEditModal(false)
    setShowDeleteModal(false)

    if(data && data?.mode == "delete"){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "info";
        newState.message = "Redirecting to Expenses page...";
        return newState;
      });
      setShowToast(true);

      setTimeout(() => {
        route.push("/admin/expenses");
      }, 2500);
    }
  };

  async function getSalesItemDetails(){
    setIsLoading(true);

    const response = await fetch(`/api/sales/item?_id=${params?.id}`, {
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

      setShowToast(true);
      setItemDetails(null);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return;
    }
    
    const { item } = result;
    setItemDetails(item);

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }

  async function getSalesHistory(item){
    setDtIsLoading(true);
    const filters = new URLSearchParams({
      ne_id: params.id,
      search: item,
      search_by: "customer",
      sort: "desc",
      by: "created_at",
      page: page,
      limit: salesHistory.limit,
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

      setShowToast(true);

      setTimeout(() => {
        setDtIsLoading(false);
      }, 500);
      return;
    }

    const { list, pagination } = result;
    const newState = {...salesHistory};
    newState.list = list;
    newState.limit = pagination.limit;
    newState.page = pagination.page;
    newState.pages = pagination.pages;
    newState.total = pagination.total;
    setSalesHistory(newState);

    setTimeout(() => {
      setDtIsLoading(false);
    }, 500);
  }

  function handlePagination(type, count){
    let newPage = 0;
    switch (type) {
      case "prev":
        newPage = page===1 ? 1 : page-1;
        setPage(newPage);
      break;
      case "next":
        newPage = page===salesHistory.pages ? salesHistory.pages : page+1;
        setPage(newPage);
      break;
      case "first":
        setPage(1);
      break;
      case "last":
        setPage(salesHistory.pages);
      break;
      default:
        setPage(count)
      break;
    }
  }

  useEffect(()=>{
    getSalesItemDetails();
  }, []);

  useEffect(()=>{
    if(itemDetails?.order_id){
      getSalesHistory(itemDetails.customer || itemDetails.order_id);
    }
  }, [page, itemDetails]);

  return (
    <>
      <Container>
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
        {
          (isLoading===false && itemDetails===null) && (<>
            <h3 className="text-center fw-bold my-5"><Link href="/admin/sales" className="text-light">No Record Found.</Link></h3>
          </>)
        }
        <div className={styles.c_div}>
          <Row>
            <Col>
              <h3 className="text-light">Sale - Item</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} href="/admin/sales">Sales</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} active>Item - {itemDetails?.order_id || params.id}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row className="justify-content-end align-items-center mb-2">
            <Col>
              <Button variant="outline-danger" className="float-end mx-3" onClick={handleDeleteModal}>Delete</Button>
              <Button variant="warning" className="float-end" onClick={handleEditModal}>Edit</Button>
            </Col>
          </Row>
        </div>
        <div className={styles.c_div__color}>
          {isLoading ? (<Loading variant="info" />): (
            <Row className="mb-3">
              {/* Order Date */}
              <Form.Group
                as={Col}
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Order date</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.order_date ? moment(itemDetails?.order_date).format("YYYY-MM-DD hh:mm A") : ""}
                />
              </Form.Group>
              {/* Order # */}
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Order#</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.order_id || ""}
                />
              </Form.Group>
              {/* Discount */}
              <Form.Group 
                as={Col}
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Discount</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.discount || "0"}
                />
              </Form.Group>
              {/* Delivery Fee */}
              <Form.Group 
                as={Col}
                xs={6}
                className="mb-3"
                >
                <Form.Label column="sm">Delivery Fee</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.delivery_fee || "0"}
                />
              </Form.Group>
              {/* Total */}
              <Form.Group 
                as={Col}
                xs={6}
                className="mb-3"
                >
                <Form.Label column="sm">Total</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.total || "0"}
                />
              </Form.Group>
              {/* MOP */}
              <Form.Group 
                as={Col}
                xs={6}
                className="mb-3"
                >
                <Form.Label column="sm">MOP</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.mop || ""}
                />
              </Form.Group>
              {/* Delivery Address */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Label column="sm">Delivery Address</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.delivery_address || ""}
                />
              </Form.Group>
              {/* Remarks */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Label column="sm">Remarks</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  id="remarks" 
                  placeholder="remarks" 
                  disabled 
                  defaultValue={itemDetails?.remarks || ""}
                />
              </Form.Group>
              {/* CREATED BY */}
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Created</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={`${itemDetails?.created_by || "!!ERR"} | ${convertDateToString(itemDetails?.created_at)}`}
                />
              </Form.Group>
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Updated</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.updated_at ? `${itemDetails?.updated_by || "!!ERR"} | ${convertDateToString(itemDetails?.updated_at)}` : "--"}
                />
              </Form.Group>
            </Row>
          )}
        </div>
        <div className={styles.c_div__color}>
          <Row className="mb-3">
            <h5 className="text-secondary">Previous orders from <span className="fw-bold">{itemDetails?.customer || params.id}</span></h5>
            {isLoading ? (<Loading variant="info" />) : (
              salesHistory?.list && salesHistory.list.length>0 ? 
              (<Datatable 
                dataList={salesHistory} 
                pageLink="/admin/sales" 
                onPaginate={(type, count)=>handlePagination(type, count)}
              />) 
            : (<h3 className="text-center fw-bold text-info">No Record Found.</h3>)
            )}
          </Row>
        </div>
      </Container>
      {
        itemDetails && (<>
        <EditSalesModal show={showEditModal} onModalClose={handleModalClose} data={itemDetails}/>
        <DeleteSalesModal show={showDeleteModal} onModalClose={handleModalClose} data={itemDetails}/>
        </>)
      }
    </>
  )
}