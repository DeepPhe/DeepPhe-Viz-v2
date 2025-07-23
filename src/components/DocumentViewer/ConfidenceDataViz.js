import GridItem from "../Grid/GridItem";
import React, { useCallback, useRef } from "react";
import { BarChart } from "@mui/x-charts";
import { styled } from "@mui/material/styles";
import { FormLabel, Tooltip } from "@mui/material";
import GridContainer from "../Grid/GridContainer";
import _ from "lodash";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export function ConfidenceDataViz(props) {
  const handleConfidenceChange = props.handleConfidenceChange;
  const concepts = props.concepts;
  const doc = props.doc;
  const mentions = props.mentions;
  const confidencePercent = props.confidencePercent;
  const setConfidencePercent = props.setConfidencePercent;
  const sliderPosition = props.sliderPostion;
  const setSliderPosition = props.setSliderPostion;
  const onFilterChange = props.onFilterChange;
  const filterLabel = props.filterLabel;
  const setFilterLabel = props.setFilterLabel;

  const handleRadioChange = (event) => {
    const value = event.target.value;
    // Call the parent handler with the new filter value
    onFilterChange(value === "option1" ? "Concepts" : "Mentions");
    setFilterLabel(value === "option1" ? "Concepts" : "Mentions");
  };

  // const getMentionsGivenMentionIds = (mentionIds) => {
  //     return mentions.filter((m) => mentionIds.includes(m.id));
  // };
  // const getMentionsForConcept = (conceptId) => {
  //     if(conceptId === ""){
  //         return [];
  //     }
  //     if(conceptId !== undefined) {
  //         const idx = concepts.findIndex((c) => c.id === conceptId);
  //         if(idx === -1){
  //             return [];
  //         }
  //         return concepts[idx].mentionIds.filter((mentionId) => {
  //             return mentions.some((m) => m.id === mentionId);
  //         });
  //     }
  //     else{
  //         return [];
  //     }
  // };
  //
  // function getAllMentionIDs(){
  //     let conceptIDList = [];
  //     console.log(mentions);
  //     for(let i = 0; i < concepts.length; i++){
  //         const mentions = getMentionsGivenMentionIds(getMentionsForConcept(concepts[i].id));
  //         conceptIDList.push(mentions);
  //     }
  //     return conceptIDList;
  // }

  function getDpheGroupOfMention(mentionId) {
    for (const concept of concepts) {
      if (concept.mentionIds?.includes(mentionId)) {
        return concept.dpheGroup;
      }
    }
    return null; // or undefined, if not found
  }

  function getSemanticGroupConfidenceCount(name, filterLabel) {
    let confidenceList = [];

    if (filterLabel === "Concepts") {
      for (let i = 0; i < concepts.length; i++) {
        if (name === concepts[i].dpheGroup) {
          // console.log(concepts[i]);
          const conceptConfidence = concepts[i].confidence / 100;
          // console.log(conceptConfidence);
          confidenceList.push(conceptConfidence);
        }
      }
    } else if (filterLabel === "Mentions") {
      // console.log(getAllMentionIDs());
      // console.log(getDpheGroupOfMention());
      mentions.forEach(function (obj) {
        const dpheGroupByMention = getDpheGroupOfMention(obj.id);
        console.log("NAME:", name, "DPHE", dpheGroupByMention);

        if (name === dpheGroupByMention) {
          confidenceList.push(obj.confidence / 100);
        }
      });
    }
    return percentCounter(confidenceList);
  }

  function percentCounter(confidenceList) {
    console.log("CONFIDENCE LIST:", confidenceList);
    const buckets = Array(10).fill(0); //fill all buckets as 0 init
    confidenceList.forEach((item) => {
      if (item >= 0 && item <= 1) {
        const index = Math.min(Math.floor(item * 10), 9);
        buckets[index] += 1; // add an iterator to the index of the percentage it falls into i.e. '.29 = 2'
      }
    });
    return buckets;
  }

  function groupSemantics(lists) {
    if (lists.length === 0) return [];

    const length = lists[0].length;
    const initial = Array(length).fill(0);

    return lists.reduce((acc, list) => acc.map((num, idx) => num + (list[idx] || 0)), initial);
  }

  // Step 1: Define the concepts in an array
  const semanticGroups = [
    { name: "Behavior", group: "orange" },
    { name: "Disease Stage Qualifier", group: "orange" },
    { name: "Disease Grade Qualifier", group: "orange" },
    { name: "Temporal Qualifier", group: "orange" },
    { name: "Severity", group: "orange" },
    { name: "Pathologic TNM Finding", group: "orange" },
    { name: "Generic TNM Finding", group: "orange" },

    { name: "Disease Qualifier", group: "yellow" },
    { name: "Property or Attribute", group: "yellow" },
    { name: "General Qualifier", group: "yellow" },
    { name: "Clinical Course of Disease", group: "yellow" },
    { name: "Pathologic Process", group: "yellow" },

    { name: "Lymph Node", group: "blue" },
    { name: "Body Part", group: "blue" },
    { name: "Body Fluid or Substance", group: "blue" },
    { name: "Side", group: "blue" },
    { name: "Spatial Qualifier", group: "blue" },
    { name: "Tissue", group: "blue" },

    { name: "Finding", group: "pink" },
    { name: "Clinical Test Result", group: "pink" },
    { name: "Gene", group: "pink" },
    { name: "Gene Product", group: "pink" },

    { name: "Disease or Disorder", group: "green" },
    { name: "Neoplasm", group: "green" },
    { name: "Mass", group: "green" },
    { name: "Quantitative Concept", group: "green" },

    { name: "Pharmacologic Substance", group: "purple" },
    { name: "Chemo/immuno/hormone Therapy Regimen", group: "purple" },
    { name: "Intervention or Procedure", group: "purple" },
    { name: "Imaging Device", group: "purple" },

    { name: "Position", group: "brown" },
    { name: "Unknown", group: "grey" },
  ];

  // Step 2: Map the concepts to their confidence counts
  const confidenceCounts = semanticGroups.reduce((acc, semanticGroup) => {
    acc[semanticGroup.name] = getSemanticGroupConfidenceCount(semanticGroup.name, filterLabel);
    return acc;
  }, {});

  // Step 3: Group the concepts by color
  const groupedSemantics = {
    orangeGroup: groupSemantics([
      confidenceCounts["Behavior"],
      confidenceCounts["Disease Stage Qualifier"],
      confidenceCounts["Disease Grade Qualifier"],
      confidenceCounts["Temporal Qualifier"],
      confidenceCounts["Severity"],
      confidenceCounts["Pathologic TNM Finding"],
      confidenceCounts["Generic TNM Finding"],
    ]),
    yellowGroup: groupSemantics([
      confidenceCounts["Disease Qualifier"],
      confidenceCounts["Property or Attribute"],
      confidenceCounts["General Qualifier"],
      confidenceCounts["Clinical Course of Disease"],
      confidenceCounts["Pathologic Process"],
    ]),
    blueGroup: groupSemantics([
      confidenceCounts["Lymph Node"],
      confidenceCounts["Body Part"],
      confidenceCounts["Body Fluid or Substance"],
      confidenceCounts["Side"],
      confidenceCounts["Spatial Qualifier"],
      confidenceCounts["Tissue"],
    ]),
    pinkGroup: groupSemantics([
      confidenceCounts["Finding"],
      confidenceCounts["Clinical Test Result"],
      confidenceCounts["Gene"],
      confidenceCounts["Gene Product"],
    ]),
    greenGroup: groupSemantics([
      confidenceCounts["Disease or Disorder"],
      confidenceCounts["Neoplasm"],
      confidenceCounts["Mass"],
      confidenceCounts["Quantitative Concept"],
    ]),
    purpleGroup: groupSemantics([
      confidenceCounts["Pharmacologic Substance"],
      confidenceCounts["Chemo/immuno/hormone Therapy Regimen"],
      confidenceCounts["Intervention or Procedure"],
      confidenceCounts["Imaging Device"],
    ]),
    brownGroup: groupSemantics([confidenceCounts["Position"]]),
    greyGroup: groupSemantics([confidenceCounts["Unknown"]]),
  };

  // Step 4: Define the series
  const series = [
    { data: groupedSemantics.orangeGroup, stack: "total", color: "rgba(255, 135, 18, 0.65)" },
    { data: groupedSemantics.yellowGroup, stack: "total", color: "rgba(255, 191, 0, 0.65)" },
    { data: groupedSemantics.blueGroup, stack: "total", color: "rgba(173, 216, 230, 0.65)" },
    { data: groupedSemantics.pinkGroup, stack: "total", color: "rgba(255, 158, 164, 0.65)" },
    { data: groupedSemantics.greenGroup, stack: "total", color: "rgba(127, 206, 148, 0.65)" },
    { data: groupedSemantics.purpleGroup, stack: "total", color: "rgba(179, 108, 239, 0.65)" },
    { data: groupedSemantics.brownGroup, stack: "total", color: "rgba(255, 158, 164, 0.65)" },
    { data: groupedSemantics.greyGroup, stack: "total", color: "rgba(128, 128, 128, 0.65)" },
  ];

  const chartRef = useRef(null);

  const throttledHandleConfidenceChange = useCallback(
    _.throttle((confidencePercent) => {
      handleConfidenceChange(confidencePercent);
    }, 300), // 100ms throttle interval
    []
  );

  const handleSliderChange = (event) => {
    const yAxisBuffer = 35;
    const endOfGraphBuffer = 16;
    const chartRect = chartRef.current.getBoundingClientRect();
    let newValue = event.clientX - chartRect.left;
    if (newValue >= yAxisBuffer && newValue <= chartRect.width - endOfGraphBuffer) {
      const graphPercent = (chartRect.width - endOfGraphBuffer - yAxisBuffer) / 100;
      const confidencePercent = Math.ceil((newValue - yAxisBuffer) / graphPercent);
      setSliderPosition(newValue);
      setConfidencePercent(confidencePercent);
      throttledHandleConfidenceChange(confidencePercent);
    }
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleSliderChange);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleSliderChange);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const SliderLine = styled("div")(({ theme }) => ({
    position: "absolute",
    top: 83,
    bottom: 0,
    width: "4px", // Increased thickness
    backgroundColor: "#1565c0",
    cursor: "ew-resize",
    zIndex: 10, // Ensure it is above the chart
    height: "255px",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: `${-sliderPosition + 40}px`, // Move the grey background to the left relative to the slider position
      width: `${sliderPosition - 40}px`, // The width of the grey background changes dynamically
      backgroundColor: "rgba(128, 128, 128, 0.5)", // Transparent grey color
      zIndex: -1, // Ensure it appears behind the slider line
      display: "block",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "18px",
      height: "20px", // Thickness of the lines
      backgroundColor: "lightgrey",
      borderRadius: "2px", // Optional: Rounds the edges of the lines
      display: "block",
    },
  }));

  // Custom styled Tooltip with a lighter background
  const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(() => ({
    [`& .MuiTooltip-tooltip`]: {
      backgroundColor: "rgba(255, 255, 255, 0.9)", // Light background
      color: "#000", // Dark text color for contrast
      fontSize: "14px", // Adjust font size for readability
      border: "1px solid #ccc", // Optional: light border for definition
      padding: "10px", // Optional: padding
    },
  }));

  return (
    <GridContainer justifyContent="space-between" alignItems="center" spacing={2}>
      <GridItem xs="{true}">
        <RadioGroup
          row
          aria-label="options"
          name="radio-buttons-group"
          defaultValue={"option1"}
          onChange={handleRadioChange}
        >
          <FormControlLabel value="option2" control={<Radio />} label="By Mention" />
          <FormControlLabel value="option1" control={<Radio />} label="By Concept" />
        </RadioGroup>
      </GridItem>
      <GridItem xs="auto">
        <LightTooltip
          title={
            <div>
              <p>
                <strong>Mentions: </strong>Individual text spans within a document.
              </p>
              <p>
                <strong>Concepts: </strong>Collections of mentions across all documents. Concept
                confidence values are lower due to multiple factors such as mention-mention
                relations or conflicting values.
              </p>
            </div>
          }
        >
          <IconButton>
            <HelpOutlineIcon />
          </IconButton>
        </LightTooltip>
      </GridItem>
      <GridItem xs={12} alignItems="center">
        <BarChart
          ref={chartRef}
          height={300}
          // series={emptySeries}
          series={series}
          margin={{ top: 20, bottom: 26, left: 40, right: 15 }}
          yAxis={[
            {
              label: "Occurrences",
              labelFontSize: 17,
            },
          ]}
          animate
          disableAxisListener={true}
          xAxis={[
            {
              scaleType: "band",
              data: ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
              tickLabelPlacement: "tick",
              tickPlacement: "end",
            },
          ]}
          tooltip={{
            trigger: "none",
          }}
          axisHighlight={{
            x: "none",
            y: "none",
          }}
        />
        <SliderLine style={{ left: `${sliderPosition + 35}px` }} onMouseDown={handleMouseDown} />
      </GridItem>
      <GridItem xs={12}>
        <FormLabel
          sx={{
            fontWeight: "light",
            fontSize: "1em",
            marginBottom: "-5px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <b className="confidence_title">Confidence: </b>{" "}
          <span id="confidenceValue">{confidencePercent}</span> %
        </FormLabel>
      </GridItem>
    </GridContainer>
  );
}
