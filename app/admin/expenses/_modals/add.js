"use client"

import { ItemTypes, ConstCurrentDateTimeString } from "@/helpers/constants";
import { useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Toast } from "react-bootstrap";

export default function AddExpenseModal({ show, onModalClose }){

  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });

  const item_types = ItemTypes();

  const itemTypeRef = useRef();
  const itemRef = useRef();
  const quantityRef = useRef();
  const priceRef = useRef();
  const boughtDateRef = useRef();
  const boughtFromRef = useRef();
  const remarksRef = useRef();

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

    const enteredType = itemTypeRef.current.value;
    const enteredItem = itemRef.current.value;
    const enteredQT = quantityRef.current.value;
    const enteredPrice = priceRef.current.value;
    const enteredAt = boughtDateRef.current.value;
    const enteredFrom = boughtFromRef.current.value;
    const enteredRemarks = remarksRef.current.value;

    const response = await fetch("/api/expenses/add", {
      method: "POST",
      body: JSON.stringify({
        item_type: enteredType,
        item: enteredItem,
        quantity: enteredQT,
        price: enteredPrice,
        bought_date: enteredAt,
        bought_from: enteredFrom,
        remarks: enteredRemarks,
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
            <Modal.Title>Add Expense</Modal.Title>
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
                {/* Select Type */}
                <Form.Group
                  as={Col}
                  xs={12}
                  className="mb-3"
                >
                  <Form.Select 
                    aria-label="Select Type" 
                    required
                    ref={itemTypeRef}
                  >
                    <option disabled selected value="">Select Type</option>
                    {item_types.map((type, i)=>{
                      return (<option value={type} key={i}>{type}</option>)
                    })}
                  </Form.Select>
                </Form.Group>
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
                  />
                </Form.Group>
                {/* Quantity */}
                <Form.Group 
                  as={Col}
                  xs={6}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    min={1.00}
                    step={0.01}
                    id="quantity"
                    type="number"
                    placeholder="quantity"
                    ref={quantityRef}
                  />
                </Form.Group>
                {/* Price */}
                <Form.Group 
                  as={Col}
                  xs={6}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    min={1.00}
                    step={0.01}
                    id="price"
                    type="number"
                    placeholder="price"
                    ref={priceRef}
                  />
                </Form.Group>
                {/* Date Bought */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    id="bought_date"
                    type="text"
                    placeholder="date bought"
                    defaultValue={ConstCurrentDateTimeString()}
                    ref={boughtDateRef}
                  />
                </Form.Group>
                {/* Bought From */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    id="bought_from"
                    type="text"
                    placeholder="bought from"
                    ref={boughtFromRef}
                  />
                </Form.Group>
                {/* Remarks */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                >
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    id="remarks" 
                    placeholder="remarks"
                    ref={remarksRef}
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