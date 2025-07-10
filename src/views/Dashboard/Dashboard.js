import React from "react";


import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";

import TopCharts from "../../components/Charts/TopCharts";

//const useStyles = makeStyles(styles);

export default function Dashboard() {

    return (
        <span>
        <Navbar className={"mainNavBar"}>
            <Container>
                <Navbar.Brand className={"mainNavBar"} href="#home">DeepPhe Visualizer<span
                    style={{"fontSize": '20px'}}> v2.0.0.0</span></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="justify-content-end" style={{width: "100%"}}>

                       <Nav.Link className={"navItem"} target="_blank"
                                 href="https://deepphe.github.io/">About</Nav.Link>
                        <Nav.Link className={"navItem"} target="_blank"
                                  href="https://github.com/DeepPhe/">GitHub</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
            <div id={"top-charts"}>{ TopCharts()}</div>

              {/*<Grid container direction="row" justifyContent="center" align="center" spacing={10} >*/}

              {/*  <Grid item xs={12} sm={12} md={10} xl={8}>*/}
              {/*              <DerivedChart>*/}
              {/*              </DerivedChart>*/}
              {/*  </Grid>*/}
              {/* =*/}
              {/*</Grid>*/}

        <div className={"mainFooter"}>
            <Row>
                <Col md={1}></Col>
                <Col md={4}>Supported by the <a target="_blank" rel="noopener noreferrer" href="https://itcr.cancer.gov/">National Cancer Institute's Information Technology for Cancer Research</a> initiative. (Grant #U24CA248010)</Col>
                <Col md={1}></Col>
                <Col md={5}>©2023 Harvard Medical School, University of Pittsburgh, and Vanderbilt University Medical Center.</Col>
               <Col md={1}></Col>
            </Row>
        </div>
        </span>
)}
