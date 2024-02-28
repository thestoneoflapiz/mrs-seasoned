import { Card, Col, Container, Row } from "react-bootstrap";
import styles from "@/app/page.module.css";
import { useEffect, useState } from "react";
import moment from "moment";

export default function ReportingCardPage({ filterBy, fMonth, fYear }){
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  
  const dateString = filterBy=="month" ? `${moment(fMonth).format("MMMM")} ${fYear}` : fYear;
  const defaultSales = [
    {
      name: "Sales",
      desc: "# and amount",
      amount: 0,
    }, 
    {
      name: "Fee",
      desc: "Delivery fees",
      amount: 0
    }, 
    {
      name: "Discounts",
      desc: "# and amount",
      amount: 0
    }, 
    {
      name: "Customers",
      desc: "# of customers",
      amount: 0
    },
    {
      name: "Places",
      desc: "# of places",
      amount: 0
    }
  ];

  const defaultExpenses = [
    {
      name: "Expenses",
      desc: "# and amount",
      amount: 0
    }
  ];

  const [totalExpenses, setTotalExpenses] = useState(defaultExpenses);
  const [totalSales, setTotalSales] = useState(defaultSales);

  const title = 0;
  const subtitle = 0;
  const total = 0;

  async function getTotalityReportSales(){
    setIsLoadingSales(true);

    const filters = new URLSearchParams({
      report: "totality",
      month: fMonth,
      year: fYear,
      filter: filterBy
    });

    const response = await fetch(`/api/sales/report?${filters}`, {
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

      setTotalSales(defaultSales);
      setTimeout(() => {
        setIsLoadingSales(false);
      }, 1500);
      return;
    }
  
    setTotalSales((result?.data && result.data.length) ? result.data : defaultSales);

    setTimeout(() => {
      setIsLoadingSales(false);
    }, 1500);
  }

  async function getTotalityReportExpenses(){
    setIsLoadingExpenses(true);

    const filters = new URLSearchParams({
      report: "totality",
      month: fMonth,
      year: fYear,
      filter: filterBy
    });

    const response = await fetch(`/api/expenses/report?${filters}`, {
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

      setTotalExpenses(defaultExpenses);
      setTimeout(() => {
        setIsLoadingExpenses(false);
      }, 1500);
      return;
    }

    setTotalExpenses((result?.data && result.data.length) ? result.data : defaultExpenses);

    setTimeout(() => {
      setIsLoadingExpenses(false);
    }, 1500);
  }

  useEffect(()=>{
    getTotalityReportSales();
    getTotalityReportExpenses();
  },[filterBy, fMonth, fYear])

  return(
    <>
      <Container className="mt-5">
        <Row className="justify-content-center align-items-center">
          {totalExpenses.map((s,i)=>{
            return(
              <Col xl={2} lg={3} md={4} sm={4} xs={6} className="mb-3" key={i+"expensesdiv"}>
                <Card className={styles.c_card}>
                  <Card.Body>
                    <Card.Title>{s.name || "!ERR"}</Card.Title>
                    <Card.Subtitle>{s.desc || ""}</Card.Subtitle>
                    <Card.Text className="fs-3">
                      {s.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }) || 0}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              )
          })}
          {totalSales.map((s,i)=>{
            return(
              <Col xl={2} lg={3} md={4} sm={4} xs={6} className="mb-3" key={i+"salesdiv"}>
                <Card className={styles.c_card}>
                  <Card.Body>
                    <Card.Title>{s.name || "!ERR"}</Card.Title>
                    <Card.Subtitle>{s.desc || ""}</Card.Subtitle>
                    <Card.Text className="fs-3">
                      {s.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }) || 0}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              )
          })}
        </Row>
      </Container>
    </>
  )
}
