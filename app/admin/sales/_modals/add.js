"use client"

import { MOPs, ConstCurrentDateTimeString } from "@/helpers/constants";
import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Toast } from "react-bootstrap";
import styles from "@/app/page.module.css";
import { sum } from "lodash";
import Select from "react-select";


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
  const [ddCustomer, setDDCustomer] = useState("");
  const [orders, setOrders] = useState([]);
  const discountRef = useRef();
  const [total, setTotal] = useState(0);
  const mopRef = useRef();
  const addressRef = useRef();
  const deliveryFeeRef = useRef();
  const remarksRef = useRef();

  function resetState(){
    setValidated(false);
    setOrders([]);
    setTotal(0);
    setShowCreateCustomer(false);
  }

  function handleAddFG(){
    const newOrders = [...orders];
    newOrders.push({
      uId: Math.random()*10,
      menu_id: "",
      price: 0,
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
    const value = e.target.value;

    switch (e.target.id) {
      case `order_item_${i}`:
        const item = menu.find((i)=>i._id==value);
        setOrders((prev)=>{
          prev[i].menu_id = item._id ?? value;
          prev[i].price = item.price ?? 0;
          return prev;
        });
        setTimeout(() => {
          computeTotalAmountToPay();
        }, 1000);
      break;

      case `order_quantity_${i}`:
        setOrders((prev)=>{
          prev[i].quantity = value;
          return prev;
        });
        setTimeout(() => {
          computeTotalAmountToPay();
        }, 1000);
      break;

      default:
      break;
    }
  }

  function computeTotalAmountToPay(){
    const currDiscount = parseFloat(discountRef.current?.value) ?? 0;
    const currDF = parseFloat(deliveryFeeRef.current?.value) ?? 0;

    if(orders.length==0) setTotal(currDF);

    const orderPrices = orders.map((or)=>{
      if(!or.menu_id) return 0;

      const menuPrice = menu.find((m)=>m._id==or.menu_id);
      if(!menuPrice) return 0;
      return or.quantity * menuPrice.price;
    })

    const totalAmountOrders = sum(orderPrices);
    let discounted = totalAmountOrders;
    if(currDiscount){
      discounted = totalAmountOrders * ((100-currDiscount)/100);
    }

    setTotal(discounted+currDF);
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
              onChange={(e)=>handleDynamicOrderChange(i,e)}
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
              onChange={(e)=>handleDynamicOrderChange(i,e)}
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
    resetState();
  }
  
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    createItem();
    
    setValidated(true);
  };

  async function createItem(){
    const eDate = orderDateRef.current.value;
    const isNewCustomer = showCreateCustomer;
    const eCustomer = isNewCustomer ? customerRef.current.value : ddCustomer.value
    const eDiscount = discountRef.current.value;
    const eMop = mopRef.current.value;
    const eAddress = addressRef.current.value;
    const eFee = deliveryFeeRef.current.value;
    const eRemarks = remarksRef.current.value;

    const response = await fetch("/api/sales/add", {
      method: "POST",
      body: JSON.stringify({
        order_date: eDate,
        order_id: orderId,
        customer: eCustomer,
        orders,
        discount: parseFloat(eDiscount),
        mop: eMop,
        delivery_address: eAddress,
        delivery_fee: parseFloat(eFee),
        total: parseFloat(total),
        remarks: eRemarks,
        is_new_customer: isNewCustomer,
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

  // drop-down customers
  const [customers, setCustomers] = useState([]);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  
  async function getCustomers(){
    const response = await fetch("/api/customers/list?paginate=0", {
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
    const ddCustomerLis = list.map((d)=>{
      return {
        value: d._id,
        label: d.name
      }
    });
    setCustomers(ddCustomerLis);
  }
  
  useEffect(()=>{
    if(show){
      getOrderId();
      getMenu();
      getCustomers();
    }
  },[show])

  useEffect(()=>{
    computeTotalAmountToPay();
  },[orders]);

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
              <Row className="mb-3 align-items-center">
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
                    defaultValue={ConstCurrentDateTimeString()}
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
                {/* Customer Name */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Customer</Form.Label>
                  <Row className="mb-2">
                    <Col xs={12} style={{textAlign: "right"}} className="px-3">
                      <Button 
                        variant={showCreateCustomer?"outline-success":"outline-primary"}
                        onClick={()=>{setShowCreateCustomer(!showCreateCustomer)}}
                        size="sm"
                        className=""
                      >
                        {showCreateCustomer ? "Existing":"New"} Customer
                      </Button>
                    </Col>
                  </Row>
                  {
                    showCreateCustomer ? (
                    <Form.Control
                      autoFocus
                      id="customer"
                      type="text"
                      placeholder="FN LN or alias"
                      ref={customerRef}
                      required
                    />) : (
                    <Select
                      required
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                      isSearchable
                      name="customer_dd"
                      options={customers}
                      onChange={(selected) => setDDCustomer(selected)}
                    />)
                  }

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
                    max={99.00}
                    step={0.01}
                    id="discount"
                    type="number"
                    placeholder="discount"
                    defaultValue={0}
                    ref={discountRef}
                    onChange={computeTotalAmountToPay}
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
                  xs={6}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Delivery Fee</Form.Label>
                  <Form.Control
                    id="deliver_fee"
                    min={0.00}
                    max={99.00}
                    step={0.01}
                    type="number"
                    placeholder="delivery fee"
                    defaultValue={0}
                    ref={deliveryFeeRef}
                    onChange={computeTotalAmountToPay}
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
                    type="number"
                    min={0}
                    value={total}
                    onChange={()=>console.log("trigger total")}
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