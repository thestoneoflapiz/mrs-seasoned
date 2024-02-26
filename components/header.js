"use client"

import { Navbar, Container, Nav, Image, Row, Col, Button } from "react-bootstrap";
import styles from "@/app/page.module.css"
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header({ pageTitle, activePage="" }){
  const router = useRouter();
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
      name: "Menu",
      link: "/admin/menu", 
    }
  ]
  
  function logoutHandler(){
    signOut();
  }
  
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
                <Navbar.Brand className="fw-bold text-secondary">{pageTitle}</Navbar.Brand>
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
                <Button 
                  className="mx-2" 
                  variant="outline-warning" 
                  onClick={logoutHandler}
                >
                  Logout
                </Button>
                <Button 
                  className="mx-2" 
                  variant="outline-secondary" 
                  onClick={()=>router.push("/admin/user")}
                >
                  <i className="bi bi-gear-fill"></i>
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Col>
        </Row>
      </Container>
    </Navbar>
  </>);
}