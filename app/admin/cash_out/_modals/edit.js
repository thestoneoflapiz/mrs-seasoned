"use client"

import { ItemTypes } from "@/helpers/constants";
import { useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Toast } from "react-bootstrap";

export default function EditCOModal({ show, onModalClose, data }){
  const itemDetails = data;
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });

  const reasonRef = useRef();
  const amountRef = useRef();

  function handleModalClose(data){
    setValidated(false);
    onModalClose(data);
  }
  
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    editItem();
    
    setValidated(true);
  };

  async function editItem(){

    const eReason = reasonRef.current.value;
    const eAmount = amountRef.current.value;

    const response = await fetch("/api/cash_out/edit", {
      method: "POST",
      body: JSON.stringify({
        _id: itemDetails._id,
        reason: eReason,
        amount: eAmount,
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
      message: data.message || "Update success!",
      mode: "edit"
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
            <Modal.Title>Edit Item</Modal.Title>
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
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="mb-3">
                {/* reason */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={2}
                    id="reason"
                    type="text"
                    placeholder="reason"
                    ref={reasonRef}
                    defaultValue={itemDetails.reason}
                  />
                </Form.Group>
                {/* amount */}
                <Form.Group 
                  as={Col}
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    min={1.00}
                    step={0.01}
                    id="amount"
                    type="amount"
                    placeholder="price"
                    ref={amountRef}
                    defaultValue={itemDetails.amount}
                  />
                </Form.Group>
              </Row>
              <Button type="submit">Save</Button>
            </Form>
          </Modal.Body>
        </Modal>
    </>
  );
}