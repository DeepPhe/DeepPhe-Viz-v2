import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
// import CustomTable from "../../components/CustomTables/CustomTable";
import PatientEpisodeTimeline from "../../components/Charts/PatientEpisodeTimeline";
import EventRelationTimeline from "../../components/Charts/EventRelationTimeline";
import CardHeader from "../../components/Card/CardHeader";
import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { DocumentViewer } from "../../components/DocumentViewer/DocumentViewer";
import { isEmpty } from "../../utils/JsObjectHelper";
import { setEventHandlers } from "./patientEventHandlers";
import { factBasedReports } from "./FactUtils";

import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Box from "@mui/material/Box";
import { getConceptsPerDocumentRef, hasDocuments } from "../../utils/PersonObjectHelper";
import { getPatientDocument } from "../../utils/PatientDocumentGetter";
import IconButton from "@mui/material/IconButton";
import PatientDemographics from "../../components/PatientDemographics/patientDemographics";
import CancerDataTables from "../../components/DeepPhe/CancerDataTables/CancerDataTables";
import { fetchPatientDatabase } from "../../utils/db/DeepPheDb";
import { fetchPatientCancers } from "../../utils/db/Patient";

function Patient(props) {
  const { patientId } = useParams();
  const [summary, setSummary] = useState({});
  const [db, setDb] = useState(undefined);
  const [patientDocument, setPatientDocument] = useState({});
  const [demogaphics, setDemographics] = useState({});
  const [patientObject, setPatientObject] = useState(undefined);
  const [reportId, setReportId] = useState("");
  const [factId, setFactId] = useState({});
  const [gettingSummary, setGettingSummary] = useState(false);
  const [currDocId, setCurrDocId] = useState(0);
  const [clickedTerms, setClickedTerms] = useState([]); // Initial state set to empty array
  const [processingDone, setProcessingDone] = useState(false);
  const [expandedPatientEpisode, setExpandedPatientEpisode] = useState(true); // initially open
  const [expandedEventRelation, setExpandedEventRelation] = useState(true); // initially open
  const [expandedPatientID, setExpandedPatientID] = useState(true); // initially open
  const [expandedCancerDetail, setExpandedCancerDetail] = useState(true); // initially open
  const conceptsPerDocumentRef = useRef({});
  const mentionIdsInDocumentRef = useRef({});
  const [cancerData, setCancerData] = useState(undefined);

  useEffect(() => {
    fetchPatientDatabase().then((db) => {
      setDb(db);
    });
  }, []);

  useEffect(() => {
    console.log("useEffect db");
    if (db !== undefined) {
      fetchPatientCancers(db, patientId).then((cancerDataObj) => {
        if (cancerDataObj !== undefined) {
          setCancerData(cancerDataObj);
        }
      });
    }
  }, [db]);

  useEffect(() => {
    if (hasDocuments(patientObject)) {
      conceptsPerDocumentRef.current = getConceptsPerDocumentRef(patientObject);
      setProcessingDone(true);
    }
  }, [patientObject]);

  useEffect(() => {
    if (hasDocuments(patientObject)) {
      setPatientDocument(getPatientDocument(currDocId, patientObject));
    }
  }, [currDocId, patientObject]);

  useEffect(() => {
    if (!isLoading()) {
      mentionIdsInDocumentRef.current = patientDocument.getMentionIdsInDocument();
    }
  }, [patientDocument]);

  const isLoading = () => {
    return (
      patientDocument === undefined ||
      patientObject === undefined ||
      cancerData === undefined ||
      !processingDone
    );
  };

  // function getSummary(patientId) {
  //   return fetch("http://localhost:3001/api/patient/" + patientId + "/cancerAndTumorSummary");
  // }

  function getSummary(patientId) {
    return fetch("/patientSummaryExample.json");
  }

  const getPatientObject = (patientId) => {
    return fetch("/patientObjectExample.json");
  };

  const getComponentPatientEpisodeTimeline = () => {
    return (
      <Card>
        <CardHeader className={"basicCardHeader"}>
          <Box
            // display="flex"
            alignItems="center"
            // justifyContent="space-between"
            // width="100%"
          >
            <span style={{ paddingLeft: "14px" }}>
              <b>Patient Episode Timeline</b>
            </span>
            <IconButton onClick={() => setExpandedPatientEpisode((prev) => !prev)} size="small">
              {expandedPatientEpisode ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </CardHeader>

        {expandedPatientEpisode && (
          <CardBody>
            {patientObject && Object.keys(patientObject).length > 0 ? (
              <PatientEpisodeTimeline
                svgContainerId="PatientEpisodeTimelineSvg"
                reportId={reportId}
                patientJson={patientObject}
                patientId={patientId}
                setReportId={setReportId}
                setCurrDocId={setCurrDocId}
                //getReport={getReport}
              ></PatientEpisodeTimeline>
            ) : (
              <div>Loading timeline...</div>
            )}
          </CardBody>
        )}
      </Card>
    );
  };

  const getComponentEventRelationTimeline = () => {
    if (isLoading()) {
      return <div>Loading Event Relation Table...</div>;
    }
    const conceptsInDocument = patientDocument.getConceptsInDocument(patientObject.concepts);

    return (
      <Card>
        <CardHeader className={"basicCardHeader"}>
          <Box>
            <span style={{ paddingLeft: "14px" }}>
              <b>Event Timeline</b>
            </span>
            <IconButton onClick={() => setExpandedEventRelation((prev) => !prev)} size="small">
              {expandedEventRelation ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </CardHeader>

        {expandedEventRelation && (
          <CardBody>
            <EventRelationTimeline
              setClickedTerms={setClickedTerms}
              clickedTerms={clickedTerms}
              svgContainerId="EventRelationTimelineSvg"
              reportId={reportId}
              patientJson={patientObject}
              concepts={conceptsInDocument}
              patientId={patientId}
              setReportId={setReportId}
              conceptsPerDocument={conceptsPerDocumentRef.current}
            />
          </CardBody>
        )}
      </Card>
    );
  };

  const getComponentPatientIdAndDemographics = () => {
    return <PatientDemographics patientId={patientId} />;
  };
  const getComponentFooter = () => {
    return (
      <React.Fragment>
        <div className={"mainFooter"}>
          <Row>
            <Col md={1}></Col>
            <Col md={4}>
              Supported by the{" "}
              <a target="_blank" rel="noopener noreferrer" href="https://itcr.cancer.gov/">
                National Cancer Institute&apos;s Information Technology for Cancer Research
              </a>{" "}
              initiative. (Grant #U24CA248010)
            </Col>
            <Col md={1}></Col>
            <Col md={5}>
              ©2021 Harvard Medical School, University of Pittsburgh, and Vanderbilt University
              Medical Center.
            </Col>
            <Col md={1}></Col>
          </Row>
        </div>
      </React.Fragment>
    );
  };

  const getComponentDocumentViewer = () => {
    if (isLoading()) {
      return <div>Loading Document Viewer...</div>;
    }
    const conceptsInDocument = patientDocument.getConceptsInDocument(patientObject.concepts);
    // console.log("CONCEPTS IN DOCUMENT", conceptsInDocument);
    // console.log("THSI IS PATIENT DOC", patientDocument);
    if (isEmpty(reportId) || patientDocument.getMentionIdsInDocument() === 0) {
      return <div>Report ID is empty or no mentions...</div>;
    }

    return (
      <DocumentViewer
        patientId={patientId}
        reportId={reportId}
        factId={factId}
        factBasedReports={factBasedReports}
        patientDocument={patientDocument}
        concepts={conceptsInDocument}
        clickedTerms={clickedTerms}
        setClickedTerms={setClickedTerms}
      ></DocumentViewer>
    );
  };

  const getComponentCancerAndTumorDetail = () => {
    if (isLoading() || cancerData === undefined) {
      return <div>Loading Cancer and Tumor Detail...</div>;
    } else {
      // const sampleData = [
      //   {
      //     cancerId: "Invasive_Lobular_Breast_Carcinoma_1751931826030",
      //     details: {
      //       Location: "Breast",
      //       Laterality: "Right",
      //       Quadrant: "Upper_inner_Quadrant",
      //       "Histologic Type": "Ductal_Breast_Carcinoma_In_Situ",
      //       Behavior: "3",
      //       Stage: "IIA",
      //       Grade: "9",
      //       Extent: "Invasive_Lesion",
      //       "Tumor Type": "PrimaryTumor",
      //       ER: "positive",
      //       PR: "positive",
      //       HER2: "negative",
      //     },
      //     clinicalTNM: { T: "T1", N: "N2", M: "M0" },
      //     tumorSummaries: [
      //       {
      //         title: "Ductal_Breast_Carcinoma_In_Situ",
      //         fields: {
      //           Location: "Breast",
      //           Laterality: "Right",
      //           Quadrant: "Upper_inner_Quadrant",
      //           "Histologic Type": "Ductal_Breast_Carcinoma_In_Situ",
      //           Behavior: "3",
      //           Stage: "IIA",
      //           Grade: "9",
      //           Extent: "Invasive_Lesion",
      //           T: "T1",
      //           N: "N2",
      //           M: "M0",
      //           "Tumor Type": "PrimaryTumor",
      //           ER: "positive",
      //           PR: "positive",
      //           HER2: "negative",
      //         },
      //       }, // ...more summaries if needed
      //     ],
      //   }, // ...more cancer records
      // ];
      const sampleData = cancerData;
      return (
        <React.Fragment>
          <Card>
            <CardHeader className={"basicCardHeader"}>
              <Box
                // display="flex"
                alignItems="center"
                // justifyContent="space-between"
                // width="100%"
              >
                <span style={{ paddingLeft: "14px" }}>
                  <b>Cancer and Tumor Detail</b>
                </span>
                <IconButton onClick={() => setExpandedCancerDetail((prev) => !prev)} size="small">
                  {expandedCancerDetail ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </CardHeader>

            {expandedCancerDetail && (
              <CardBody>
                <div id="summary">{<CancerDataTables cancers={sampleData} />}</div>
              </CardBody>
            )}
          </Card>
        </React.Fragment>
      );
    }
  };

  const getComponentNavBar = () => {
    return (
      <Navbar className={"mainNavBar"}>
        <Container>
          <Navbar.Brand className={"mainNavBar"} href="/">
            DeepPhe Visualizer
            <span style={{ fontSize: "20px" }}> v2.0.0.0</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="justify-content-end" style={{ width: "100%" }}>
              <Nav.Link
                className={"navItem"}
                target="_blank"
                rel="noopener noreferrer"
                href="https://deepphe.github.io/"
              >
                About
              </Nav.Link>
              <Nav.Link
                className={"navItem"}
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/DeepPhe/"
              >
                GitHub
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  };

  useEffect(() => {
    if (patientId) {
      setEventHandlers(patientId);
    }
  }, [patientId]);

  useEffect(() => {
    if (summary.length && patientId) {
      getPatientObject(patientId).then((patientObject) => {
        patientObject.json().then((patientObject) => {
          if (!patientObject || Object.keys(patientObject).length === 0) {
            console.warn("Empty or invalid patientJson received!");
          }
          setPatientObject(patientObject);
        });
      });
    }
  }, [summary, patientId]);

  /***
   Patient Summary needs to look like:

   ***/
  if (isEmpty(summary)) {
    if (!gettingSummary) {
      setGettingSummary(true);
      getSummary(patientId).then((response) => {
        response.json().then((json) => {
          setSummary(json);
          setGettingSummary(false); // optional, useful if you want to reset
        });
      });
    }
    return <div> Loading... </div>;
  }

  if (isLoading()) {
    return <div>Loading Patient Data...</div>;
  } else {
    console.log("Patient Object", patientObject);
    console.log("Patient Document", patientDocument);
    console.log("Cancer Data", cancerData);
    console.log("Concepts Per Document Ref", conceptsPerDocumentRef.current);
  }

  return (
    <React.Fragment>
      {getComponentNavBar()}
      <GridContainer>
        <GridItem xs={12} sm={12} md={1} />
        <GridItem xs={12} sm={12} md={10}>
          {getComponentPatientIdAndDemographics()}
          {getComponentCancerAndTumorDetail()}
          {getComponentPatientEpisodeTimeline()}
          {getComponentEventRelationTimeline()}
          {getComponentDocumentViewer()}
        </GridItem>
        <GridItem xs={12} sm={12} md={1} />
      </GridContainer>
      {/*{getComponentFooter()}*/}
    </React.Fragment>
  );
}

export default Patient;
