"use client"

import { useState, useRef } from "react";
import { Modal, Button, Form, Row, Col, Toast } from "react-bootstrap";
import Papa from "papaparse";

export default function ImportSalesCSVModal({ show, onModalClose }){

  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });

  const fileRef = useRef();

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
    
    if(fileRef.current.files.length==0){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "danger";
        newState.message = "Please select a CSV file...";
        return newState;
      });
      setShowToast(true);
    }

    parseCSVFile();
    setValidated(true);
  };

  function parseCSVFile(){
    const file = fileRef.current.files[0];
    Papa.parse(file, {
      complete: function(result) {
        importCSVFile(result.data);
      }
    });
  }

  async function importCSVFile(csv){
    const response = await fetch("/api/sales/import", {
      method: "POST",
      body: JSON.stringify({
        data: csv
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
        size="md" 
        centered
        backdrop="static"
        keyboard={false}
      >
          <Modal.Header closeButton>
            <Modal.Title>Import Sales CSV</Modal.Title>
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
                <Form.Group
                  as={Col}
                  xs={12}
                  className="mb-3"
                >
                  <Form.Label>Default file input example</Form.Label>
                  <Form.Control 
                    required
                    type="file" 
                    ref={fileRef} 
                    accept=".csv"
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