"use client"

import { UserRoles } from "@/helpers/constants";
import { useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Toast } from "react-bootstrap";

export default function EditUserModal({ show, onModalClose, data }){
  const noSpecialChars = /^[a-zA-Z0-9_]+$/;
  const roles = UserRoles();

  const userDetails = data;
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });

  const [error, setError] = useState({
    username: false
  });

  const nameRef = useRef();
  const usernameRef = useRef();
  const userRoleRef = useRef();

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

    if(error.username){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "danger";
        newState.message = "username: letters, numbers, or underscore only!";
        return newState;
      });

      setShowToast(true);
      return;
    }

    editItem();
    
    setValidated(true);
  };

  async function editItem(){

    const eName = nameRef.current.value;
    const eUsername = usernameRef.current.value;
    const eUserRole = userRoleRef.current.value;

    const response = await fetch("/api/users/edit", {
      method: "POST",
      body: JSON.stringify({
        _id: userDetails._id,
        name: eName,
        username: eUsername,
        role: eUserRole,
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

  function handleInputUN(e){
    const value = e.target.value;

    if(value.length > 0){
      if(!noSpecialChars.test(value)){
        setError({
          username: true
        })

        return;
      }
    }
    
    setError({
      username: false
    })
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
                {/* Select Role */}
                <Form.Group
                  as={Col}
                  xs={12}
                  className="mb-3"
                >
                  <Form.Select 
                    aria-label="Select Role" 
                    required
                    ref={userRoleRef}
                    defaultValue={userDetails?.role || ""}
                  >
                    <option disabled selected value="">Select Role</option>
                    {roles.map((role, i)=>{
                      return (<option value={role} key={i}>{role}</option>)
                    })}
                  </Form.Select>
                </Form.Group>
                {/* Name */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={2}
                    id="name"
                    type="text"
                    placeholder="name"
                    ref={nameRef}
                    defaultValue={userDetails?.name || "!!ERR"}
                  />
                </Form.Group>
                {/* Username */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={8}
                    id="username"
                    type="text"
                    placeholder="username"
                    ref={usernameRef}
                    defaultValue={userDetails?.username || "!!ERR"}
                    isInvalid={error.username}
                    onChange={(e)=>handleInputUN(e)}
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