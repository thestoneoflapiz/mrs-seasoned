"use client"

import { useState } from "react";
import { Container, Row, Col, Breadcrumb, Button, Form, Modal } from "react-bootstrap";
import styles from "@/app/page.module.css";
import Header from "@/components/header";
import Datatable from "@/components/datatable";
import EditSalesModal from "../_modals/edit";
import DeleteSalesModal from "../_modals/delete";

export default function SalesItem({ params }){
  const [itemDetails, setItemDetails] = useState(null)
  const [data, setData] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditModal = () => setShowEditModal(!showEditModal);
  const handleDeleteModal = () => setShowDeleteModal(!showDeleteModal);

  function getSalesItem(){
    // month, year, search, sort
    console.log("Sales DATA HERE");
  }

  return (
    <>
      <main className={styles.main}>
        <Header pageTitle="Mrs. Seasoned - Sales" activePage="Sales"/>
        <Container>
          <div className={styles.c_div}>
            <Row>
              <Col>
                <h3 className="text-light">Sales - Item</h3>
                <Breadcrumb>
                  <Breadcrumb.Item className={styles.c_link} href="/admin">Home</Breadcrumb.Item>
                  <Breadcrumb.Item className={styles.c_link} href="/admin/sales">Sales</Breadcrumb.Item>
                  <Breadcrumb.Item className={styles.c_link} active>Item - {params.id}</Breadcrumb.Item>
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
            <Row className="mb-3">
              {/* Select Type */}
              <Form.Group
                as={Col}
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  type="text"
                  value="Item Type"
                />
              </Form.Group>
              {/* Item */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  type="text"
                  value="Item"
                />
              </Form.Group>
              {/* Quantity */}
              <Form.Group 
                as={Col}
                xs={6}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  type="text"
                  value="Quantity"
                />
              </Form.Group>
              {/* Price */}
              <Form.Group 
                as={Col}
                xs={6}
                className="mb-3"
                >
                <Form.Control
                  disabled
                  type="text"
                  value="Price"
                />
              </Form.Group>
              {/* Date Bought */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  type="text"
                  value="Date Bought"
                />
              </Form.Group>
              {/* Bought From */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  type="text"
                  value="Bought From"
                />
              </Form.Group>
              {/* Remarks */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Control as="textarea" rows={2} id="remarks" placeholder="remarks" disabled defaultValue="LALALALA"/>
              </Form.Group>
              {/* CREATED BY */}
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  type="text"
                  value="created by and date"
                />
              </Form.Group>
              <Form.Group 
                as={Col} 
                xs={12}
                className="mb-3"
              >
                <Form.Control
                  disabled
                  type="text"
                  value="updated by and date"
                />
              </Form.Group>
            </Row>
            <Row>
              {data ? <Datatable dataList={data} pageLink="/admin/sales"/> : <h3>No Record Found.</h3>}
            </Row>
          </div>

          <EditSalesModal show={showEditModal} onModalClose={handleEditModal} data={itemDetails}/>
          <DeleteSalesModal show={showDeleteModal} onModalClose={handleDeleteModal} data={itemDetails}/>
        </Container>
      </main>
    </>
  )
}