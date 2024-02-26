"use client"

import { useEffect, useState } from "react";
import { Container, Row, Col, Breadcrumb, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import styles from "@/app/page.module.css";
import Datatable from "@/components/datatable";
import EditMenuModal from "../_modals/edit";
import DeleteMenuModal from "../_modals/delete";
import { convertDateToString } from "@/helpers/date";
import Loading from "@/components/loading";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MenuItem({ params }){
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
    headers: ["Item","Price","Created"],
    keys: ["name","price", "created"],
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
      getMenuItemDetails();
    }
    setShowEditModal(false)
    setShowDeleteModal(false)

    if(data && data?.mode == "delete"){
      
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "info";
        newState.message = "Redirecting to Menu page...";
        return newState;
      });
      setShowToast(true);

      setTimeout(() => {
        route.push("/admin/menu");
      }, 2500);
    }
  };

  async function getMenuItemDetails(){
    setIsLoading(true);

    const response = await fetch(`/api/menu/item?_id=${params?.id}`, {
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

  async function getSimilarMenuItems(item){
    setDtIsLoading(true);
    const filters = new URLSearchParams({
      ne_id: params.id,
      search: item,
      sort: "desc",
      by: "bought_date",
      page: page,
      limit: similarData.limit,
    });

    const response = await fetch(`/api/menu/list?${filters}`, {
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
    getMenuItemDetails();
  }, []);

  useEffect(()=>{
    if(itemDetails?.name){
      getSimilarMenuItems(itemDetails.name);
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
            <h3 className="text-center fw-bold my-5"><Link href="/admin/menu" className="text-light">No Record Found.</Link></h3>
          </>)
        }
        <div className={styles.c_div}>
          <Row>
            <Col>
              <h3 className="text-light">Menu - Item</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} href="/admin/menu">Menu</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} active>Item - {itemDetails?.name || params.id}</Breadcrumb.Item>
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
                  value={itemDetails?.name || ""}
                />
              </Form.Group>
              {/* Price */}
              <Form.Group 
                as={Col}
                xs={6}
                className="mb-3"
                >
                <Form.Label column="sm">Price</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.price || ""}
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
            <h5 className="text-secondary">Similar Data to <span className="fw-bold">{itemDetails?.name || params.id}</span></h5>
            {dtIsLoading ? (<Loading variant="info" />) : (
              similarData?.list && similarData.list.length>0 ? 
              (<Datatable 
                dataList={similarData} 
                pageLink="/admin/menu" 
                onPaginate={(type, count)=>handlePagination(type, count)}
              />) 
            : (<h3 className="text-center fw-bold text-info">No Record Found.</h3>)
            )}
          </Row>
        </div>
      </Container>
      {
        itemDetails && (<>
        <EditMenuModal show={showEditModal} onModalClose={handleModalClose} data={itemDetails}/>
        <DeleteMenuModal show={showDeleteModal} onModalClose={handleModalClose} data={itemDetails}/>
        </>)
      }
    </>
  )
}