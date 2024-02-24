import { Container, Spinner, Row, Col } from "react-bootstrap";
import styles from "@/app/page.module.css";

export default function Loading({variant}){
  return (<>
    <Container className={styles.c_loading_wrapper}>
      <Row className="justify-content-center align-items-center">
        <Col lg={2} md={3} sm={3} xs={4}>
          <Spinner animation="grow" variant={variant} size="sm"/>
          <Spinner animation="grow" variant={variant} size="sm"/>
          <Spinner animation="grow" variant={variant} />
          <Spinner animation="grow" variant={variant} size="sm"/>
        </Col>
      </Row>
    </Container>
  </>)
}