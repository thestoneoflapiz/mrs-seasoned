"use client"

import { useEffect, useState } from "react";
import { Container, Row, Col, Breadcrumb, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import styles from "@/app/page.module.css";
import Datatable from "@/components/datatable";
import EditExpenseModal from "../_modals/edit";
import DeleteExpenseModal from "../_modals/delete";
import { convertDateToString } from "@/helpers/date";
import Loading from "@/components/loading";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ExpenseItem({ params }){
  const { data: session } = useSession();
  const authUser = session?.user || null;
  const route = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [dtIsLoading, setDtIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });
  const [itemDetails, setItemDetails] = useState(null)
  const [similarData, setSimilarData] = useState({
    list: [],
    headers: ["Type","Item","QT","Price","Total","From","Remarks","Date","Created"],
    keys: ["item_type","item","quantity","price","total","bought_from","remarks","bought_date","created"],
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
      getExpenseItemDetails();
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

  async function getExpenseItemDetails(){
    setIsLoading(true);

    const response = await fetch(`/api/expenses/item?_id=${params?.id}`, {
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

  async function getSimilarExpenseItems(item){
    setDtIsLoading(true);
    const filters = new URLSearchParams({
      ne_id: params.id,
      search: item,
      sort: "desc",
      by: "bought_date",
      page: page,
      limit: similarData.limit,
    });

    const response = await fetch(`/api/expenses/list?${filters}`, {
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
    const newState = {...similarData};
    newState.list = list;
    newState.limit = pagination.limit;
    newState.page = pagination.page;
    newState.pages = pagination.pages;
    newState.total = pagination.total;
    setSimilarData(newState);

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
        newPage = page===similarData.pages ? similarData.pages : page+1;
        setPage(newPage);
      break;
      case "first":
        setPage(1);
      break;
      case "last":
        setPage(similarData.pages);
      break;
      default:
        setPage(count)
      break;
    }
  }

  useEffect(()=>{
    getExpenseItemDetails();
  }, []);

  useEffect(()=>{
    if(itemDetails?.item){
      getSimilarExpenseItems(itemDetails.item);
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
            <h3 className="text-center fw-bold my-5"><Link href="/admin/expenses" className="text-light">No Record Found.</Link></h3>
          </>)
        }

        <div className={styles.c_div}>
          <Row>
            <Col>
              <h3 className="text-light">Expense - Item</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} href="/admin/expenses">Expenses</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} active>Item - {itemDetails?.item || params.id}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          {
            (authUser && authUser.role !== "staff") && (
              <Row className="justify-content-end align-items-center mb-2">
                <Col>
                  <Button variant="outline-danger" className="float-end mx-3" onClick={handleDeleteModal}>Delete</Button>
                  <Button variant="warning" className="float-end" onClick={handleEditModal}>Edit</Button>
                </Col>
              </Row>
            )
          }
        </div>

        <div className={styles.c_div__color}>
          {isLoading ? (<Loading variant="info" />): (
            <Row className="mb-3">
              {/* Select Type */}
              <Form.Group
                as={Col}
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Type</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.item_type || ""}
                />
              </Form.Group>
              {/* Item */}
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Item</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.item || ""}
                />
              </Form.Group>
              {/* Quantity */}
              <Form.Group 
                as={Col}
                xs={4}
                className="mb-3"
              >
                <Form.Label column="sm">Quantity</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.quantity || ""}
                />
              </Form.Group>
              {/* Price */}
              <Form.Group 
                as={Col}
                xs={4}
                className="mb-3"
                >
                <Form.Label column="sm">Price</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.price || ""}
                />
              </Form.Group>
              {/* Total */}
              <Form.Group 
                as={Col}
                xs={4}
                className="mb-3"
                >
                <Form.Label column="sm">Total</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.total || ""}
                />
              </Form.Group>
              {/* Date Bought */}
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Bought Date</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.bought_date ? convertDateToString(itemDetails?.bought_date): ""}
                />
              </Form.Group>
              {/* Bought From */}
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Bought From</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.bought_from || ""}
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
            <h5 className="text-secondary">Similar Data to <span className="fw-bold">{itemDetails?.item || params.id}</span></h5>
            {isLoading ? (<Loading variant="info" />) : (
              similarData?.list && similarData.list.length>0 ? 
              (<Datatable 
                dataList={similarData} 
                pageLink="/admin/expenses" 
                onPaginate={(type, count)=>handlePagination(type, count)}
              />) 
            : (<h3 className="text-center fw-bold text-info">No Record Found.</h3>)
            )}
          </Row>
        </div>
      </Container>
      {
        itemDetails && (<>
        <EditExpenseModal show={showEditModal} onModalClose={handleModalClose} data={itemDetails}/>
        <DeleteExpenseModal show={showDeleteModal} onModalClose={handleModalClose} data={itemDetails}/>
        </>)
      }
    </>
  )
}