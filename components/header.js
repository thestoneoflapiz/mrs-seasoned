"use client"

import { Navbar, Container, Nav, Image, Row, Col } from "react-bootstrap";
import styles from "@/app/page.module.css"
import Link from "next/link";

export default function Header({ pageTitle, activePage="" }){

  const pages = [
    {
      name: "Home",
      link: "/admin", 
    },{
      name: "Expenses",
      link: "/admin/expenses", 
    },
    {
      name: "Inventory",
      link: "/admin/inventory", 
    },
    {
      name: "Sales",
      link: "/admin/sales", 
    },
    {
      name: "Reporting",
      link: "/admin/report", 
    }
  ]
  
  function generateNavs(){
    const pageNav = pages.map((page, i) => {
      let className = `nav-link ${styles.c_nav_link}`;
      if(activePage == page.name){
        className += ` ${styles.active}`;
      }
      return (<Link key={i} className={className} href={page.link}>{page.name}</Link>)
    })
    return pageNav;
  }

  return (<>
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Row className={`justify-content-start align-items-center ${styles.expand}`}>
          <Col xl={6} lg={6} md={12}>
            <Row className="justify-content-start align-items-center">
              <Col xl={1} sm={1} xs={2}>
                <Image 
                  src="/img/logo.png" 
                  alt="Mrs.Seasoned Logo Original" 
                  className={styles.logo}
                />
              </Col>
              <Col>
                <Navbar.Brand>{pageTitle}</Navbar.Brand>
              </Col>
              <Col>
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="float-end" />
              </Col>
            </Row>
          </Col>
          <Col>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                {generateNavs()}
              </Nav>
            </Navbar.Collapse>
          </Col>
        </Row>
      </Container>
    </Navbar>
  </>);
}