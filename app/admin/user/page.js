"use client"

import styles from "@/app/page.module.css";
import { 
  Container, 
  Row, Col, 
  Breadcrumb, 
  Button, 
} from "react-bootstrap";
import { useSession } from "next-auth/react";
import PasswordModal from "./_modals/password";
import { useState } from "react";

export default function UserPage(){
  const { data: session, status } = useSession();
  const user = session?.user;

  const [show, setShow] = useState(false);
  const handlePasswordModalOpen = () => setShow(true);
  const handlePasswordModalClose = () => setShow(false);

  return(
    <>
      <Container>
        <div className={styles.c_div}>
          <Row>
            <Col>
              <h3 className="text-light">User Settings</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} active>User Settings</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row className="justify-content-end align-items-center mb-2">
            <Col lg={2} md={3} sm={6} xs={6}>
              <Button variant="primary" className="float-end" onClick={handlePasswordModalOpen}>Change Password</Button>
            </Col>
          </Row>
        </div>
        <div className={styles.c_div__color}>
          <Container>
            <Row className="justify-content-center align-items-center">
              <Col>Username: {user.username}</Col>
              <Col>Role: </Col>
            </Row>
            <Row className="justify-content-center align-items-center">
              <Col className="fw-bold" xs={12}>User Details</Col>
              <Col>Name:</Col>
              <Col>Address:</Col>
            </Row>
            <Row className="justify-content-center align-items-center">
              <Col className="text-secondary" xs={12}>Created: System | 2021-01-01 10:30 PM</Col>
              <Col className="text-secondary" xs={12}>Updated: System | 2021-01-01 10:30 PM</Col> 
            </Row>
          </Container>
        </div>
        <PasswordModal onModalClose={handlePasswordModalClose} show={show}/>
      </Container>
    </>
  );
}