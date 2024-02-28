"use client"

import { Navbar, Container, Nav, Image, Row, Col, Button } from "react-bootstrap";
import styles from "@/app/page.module.css"
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminAccess, defaultPages, staffAccess } from "@/helpers/constants";

export default function Header({ pageTitle, activePage="" }){
  const { data: session } = useSession();

  const router = useRouter();
  const [pages, setPages] = useState([]);
  
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

  function displayAccessible(){
    if(session.user && session.user.role){
      switch (session.user.role) {
        case "admin":
          const adminPage = defaultPages.filter((p)=>adminAccess.includes(p.link))
          setPages(adminPage);
        break;
        case "staff":
          const staffPage = defaultPages.filter((p)=>staffAccess.includes(p.link))
          setPages(staffPage);
          break;
      
        default:
          setPages(defaultPages);
        break;
      }
    }
  }

  useEffect(()=>{
    displayAccessible();
  }, [session])

  return (<>
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Row className={`justify-content-start align-items-center ${styles.expand}`}>
          <Col xl={6} lg={6} md={12}>
            <Row className="justify-content-start align-items-center">
              <Col md={6} sm={6} xs={9}>
                <Image 
                  src="/img/logo.png" 
                  alt="Mrs.Seasoned Logo Original" 
                  className={styles.logo+" me-2"}
                />
                <Navbar.Brand className="fw-bold text-secondary">{pageTitle}</Navbar.Brand>
              </Col>
              <Col md={6} sm={6} xs={3}>
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