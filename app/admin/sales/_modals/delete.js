"use client"

import { useState } from "react";
import { Modal, Button, Row, Col, Toast } from "react-bootstrap";

export default function DeleteExpenseModal({ show, onModalClose, data }){
  const itemDetails = data;
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });

  function handleModalClose(data){
    onModalClose(data);
  }
  
  async function deleteExpense(){
    const response = await fetch("/api/sales/delete", {
      method: "POST",
      body: JSON.stringify({
        _id: itemDetails._id
      },{
        headers:{
          "Content-Type": "application/json"
        }
      })
    });

    const data = await response.json();

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

    handleModalClose({
      variant: "success",
      message: data.message || "Delete success!",
      mode: "delete"
    });
  }

  return (
    <>
      <Modal 
        show={show} 
        onHide={handleModalClose} 
        size="sm" 
        centered
        backdrop="static"
        keyboard={false}
      >
          <Modal.Header closeButton>
            <Modal.Title>Delete Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Toast 
              bg={toastMsg.variant}
              onClose={() => setShowToast(false)} 
              show={showToast} 
              delay={5000} 
              autohide
              position="top-center"
              className="mt-2 mb-3"
            >
              <Toast.Body className="text-white">{toastMsg.message}</Toast.Body>
            </Toast>
            <p>Are you sure to delete {itemDetails?.order_id || "this sales"}?</p>
            <Row className="justify-content-end align-items-center">
              <Col sm={3} xs={4}>
                <Button type="button" variant="primary" onClick={deleteExpense}>Yes</Button>
              </Col>
              <Col sm={3} xs={4}>
                <Button type="button" variant="outline-danger" onClick={()=>handleModalClose(null)}>No</Button>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
    </>
  );
}