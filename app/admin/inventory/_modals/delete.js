"use client"

import { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function DeleteInventoryModal({ show, onModalClose, data }){

  function handleModalClose(){
    onModalClose();
  }
  
  function handleDeleteInventory(){
    console.log("DELETED!", data);
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
            <p>Are you sure to delete {data?.title && "inventory item"}?</p>
            <Row className="justify-content-end align-items-center">
              <Col sm={3} xs={4}>
                <Button type="button" variant="primary" onClick={handleDeleteInventory}>Yes</Button>
              </Col>
              <Col sm={3} xs={4}>
                <Button type="button" variant="outline-danger" onClick={handleModalClose}>No</Button>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
    </>
  );
}