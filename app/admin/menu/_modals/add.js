"use client"

import { ItemTypes, ConstCurrentDateTimeString } from "@/helpers/constants";
import { useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Toast, FormGroup } from "react-bootstrap";

export default function AddMenuModal({ show, onModalClose }){

  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });

  const itemRef = useRef();
  const priceRef = useRef();

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

    createItem();
    
    setValidated(true);
  };

  async function createItem(){

    const enteredItem = itemRef.current.value;
    const enteredPrice = priceRef.current.value;

    const response = await fetch("/api/menu/add", {
      method: "POST",
      body: JSON.stringify({
        name: enteredItem,
        price: enteredPrice,
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
      message: data.message || "Update success!"
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
            <Modal.Title>Add Item</Modal.Title>
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
                {/* Item */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={2}
                    id="item"
                    type="text"
                    placeholder="item"
                    ref={itemRef}
                    name="menu_item"
                  />
                </Form.Group>
                {/* Price */}
                <Form.Group 
                  as={Col}
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    min={1.00}
                    step={0.01}
                    id="price"
                    type="number"
                    placeholder="price"
                    name="menu_price"
                    ref={priceRef}
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