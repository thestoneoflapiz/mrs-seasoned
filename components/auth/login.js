"use client"

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";

import { Container, Row, Col, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import styles from "@/app/page.module.css"

export default function LoginPage(){
  const noSpecialChars = /^[a-zA-Z0-9_]+$/;

  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({
    username: null,
    password: null,
  })
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const usernameRef = useRef();
  const passwordRef = useRef();
  
  function setErrorMessage(field, msg){
    setErrors((prev)=>{
      const newState = prev;
      newState[field] = msg;
      return newState;
    });
  }

  // async function createUser(user, pass){
  //   const response = await fetch("/api/auth/signup", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       username: user,
  //       password: pass
  //     },{
  //       headers:{
  //         "Content-Type": "application/json"
  //       }
  //     })
  //   });

  //   const data = await response.json();

  //   if(!response.ok){
  //     alert(data.message || "SOMETHING WENT WRONG!")
  //   }
  // }

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    const enteredUsername = usernameRef.current.value;
    const enteredPassword = passwordRef.current.value;
    // createUser(enteredUsername, enteredPassword);
    const result = await signIn("credentials", {
      redirect: false,
      username: enteredUsername,
      password: enteredPassword,
    });

    if(result?.error){
      setToastMsg(result.error);
      setShowToast(true);
      return;
    }

    setValidated(true);
  };

  function handleInput(e){
    const value = e.target.value;
    let errors = [];

    switch (e.target.id) {
      case "username":
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

  return(
    <>
    <Container fluid>
      <ToastContainer
        className="p-3"
        position="top-center"
        style={{ zIndex: 1 }}
      >
        <Toast 
          bg="danger"
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={5000} 
          autohide
          position="top-center"
        >
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
      <div  className={styles.c_login}> 
        <Row className="justify-content-center align-items-center">
          <Col xs={12} className="mb-5">
            <h3>Admin Dashboard Login</h3>
          </Col>
          <Col>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Form.Group 
                  as={Col} md="12" 
                  className="mb-3"
                >
                  <Form.Control
                    required
                    minLength={8}
                    onChange={(e)=>handleInput(e)}
                    isInvalid={errors.username}
                    id="username"
                    type="text"
                    placeholder="username"
                    ref={usernameRef}
                  />
                  {
                    errors.username && errors.username.map((err, i)=><Form.Control.Feedback type="invalid" key={i}>{err}</Form.Control.Feedback>)
                  }
                </Form.Group>
                <Form.Group 
                  as={Col} 
                  md="12" 
                >
                  <Form.Control
                    required
                    minLength={8}
                    onChange={(e)=>handleInput(e)}
                    isInvalid={errors.password}
                    id="password"
                    type="password"
                    placeholder="password"
                    ref={passwordRef}
                  />
                  {
                    errors.password && errors.password.map((err, i)=><Form.Control.Feedback type="invalid" key={i}>{err}</Form.Control.Feedback>)
                  }
                </Form.Group>
              </Row>
              <Button type="submit">Login</Button>
            </Form>
          </Col>
        </Row>
      </div>
    </Container>
    </>
  )
}