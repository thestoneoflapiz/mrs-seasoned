"use client"

import { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function EditExpenseModal({ show, onModalClose, data }){

  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({
    item: null,
    price: null,
    payment: null,
    bought_date: null,
  });

  const [types, setTypes] = useState([
    "Chicken", "Pork", "Beef", "Rice", 
    "Condiments", "Packaging", "Vegetables", 
    "Seafood", "Processed", "Others"
  ])
  
  function handleModalClose(){
    setValidated(false);
    onModalClose();
  }
  
  function setErrorMessage(field, msg){
    setErrors((prev)=>{
      const newState = prev;
      newState[field] = msg;
      return newState;
    });
  }

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);
  };

  function handleInput(e){
    const value = e.target.value;
    let errors = [];

    switch (e.target.id) {
      case "username":
        setUsername(value);
    
        errors = [];
        if(value.length > 0){
          if(!noSpecialChars.test(value)){
            errors.push("letters, numbers, or underscore only!");
          }
        }
        
        if(value.length < 8){
            errors.push("minimum of 8 characters");
        }
    
        if(errors.length){
          setErrorMessage("username", errors)
          return;
        }
        setErrorMessage("username", null)
      break;
    
      case "password":
        setPassword(value);
    
        errors = [];
        if(value.length < 8){
            errors.push("minimum of 8 characters");
        }
    
        if(errors.length){
          setErrorMessage("password", errors)
          return;
        }
        setErrorMessage("password", null)
      break;
    }
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
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="mb-3">
                {/* Select Type */}
                <Form.Group
                  as={Col}
                  xs={12}
                  className="mb-3"
                >
                  <Form.Select aria-label="Select Type">
                    <option disabled selected>Select Type</option>
                    {types.map((type, i)=>{
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
                  />
                  {
                    errors.item && errors.item.map((err, i)=><Form.Control.Feedback type="invalid" key={i}>{err}</Form.Control.Feedback>)
                  }
                </Form.Group>
                {/* Quantity */}
                <Form.Group 
                  as={Col}
                  xs={6}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    id="quantity"
                    type="number"
                    placeholder="quantity"
                  />
                  {
                    errors.quantity && errors.quantity.map((err, i)=><Form.Control.Feedback type="invalid" key={i}>{err}</Form.Control.Feedback>)
                  }
                </Form.Group>
                {/* Price */}
                <Form.Group 
                  as={Col}
                  xs={6}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    min={1}
                    id="price"
                    type="number"
                    placeholder="price"
                  />
                  {
                    errors.price && errors.price.map((err, i)=><Form.Control.Feedback type="invalid" key={i}>{err}</Form.Control.Feedback>)
                  }
                </Form.Group>
                {/* Date Bought */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={2}
                    id="bought_date"
                    type="text"
                    placeholder="date bought"
                  />
                  {
                    errors.bought_date && errors.bought_date.map((err, i)=><Form.Control.Feedback type="invalid" key={i}>{err}</Form.Control.Feedback>)
                  }
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
                  />
                </Form.Group>
                {/* Remarks */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                >
                  <Form.Control as="textarea" rows={2} id="remarks" placeholder="remarks"/>
                </Form.Group>
              </Row>
              <Button type="submit">Save</Button>
            </Form>
          </Modal.Body>
        </Modal>
    </>
  );
}