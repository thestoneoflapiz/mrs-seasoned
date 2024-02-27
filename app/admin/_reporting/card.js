import { Card, Col, Container, Row } from "react-bootstrap";
import styles from "@/app/page.module.css";
import { useEffect } from "react";

export default function ReportingCardPage({ filterBy, filterMonth, filterYear }){
  const title = 0;
  const subtitle = 0;
  const total = 0;

  async function getTotalityReportSales(){
  }

  async function getTotalityReportExpenses(){
  }

  useEffect(()=>{

    getTotalityReportSales();
    getTotalityReportExpenses();

  },[filterBy, filterMonth, filterYear])
  return(
    <>
      <Container>
        <Row>
          <Col xl={2} lg={3} md={4} sm={4} xs={6}>
            <Card className={styles.c_card}>
              <Card.Body>
                <Card.Title>{title || "!ERR"}</Card.Title>
                <Card.Subtitle>{subtitle || "!ERR"}</Card.Subtitle>
                <Card.Text>
                  <h1>{total || 0}</h1>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
