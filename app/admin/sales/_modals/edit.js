"use client"

import { MOPs, ConstCurrentDateTimeString } from "@/helpers/constants";
import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Toast } from "react-bootstrap";
import styles from "@/app/page.module.css";
import { sum } from "lodash";
import moment from "moment";

export default function AddSalesModal({ show, onModalClose, data}){
  const itemDetails = data;
  const mops = MOPs();

  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({
    variant: "success",
    message: ""
  });

  const [menu, setMenu] = useState([]);
  const orderDateRef = useRef();
  const customerRef = useRef();
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

    editItem();
    
    setValidated(true);
  };

  async function editItem(){
    const eDate = orderDateRef.current.value;
    const eCustomer = customerRef.current.value;
    const eDiscount = discountRef.current.value;
    const eMop = mopRef.current.value;
    const eAddress = addressRef.current.value;
    const eFee = deliveryFeeRef.current.value;
    const eRemarks = remarksRef.current.value;

    const response = await fetch("/api/sales/edit", {
      method: "POST",
      body: JSON.stringify({
        _id: itemDetails?._id || "",
        order_date: eDate,
        order_id: itemDetails.order_id || "",
        customer: eCustomer,
        orders,
        discount: parseFloat(eDiscount),
        mop: eMop,
        delivery_address: eAddress,
        delivery_fee: parseFloat(eFee),
        total: parseFloat(total),
        remarks: eRemarks,
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
      getMenu();
      
      const newOrders = itemDetails.orders.map((o)=>{
        return {
          uId: Math.random()*10,
          menu_id: o.menu_id,
          price: o.price,
          quantity: o.quantity
        }
      });

      setOrders(newOrders);
    }

      
      setTotal(itemDetails?.total || 0);

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
            <Modal.Title>Edit Sales</Modal.Title>
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
                    defaultValue={itemDetails?.order_date ? moment(itemDetails?.order_date).format("YYYY-MM-DD hh:mm A") : ""}
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
                    defaultValue={itemDetails?.order_id ||  ""}
                  />
                </Form.Group>
                {/* Customer Name */}
                <Form.Group 
                  as={Col} 
                  xs={12}
                  className="mb-3"
                >
                  <Form.Label column="sm" className="text-secondary">Customer</Form.Label>
                  <Form.Control
                    autoFocus
                    id="customer"
                    type="text"
                    placeholder="FN LN or alias"
                    ref={customerRef}
                    defaultValue={itemDetails?.customer ||  ""}
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
                    max={99.00}
                    step={0.01}
                    id="discount"
                    type="number"
                    placeholder="discount"
                    defaultValue={itemDetails?.discount || 0}
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
                    defaultValue={itemDetails?.mop || "Cash"}
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
                    defaultValue={itemDetails?.delivery_address || ""}
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
                    defaultValue={itemDetails?.delivery_fee || 0}
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
                    value={total==0?itemDetails?.total:total}
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
                    defaultValue={itemDetails?.remarks || ""}
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