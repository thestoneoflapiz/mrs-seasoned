"use client"

import { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function ImportSalesCSVModal({ show, onModalClose }){

  const [validated, setValidated] = useState(false);
  
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
    console.log(form);
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);
  };

  return (
    <>
      <Modal 
        show={show} 
        onHide={handleModalClose} 
        size="md" 
        centered
        backdrop="static"
        keyboard={false}
      >
          <Modal.Header closeButton>
            <Modal.Title>Import Sales CSV</Modal.Title>
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
                  <Form.Label>Default file input example</Form.Label>
                  <Form.Control type="file" />
                </Form.Group>
              </Row>
              <Button type="submit">Save</Button>
            </Form>
          </Modal.Body>
        </Modal>
    </>
  );
}