"use client"

import { useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Toast } from "react-bootstrap";

export default function PasswordModal({ show, onModalClose }){

  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("")
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });


  const oldPasswordRef = useRef();
  const newPasswordRef = useRef();
  const confirmPasswordRef = useRef();

  function handleModalClose(data){
    setValidated(false);
    onModalClose(data);
  }

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false || error.length>0) {
      event.stopPropagation();
      return;
    }

    const enteredOld = oldPasswordRef.current.value;
    const enteredPassword = newPasswordRef.current.value;
    changePassword(enteredOld, enteredPassword);


    setValidated(true);
  };

  async function changePassword(old, password){
    const response = await fetch("/api/user/password", {
      method: "POST",
      body: JSON.stringify({
        old: old,
        password: password
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