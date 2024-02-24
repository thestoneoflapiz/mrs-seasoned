"use client"

import { MOPs, ConstCurrentDateString } from "@/helpers/constants";
import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Toast } from "react-bootstrap";
import styles from "@/app/page.module.css";

export default function AddSalesModal({ show, onModalClose }){
  const mops = MOPs();

  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });

  const [menu, setMenu] = useState([]);
  const [orderId, setOrderId] = useState("");
  const orderDateRef = useRef();
  const customerRef = useRef();
  const customerIdRef = useRef();
  const [orders, setOrders] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const mopRef = useRef();
  const addressRef = useRef();
  const deliveryFeeRef = useRef();
  const remarksRef = useRef();


  function handleAddFG(){
    const newOrders = [...orders];
    newOrders.push({
      uId: Math.random()*10,
      menu_id: "",
      quantity: 1
    });

    setOrders(newOrders);
  }

  function handleRemoveFG(index){
    let newOrders = [...orders];
    newOrders.splice(index,1);
    setOrders(newOrders);
  }

  function handleDynamicOrderChange(i,e){

  }

  function generateOrderForms(){
    const form = orders.map((order,i)=>{
      return(
        <div key={order.uId+`_divFG`} className="row">
          <Form.Group 
            as={Col} 
            xs={6}
            className="mb-3"
          >
            <Form.Label column="sm" className="text-secondary">Item#{i+1}</Form.Label>
            <Form.Select 
              required
              id={`order_item_${i}`}
              aria-label="Select MOP" 
              defaultValue={order.menu_id}
            >
              <option disabled value="">Select Item</option>
              {menu.map((m, ii)=>{
                return (<option value={m._id} key={ii}>{m.name}</option>)
              })}
            </Form.Select>
          </Form.Group>
          <Form.Group 
            as={Col} 
            xs={4}
            className="mb-3"
          >
            <Form.Label column="sm" className="text-secondary">QT</Form.Label>
            <Form.Control
              required
              id={`order_quantity_${i}`}
              min={1}
              type="number"
              placeholder="quantity"
              defaultValue={order.quantity}
            />
          </Form.Group>
          <Col xs={2} className="p-2">
            <Form.Label></Form.Label>
            <Button 
              variant="outline-danger" 
              onClick={()=>handleRemoveFG(i)}
              size="sm"
            >
              <i className="bi bi-trash-fill"></i>
            </Button>
          </Col>
        </div>
      )
    });
    return form;
  }

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

    // createItem();
    
    setValidated(true);
  };

  async function createItem(){

    const response = await fetch("/api/sales/add", {
      method: "POST",
      body: JSON.stringify({},{
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

  async function getOrderId(){

    const response = await fetch("/api/sales/orderId", {
      method: "GET",
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

    const { order_id } = data;
    setOrderId(order_id);
  }

  async function getMenu(){
    const response = await fetch("/api/menu/list?paginate=0", {
      method: "GET",
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

    const { list } = data;
    setMenu(list);
  }
  
  useEffect(()=>{
    if(show){
      getOrderId();
      getMenu();
    }
  },[show])

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
            <Modal.Title>Add Sales</Modal.Title>
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
              <Row className="mb-3 justify-content-center align-items-center">
                {/* Order Date */}
                <Form.Group 
                  as={Col} 
                  xs={6}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Order Date</Form.Label>
                  <Form.Control
                    required
                    id="order_date"
                    type="text"
                    placeholder="order date"
                    defaultValue={ConstCurrentDateString()}
                    ref={orderDateRef}
                  />
                </Form.Group>
                {/* Order # */}
                <Form.Group 
                  as={Col} 
                  xs={6}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Order#</Form.Label>
                  <Form.Control
                    plaintext
                    id="order_id"
                    type="text"
                    defaultValue={orderId}
                  />
                </Form.Group>

                {/* Order Form Group */}
                <Col xs={12} style={{textAlign: "right"}} className="px-3">
                  <Button 
                    variant="outline-primary" 
                    onClick={handleAddFG}
                    size="sm"
                    className=""
                  >
                    Add Item
                  </Button>
                </Col>
                <Col xs={12} className={styles.c_orders_wrapper}>
                  {generateOrderForms()}
                </Col>

                {/* Discount */}
                <Form.Group 
                  as={Col}
                  xs={6}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Discount%</Form.Label>
                  <Form.Control
                    min={0.00}
                    step={0.01}
                    id="discount"
                    type="number"
                    placeholder="discount"
                    defaultValue={discount}
                  />
                </Form.Group>
                {/* Total */}
                <Form.Group 
                  as={Col} 
                  xs={6}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Total Amount to Pay</Form.Label>
                  <Form.Control
                    plaintext
                    id="total"
                    type="text"
                    placeholder="total"
                    defaultValue={total}
                  />
                </Form.Group>
                {/* Select MOP */}
                <Form.Group
                  as={Col}
                  xs={12}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">MOP</Form.Label>
                  <Form.Select 
                    aria-label="Select MOP" 
                    required
                    ref={mopRef}
                    defaultValue="Cash"
                  >
                    <option disabled value="">Select MOP</option>
                    {mops.map((mop, i)=>{
                      return (<option value={mop} key={i}>{mop}</option>)
                    })}
                  </Form.Select>
                </Form.Group>
                {/* Address */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Delivery Address</Form.Label>
                  <Form.Control
                    required
                    id="address"
                    type="text"
                    placeholder="Street, Brgy, City"
                    ref={addressRef}
                  />
                </Form.Group>
                {/* Delivery Fee */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Delivery Fee</Form.Label>
                  <Form.Control
                    id="deliver_fee"
                    min={0}
                    type="number"
                    placeholder="0"
                    ref={deliveryFeeRef}
                  />
                </Form.Group>
                {/* Remarks */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                >
                  <Form.Label column="sm" className="text-secondary">Remarks</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    id="remarks" 
                    placeholder="things to note...?"
                    ref={remarksRef}
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