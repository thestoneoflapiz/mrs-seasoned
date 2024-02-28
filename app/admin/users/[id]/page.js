"use client"

import { useEffect, useState } from "react";
import { Container, Row, Col, Breadcrumb, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import styles from "@/app/page.module.css";
import EditUserModal from "../_modals/edit";
import DeleteUserModal from "../_modals/delete";
import { convertDateToString } from "@/helpers/date";
import Loading from "@/components/loading";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserItem({ params }){
  const route = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });
  const [userDetails, setUserDetails] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditModal = () => setShowEditModal(true);
  const handleDeleteModal = () => setShowDeleteModal(true);
  const handleModalClose = (data) => {
    if(data){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = data.variant;
        newState.message = data.message;
        return newState;
      });
      setShowToast(true);
      getUserItemDetails();
    }
    setShowEditModal(false)
    setShowDeleteModal(false)

    if(data && data?.mode == "delete"){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "info";
        newState.message = "Redirecting to Users page...";
        return newState;
      });
      setShowToast(true);

      setTimeout(() => {
        route.push("/admin/users");
      }, 2500);
    }
  };

  async function getUserItemDetails(){
    setIsLoading(true);

    const response = await fetch(`/api/users/item?_id=${params?.id}`, {
      method: "GET",
    });

    const result = await response.json();

    if(!response.ok){
      setToastMsg((prev)=>{
        const newState = prev;
        newState.variant = "danger";
        newState.message = result.message || "SOMETHING WENT WRONG!";
        return newState;
      });

      setShowToast(true);
      setUserDetails(null);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return;
    }
    
    const { item } = result;
    setUserDetails(item);

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }


  useEffect(()=>{
    getUserItemDetails();
  }, []);

  return (
    <>
      <Container>
        <ToastContainer
          className="p-3"
          position="top-center"
          style={{ zIndex: 1 }}
        >
          <Toast 
            bg={toastMsg.variant}
            onClose={() => setShowToast(false)} 
            show={showToast} 
            delay={5000} 
            autohide
            position="top-center"
          >
            <Toast.Body className="text-white">{toastMsg.message}</Toast.Body>
          </Toast>
        </ToastContainer>
        {
          (isLoading===false && userDetails===null) && (<>
            <h3 className="text-center fw-bold my-5"><Link href="/admin/users" className="text-light">No Record Found.</Link></h3>
          </>)
        }
        <div className={styles.c_div}>
          <Row>
            <Col>
              <h3 className="text-light">User - Item</h3>
              <Breadcrumb>
                <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} href="/admin/users">Users</Breadcrumb.Item>
                <Breadcrumb.Item className={styles.c_link} active>Item - {userDetails?.name || params.id}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row className="justify-content-end align-items-center mb-2">
            <Col>
              <Button variant="outline-danger" className="float-end mx-3" onClick={handleDeleteModal}>Delete</Button>
              <Button variant="warning" className="float-end" onClick={handleEditModal}>Edit</Button>
            </Col>
          </Row>
        </div>
        <div className={styles.c_div__color}>
          {isLoading ? (<Loading variant="info" />): (
            <Row className="mb-3">
              {/* Select Role */}
              <Form.Group
                as={Col}
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  minLength={2}
                  id="role"
                  type="text"
                  placeholder="role"
                  defaultValue={userDetails?.role || ""}
                />
              </Form.Group>
              {/* Name */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  minLength={2}
                  id="name"
                  type="text"
                  placeholder="name"
                  defaultValue={userDetails?.name || ""}
                />
              </Form.Group>
              {/* Username */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  minLength={2}
                  id="username"
                  type="text"
                  placeholder="username"
                  defaultValue={userDetails?.username || ""}
                />
              </Form.Group>
              {/* CREATED BY */}
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Created</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={`${userDetails?.created_by || "!!ERR"} | ${convertDateToString(userDetails?.created_at)}`}
                />
              </Form.Group>
              <Form.Group 
                as={Col} 
                xs={6}
                className="mb-3"
              >
                <Form.Label column="sm">Updated</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={userDetails?.updated_at ? `${userDetails?.updated_by || "!!ERR"} | ${convertDateToString(userDetails?.updated_at)}` : "--"}
                />
              </Form.Group>
            </Row>
          )}
        </div>
      </Container>
      {
        userDetails && (<>
        <EditUserModal show={showEditModal} onModalClose={handleModalClose} data={userDetails}/>
        <DeleteUserModal show={showDeleteModal} onModalClose={handleModalClose} data={userDetails}/>
        </>)
      }
    </>
  )
}