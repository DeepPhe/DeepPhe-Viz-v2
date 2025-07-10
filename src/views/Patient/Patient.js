import React, {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CustomTable from "../../components/CustomTables/CustomTable";
import CancerAndTumorSummary from "../../components/Summaries/CancerAndTumorSummary";
import PatientEpisodeTimeline from "../../components/Charts/PatientEpisodeTimeline";
import EventRelationTimeline from "../../components/Charts/EventRelationTimeline"
import CardHeader from "../../components/Card/CardHeader";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";
import {DocumentViewer} from "../../components/DocumentViewer/DocumentViewer";
import {isEmpty} from "../../utils/JsObjectHelper";
import {setEventHandlers} from "./patientEventHandlers";
import {factBasedReports} from "./FactUtils";
import IconButton from "@material-ui/core/IconButton";
import {ExpandLess, ExpandMore} from "@material-ui/icons";
import Box from "@mui/material/Box";
import {getConceptsPerDocumentRef, hasDocuments} from "../../utils/PersonObjectHelper";
import {getNewPatientObject} from "../../utils/PersonObjectGetter";
import {getPatientDocument} from "../../utils/PatientDocumentGetter";

function Patient(props) {
    const {patientId} = useParams();
    const [summary, setSummary] = useState({});
    const [patientDocument, setPatientDocument] = useState({});
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
        return patientDocument === undefined || patientObject === undefined || !processingDone;
    }


    function getSummary(patientId) {
        return fetch(
            "http://localhost:3001/api/patient/" +
            patientId +
            "/cancerAndTumorSummary"
        );
    }

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
                        <span style={{paddingLeft: '14px'}}><b>Patient Episode Timeline</b></span>
                        <IconButton onClick={() => setExpandedPatientEpisode((prev) => !prev)} size="small">
                            {expandedPatientEpisode ? <ExpandLess/> : <ExpandMore/>}
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
                        <span style={{paddingLeft: '14px'}}><b>Event Timeline</b></span>
                        <IconButton onClick={() => setExpandedEventRelation((prev) => !prev)} size="small">
                            {expandedEventRelation ? <ExpandLess/> : <ExpandMore/>}
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
        return (
            <Card style={{marginTop: "45px"}}>
                <CardHeader className={"basicCardHeader"}>
                    <Box
                        // display="flex"
                        alignItems="center"
                        // justifyContent="space-between"
                        // width="100%"
                    >
                        <span style={{paddingLeft: '14px'}}><b>Patient ID and Demographics</b></span>
                        <IconButton onClick={() => setExpandedPatientID((prev) => !prev)} size="small">
                            {expandedPatientID ? <ExpandLess/> : <ExpandMore/>}
                        </IconButton>
                    </Box>
                </CardHeader>

                {expandedPatientID && (
                    <CardBody>
                        <CustomTable/>
                    </CardBody>
                )}
            </Card>
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
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://itcr.cancer.gov/"
                            >
                                National Cancer Institute's Information Technology for Cancer
                                Research
                            </a>{" "}
                            initiative. (Grant #U24CA248010)
                        </Col>
                        <Col md={1}></Col>
                        <Col md={5}>
                            ©2021 Harvard Medical School, University of Pittsburgh, and
                            Vanderbilt University Medical Center.
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
                            <span style={{paddingLeft: '14px'}}><b>Cancer and Tumor Detail</b></span>
                            <IconButton onClick={() => setExpandedCancerDetail((prev) => !prev)} size="small">
                                {expandedCancerDetail ? <ExpandLess/> : <ExpandMore/>}
                            </IconButton>
                        </Box>
                    </CardHeader>

                    {expandedCancerDetail && (
                        <CardBody>
                            <div id="summary">
                                <CancerAndTumorSummary cancers={summary}/>
                            </div>
                        </CardBody>
                    )}
                </Card>
            </React.Fragment>
        );
    };

    const getComponentNavBar = () => {
        return (
            <Navbar className={"mainNavBar"}>
                <Container>
                    <Navbar.Brand className={"mainNavBar"} href="/">
                        DeepPhe Visualizer
                        <span style={{fontSize: "20px"}}> v2.0.0.0</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="justify-content-end" style={{width: "100%"}}>
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
            getNewPatientObject(patientId).then((patientObject) => {
                if (!patientObject || Object.keys(patientObject).length === 0) {
                    console.warn("Empty or invalid patientJson received!");
                }
                setPatientObject(patientObject);
            });
        }
    }, [summary, patientId]);


    if (isEmpty(summary)) {
        if (!gettingSummary) {
            setGettingSummary(true);
            getSummary(patientId).then((response) =>
                response.json().then((json) => {
                    setSummary(json);
                    setGettingSummary(false); // optional, useful if you want to reset
                })
            );
        }
        return <div> Loading... </div>;
    }

    return (
        <React.Fragment>
            {getComponentNavBar()}
            <GridContainer>
                <GridItem xs={12} sm={12} md={1}/>
                <GridItem xs={12} sm={12} md={10}>
                    {getComponentPatientIdAndDemographics()}
                    {getComponentCancerAndTumorDetail()}
                    {getComponentPatientEpisodeTimeline()}
                    {getComponentEventRelationTimeline()}
                    {getComponentDocumentViewer()}
                </GridItem>
                <GridItem xs={12} sm={12} md={1}/>
            </GridContainer>
            {getComponentFooter()}
        </React.Fragment>
    );
}

export default Patient;
