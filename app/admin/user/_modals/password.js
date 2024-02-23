"use client"

import { useRef, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function PasswordModal({ show, onModalClose }){

  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("")
  const oldPasswordRef = useRef();
  const newPasswordRef = useRef();
  const confirmPasswordRef = useRef();

  function handleModalClose(){
    setValidated(false);
    onModalClose();
  }

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false || error.length>0) {
      event.stopPropagation();
      return;
    }

    setValidated(true);
  };

  function handlePasswordInput(e){
    const value = e.target.value;
    switch (e.target.id) {
      case "confirm":
        if(newPasswordRef.current.value != value){
          setError("password does not match...");
          return;
        }
        setError("");
      break;
      case "new":
        if(confirmPasswordRef.current.value != value){
          setError("password does not match...");
          return;
        }
        setError("");
        
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
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="mb-3">
                {/* Old Password */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={8}
                    id="old"
                    type="password"
                    placeholder="old password"
                    ref={oldPasswordRef}
                  />
                </Form.Group>
                {/* New Password */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={8}
                    onChange={(e)=>handlePasswordInput(e)}
                    isInvalid={error.length>0?true:false}
                    id="new"
                    type="password"
                    placeholder="new password"
                    ref={newPasswordRef}
                  />
                  {
                    error && (<Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>)
                  }
                </Form.Group>
                {/* Confirm Password */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={8}
                    onChange={(e)=>handlePasswordInput(e)}
                    isInvalid={error.length>0?true:false}
                    id="confirm"
                    type="password"
                    placeholder="confirm password"
                    ref={confirmPasswordRef}
                  />
                  {
                    error && (<Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>)
                  }
                </Form.Group>
              </Row>
              <Button type="submit">Save</Button>
            </Form>
          </Modal.Body>
        </Modal>
    </>
  );
}