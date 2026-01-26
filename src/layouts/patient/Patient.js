import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CustomTable from "../../components/CustomTables/CustomTable";
import CancerAndTumorSummary from "../../components/Summaries/CancerAndTumorSummary";
import PatientDocumentTimeline from "../../components/Charts/PatientDocumentTimeline";
import EventRelationTimeline from "../../components/Charts/EventRelationTimeline/EventRelationTimeline";
import CardHeader from "../../components/Card/CardHeader";
import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { DocumentViewer } from "../../components/DocumentViewer/DocumentViewer";
import { isEmpty } from "../../utils/JsObjectHelper";
import { setEventHandlers } from "./patientEventHandlers";
import { factBasedReports } from "./FactUtils";
import IconButton from "@mui/material/IconButton";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Box from "@mui/material/Box";
import { getConceptsPerDocumentRef, hasDocuments } from "../../utils/PersonObjectHelper";
import { getNewPatientObject } from "../../utils/PersonObjectGetter";
import { getPatientDocument } from "../../utils/PatientDocumentGetter";
import createEpisodeTimeline from "../../utils/CreateEpisodeTimeline";
import createCancerAndTumorSummary from "../../utils/CreateCancerAndTumorSummary";
import "./Patient.css";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "@mui/material";
import Button from "@mui/material/Button";

function Patient(props) {
  const { patientId } = useParams();
  const [summary, setSummary] = useState({});
  const [patientDocument, setPatientDocument] = useState({});
  const [patientObject, setPatientObject] = useState(undefined);
  const [reportId, setReportId] = useState("");
  const [factId, setFactId] = useState({});
  const [gettingSummary, setGettingSummary] = useState(false);
  const [currDocId, setCurrDocId] = useState(0);
  const [clickedTerms, setClickedTerms] = useState([]); // Initial state set to empty array
  const [processingDone, setProcessingDone] = useState(false);
  const [expandedPatientDocument, setExpandedPatientDocument] = useState(true); // initially open
  const [expandedEventRelation, setExpandedEventRelation] = useState(true); // initially open
  const [expandedPatientID, setExpandedPatientID] = useState(true); // initially open
  const [expandedCancerDetail, setExpandedCancerDetail] = useState(true); // initially open
  const conceptsPerDocumentRef = useRef({});
  const mentionIdsInDocumentRef = useRef({});
  const [fullJson, setFullJson] = useState(undefined);

  useEffect(() => {
    if (hasDocuments(fullJson)) {
      conceptsPerDocumentRef.current = getConceptsPerDocumentRef(fullJson);
      setProcessingDone(true);
    }
  }, [fullJson]);

  useEffect(() => {
    if (hasDocuments(fullJson)) {
      setPatientDocument(getPatientDocument(currDocId, fullJson));
    }
    console.log(currDocId);
  }, [currDocId, fullJson]);

  useEffect(() => {
    if (!isLoading()) {
      mentionIdsInDocumentRef.current = patientDocument.getMentionIdsInDocument();
    }
  }, [patientDocument]);

  const isLoading = () => {
    return (
      patientDocument === undefined ||
      patientObject === undefined ||
      fullJson === undefined ||
      !processingDone
    );
  };

  const getComponentNavBar = () => {
    return (
      <Box sx={{ flexGrow: 1, mb: 4 }}>
        <AppBar position="static" elevation={4} sx={{ backgroundColor: "#264653" }}>
          <Toolbar>
            <Typography
              variant="h5"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 400,
                letterSpacing: 0.5,
                py: 1.5,
                color: "white !important",
              }}
            >
              DeepPhe Visualizer v2.1.
            </Typography>

            {/*<Nav className="justify-content-end" style={{ width: "100%" }}>*/}
            <Button
              // className={"navItem"}
              variant={"outlined"}
              color={"white"}
              target="_blank"
              rel="noopener noreferrer"
              href="https://deepphe.github.io/"
              sx={{ marginLeft: "10px" }}
            >
              About
            </Button>
            <Button
              // className={"navItem"}
              variant={"outlined"}
              color={"white"}
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/DeepPhe/"
            >
              GitHub
            </Button>
            {/*</Nav>*/}
          </Toolbar>
        </AppBar>
      </Box>
    );
  };

  const getComponentPatientIdAndDemographics = () => {
    return (
      <Card>
        <CardHeader className={"basicCardHeader"}>
          <Box alignItems="center">
            <span style={{ paddingLeft: "14px" }}>
              <b>Patient ID and Demographics</b>
            </span>
            <IconButton onClick={() => setExpandedPatientID((prev) => !prev)} size="small">
              {expandedPatientID ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </CardHeader>

        {expandedPatientID && (
          <CardBody>
            <CustomTable patientId={patientId} />
          </CardBody>
        )}
      </Card>
    );
  };

  const getComponentCancerAndTumorDetail = () => {
    return (
      <React.Fragment>
        <Card>
          <CardHeader className={"basicCardHeader"}>
            <Box alignItems="center">
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
              <div id="summary">
                <CancerAndTumorSummary cancers={summary} />
              </div>
            </CardBody>
          )}
        </Card>
      </React.Fragment>
    );
  };

  const getComponentEventRelationTimeline = () => {
    if (isLoading()) {
      return <div>Loading Event Relation Table...</div>;
    }
    const conceptsInDocument = patientDocument.getConceptsInDocument(fullJson.concepts);

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
              patientJson={fullJson}
              concepts={conceptsInDocument}
              patientId={patientId}
              setReportId={setReportId}
              conceptsPerDocument={conceptsPerDocumentRef.current}
              expandedPatientID={expandedPatientID}
              currDocId={currDocId}
            />
          </CardBody>
        )}
      </Card>
    );
  };

  const getComponentPatientDocumentTimeline = () => {
    return (
      <Card>
        <CardHeader className={"basicCardHeader"}>
          <Box alignItems="center">
            <span style={{ paddingLeft: "14px" }}>
              <b>Patient Document Timeline</b>
            </span>
            <IconButton onClick={() => setExpandedPatientDocument((prev) => !prev)} size="small">
              {expandedPatientDocument ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </CardHeader>

        {expandedPatientDocument && (
          <CardBody>
            {patientObject && Object.keys(patientObject).length > 0 ? (
              <PatientDocumentTimeline
                svgContainerId="PatientDocumentTimelineSvg"
                reportId={reportId}
                patientJson={fullJson}
                timeline={patientObject}
                patientId={patientId}
                setReportId={setReportId}
                setCurrDocId={setCurrDocId}
                //getReport={getReport}
              ></PatientDocumentTimeline>
            ) : (
              <div>Loading timeline...</div>
            )}
          </CardBody>
        )}
      </Card>
    );
  };

  const getComponentDocumentViewer = () => {
    if (isLoading()) {
      return <div>Loading Document Viewer...</div>;
    }
    const conceptsInDocument = patientDocument.getConceptsInDocument(fullJson.concepts);
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
        mentions={mentionIdsInDocumentRef.current}
        clickedTerms={clickedTerms}
        setClickedTerms={setClickedTerms}
      ></DocumentViewer>
    );
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
              ©2025 Harvard Medical School, University of Pittsburgh, and Vanderbilt University
              Medical Center.
            </Col>
            <Col md={1}></Col>
          </Row>
        </div>
      </React.Fragment>
    );
  };

  useEffect(() => {
    if (patientId) {
      setEventHandlers(patientId);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      createEpisodeTimeline(patientId).then((obj) => {
        const patientObject = obj.timeline;
        const fullJson = obj.fullJson;
        if (!patientObject || Object.keys(patientObject).length === 0) {
          console.warn("Empty or invalid patientJson received!");
        }
        setPatientObject(patientObject);
        setFullJson(fullJson);
      });
    }
  }, [patientId]);

  if (isEmpty(summary)) {
    if (!gettingSummary) {
      setGettingSummary(true);
      createCancerAndTumorSummary(patientId).then((json) => {
        setSummary(json);
        setGettingSummary(false);
      });
    }
    return <div> Loading... </div>;
  }

  if (isLoading()) {
    return <div>Loading Patient Data...</div>;
  }

  return (
    <React.Fragment>
      {getComponentNavBar()}
      <GridContainer spacing={0}>
        <GridItem xs={12} sm={12} md={1} />
        <GridItem xs={12} sm={12} md={10}>
          {getComponentPatientIdAndDemographics()}
          {getComponentCancerAndTumorDetail()}
          {getComponentEventRelationTimeline()}
          {getComponentPatientDocumentTimeline()}
          {getComponentDocumentViewer()}
        </GridItem>
        <GridItem xs={12} sm={12} md={1} />
      </GridContainer>
      {getComponentFooter()}
    </React.Fragment>
  );
}

export default Patient;
