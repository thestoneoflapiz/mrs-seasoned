"use client"

import { useState } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import styles from "@/app/page.module.css"

export default function LoginPage(){
  const noSpecialChars = /^[a-zA-Z0-9_]+$/;

  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({
    username: null,
    password: null
  })
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
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

  return(
    <>
    <Container fluid>
      <div  className={styles.c_login}> 
        <Row className="justify-content-center align-items-center">
          <Col xs={12}>
            <h3>Admin Dashboard Login</h3>
          </Col>
          <Col className="mt-5">
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
                  value={username}
                  type="text"
                  placeholder="username"
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
                  value={password}
                  type="password"
                  placeholder="password"
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