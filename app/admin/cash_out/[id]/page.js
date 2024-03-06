"use client"

import { useEffect, useState } from "react";
import { Container, Row, Col, Breadcrumb, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import styles from "@/app/page.module.css";
import EditCOModal from "../_modals/edit";
import DeleteCOModal from "../_modals/delete";
import { convertDateToString } from "@/helpers/date";
import Loading from "@/components/loading";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function COItem({ params }){
  const route = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });
  const [itemDetails, setItemDetails] = useState(null)
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
      getCOItemDetails();
    }
    setShowEditModal(false)
    setShowDeleteModal(false)

    if(data && data?.mode == "delete"){
      
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "info";
        newState.message = "Redirecting to Cash OUT page...";
        return newState;
      });
      setShowToast(true);

      setTimeout(() => {
        route.push("/admin/cash_out");
      }, 2500);
    }
  };

  async function getCOItemDetails(){
    setIsLoading(true);

    const response = await fetch(`/api/cash_out/item?_id=${params?.id}`, {
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

  useEffect(()=>{
    getCOItemDetails();
  }, []);

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
            <h3 className="text-center fw-bold my-5"><Link href="/admin/cash_out" className="text-light">No Record Found.</Link></h3>
          </>)
        }
        <div className={styles.c_div}>
          <Row>
            <Col>
              <h3 className="text-light">Cash OUT  - Item</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} href="/admin/cash_out ">Cash OUT</Breadcrumb.Item>
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
              {/* Reason */}
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Reason</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.reason || ""}
                />
              </Form.Group>
              {/* Amount */}
              <Form.Group 
                as={Col}
                xs={6}
                className="mb-3"
                >
                <Form.Label column="sm">Amount</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={itemDetails?.amount || ""}
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
      </Container>
      {
        itemDetails && (<>
        <EditCOModal show={showEditModal} onModalClose={handleModalClose} data={itemDetails}/>
        <DeleteCOModal show={showDeleteModal} onModalClose={handleModalClose} data={itemDetails}/>
        </>)
      }
    </>
  )
}