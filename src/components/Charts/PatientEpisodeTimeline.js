import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import * as $ from "jquery";
import "./PatientEpisodeTimeline.css";

const baseUri = "http://localhost:3001/api";
const transitionDuration = 800; // time in ms
let initialHighlightedDoc = "";
let mentionedTerms = "";
let dpheTerms = "";
let reportTextRight = "";
export { mentionedTerms };
export { reportTextRight };

const PatientEpisodeTimeline = ({
  patientId,
  setReportId,
  patientJson,
  reportId,
  svgContainerId,
  setCurrDocId,
  timeline,
}) => {
  const [json, setJson] = useState(null);

  const getUrl = () => {
    return `http://localhost:3001/api/patient/${patientId}/timeline`;
  };

  const fetchData = async (url) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => {
          if (response) {
            resolve(response);
          } else {
            reject("User not logged in");
          }
        })
        .catch((err) => reject(err));
    });
  };

  const processTimelineResponse = (response) => {
    setJson(response);
    renderTimeline(
      svgContainerId,
      response.patientInfo,
      response.reportTypes,
      response.typeCounts,
      response.maxVerticalCountsPerType,
      response.episodes,
      response.episodeCounts,
      response.episodeDates,
      response.reportData,
      response.reportsGroupedByDateAndTypeObj
    );
  };
  const renderTimeline = (
    svgContainerId,
    patientInfo,
    reportTypes,
    typeCounts,
    maxVerticalCountsPerType,
    episodes,
    episodeCounts,
    episodeDates,
    reportData,
    reportsGroupedByDateAndTypeObj
  ) => {
    // console.log(reportTypes)

    //next line might not belong
    let factBasedReports = {};

    const variablesObj = {
      topography_major: {
        visible: false,
        value: "",
        bgcolor: "#cfe2ff",
        mentions: [],
      },
      topography_minor: {
        visible: false,
        value: "",
        bgcolor: "#cfe2ff",
        mentions: [],
      },
      topography: {
        visible: true,
        value: "",
        bgcolor: "#cfe2ff",
        mentions: [],
      },
      histology: {
        visible: false,
        value: "",
        bgcolor: "#f8d7da",
        mentions: [],
      },
      behavior: {
        visible: false,
        value: "",
        bgcolor: "#f8d7da",
        mentions: [],
      },
      morphology: {
        visible: true,
        value: "",
        bgcolor: "#f8d7da",
        mentions: [],
      },
      laterality: {
        visible: true,
        value: "",
        bgcolor: "#ffe69c",
        mentions: [],
      },
      grade: {
        visible: true,
        value: "",
        bgcolor: "#a3cfbb",
        mentions: [],
      },
    };

    // function buildColorDistribution(textMention) {
    //   let colorDistribution = [];
    //   let increment = (100 / textMention.count).toFixed(2);
    //
    //   for (let i = 0; i < textMention.count; i++) {
    //     let bgcolor = "highlight_terms";
    //     let start = i > 0 ? i * increment + "%" : 0;
    //     let finish =
    //         i < textMention.count - 1 ? (i + 1) * increment + "%" : "100%";
    //     colorDistribution.push(bgcolor + " " + start);
    //     colorDistribution.push(bgcolor + " " + finish);
    //   }
    //
    //   return colorDistribution;
    // }

    function highlightSelectedTimelineReport(reportId) {
      // Remove previous added highlighting classes
      const css = "selected_report";
      $(".main_report").removeClass(css);
      $(".overview_report").removeClass(css);

      // Remove previous added font awesome icon
      $(".selected_report_icon").remove();

      // Highlight the selected circle in both overview and main areas
      $("#main_" + reportId).addClass(css);
      $("#overview_" + reportId).addClass(css);
    }

    function removeFactBasedHighlighting(reportId) {
      $(".fact").removeClass("highlighted_fact");
      $(".main_report").removeClass("fact_highlighted_report");
      // Also remove the fact detail
      $("#fact_detail").hide().html("").fadeIn("slow");
    }

    function episode2CssClass(episode) {
      return episode.replace(/\s+/g, "-").toLowerCase();
    }

    // Vertical count position of each report type
    // E.g., "Progress Note" has max 6 vertical reports, "Surgical Pathology Report" has 3
    // then the vertical position of "Progress Note" bottom line is 6, and "Surgical Pathology Report" is 6+3=9
    let verticalPositions = {};
    // Vertical max counts from top to bottom
    // This is used to decide the domain range of mainY and overviewY
    let totalMaxVerticalCounts = 0;

    // Use the order in reportTypes to calculate totalMaxVerticalCounts of each report type
    // to have a consistent report type order
    //console.log("reportTypes: " + reportTypes);
    //console.log("reportData: " + JSON.stringify(reportData));
    // console.log(reportTypes)
    if (reportTypes !== null) {
      reportTypes.forEach(function (key) {
        totalMaxVerticalCounts += maxVerticalCountsPerType[key];
        if (typeof verticalPositions[key] === "undefined") {
          verticalPositions[key] = totalMaxVerticalCounts;
        }
      });
    }

    const margin = { top: 5, right: 20, bottom: 5, left: 200 };
    const mainReportTypeRowHeightPerCount = 16;
    const overviewReportTypeRowHeightPerCount = 3;

    const legendHeight = 22;
    const legendSpacing = 2;
    const widthPerLetter = 12;
    const episodeLegendAnchorPositionX = 60;
    const episodeLegendAnchorPositionY = 6;

    const gapBetweenlegendAndMain = 5;

    const container = document.getElementById(svgContainerId);
    const containerWidth = container.offsetWidth;

    const svgWidth = containerWidth - margin.left - 25;

    // Dynamic height based on vertical counts
    const height = totalMaxVerticalCounts * mainReportTypeRowHeightPerCount * 2;

    const pad = 25;

    // Dynamic height based on vertical counts
    const overviewHeight = totalMaxVerticalCounts * overviewReportTypeRowHeightPerCount;

    const ageAreaHeight = 16;
    const ageAreaBottomPad = 10;

    const reportMainRadius = 5;
    const reportOverviewRadius = 1.5;

    // Set the timeline start date 10 days before the min date
    // and end date 10 days after the max date
    const numOfDays = 50;

    // Gap between texts and mian area left border
    const textMargin = 10;

    // https://github.com/d3/d3-time-format#d3-time-format
    const formatTime = d3.timeFormat("%Y-%m-%d");
    const parseTime = d3.timeParse("%Y-%m-%d");

    // Convert string to date
    if (reportData !== null) {
      reportData.forEach(function (d) {
        // Parse YYYYMMDDHHmm format: "201001311015"
        let year = d.date.substring(0, 4);
        let month = d.date.substring(4, 6);
        let day = d.date.substring(6, 8);
        let hour = d.date.substring(8, 10);
        let minute = d.date.substring(10, 12);

        // Create proper Date object (month is 0-indexed)
        d.formattedDate = new Date(year, parseInt(month) - 1, day, hour, minute);
      });

      // The earliest report date
      let xMinDate = d3.min(reportData, function (d) {
        return d.formattedDate;
      });

      // Set the start date of the x axis 10 days before the xMinDate
      let startDate = new Date(xMinDate);
      startDate.setDate(startDate.getDate() - numOfDays);

      // The latest report date
      let xMaxDate = d3.max(reportData, function (d) {
        return d.formattedDate;
      });

      // Set the end date of the x axis 10 days after the xMaxDate
      let endDate = new Date(xMaxDate);
      endDate.setDate(endDate.getDate() + numOfDays);

      // Get the index position of target element in the reportTypes array
      // Need this to position the circles in mainY
      // let getIndex = function (element) {
      //     return reportTypes.indexOf(element);
      // };

      // This is all the possible episodes, each patient may only have some of these
      // we'll need to render the colors consistently across patients
      let allEpisodes = [
        "Pre-diagnostic",
        "Diagnostic",
        "Medical Decision-making",
        "Treatment",
        "Follow-up",
        "Unknown",
      ];

      // Color categories for types of episodes
      // https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
      let episodeColors = [
        "rgb(49, 130, 189)",
        "rgb(230, 85, 13)",
        "rgb(49, 163, 84)",
        "rgb(140, 86, 75)",
        "rgb(117, 107, 177)",
        "rgb(99, 99, 99)",
      ];
      // console.log(startDate, endDate)
      let color = d3.scaleOrdinal().domain(allEpisodes).range(episodeColors);

      // Transition used by focus/defocus episode
      let transt = d3.transition().duration(transitionDuration).ease(d3.easeLinear);

      // Main area and overview area share the same width
      let mainX = d3.scaleTime().domain([startDate, endDate]).range([0, svgWidth]);

      let overviewX = d3.scaleTime().domain([startDate, endDate]).range([0, svgWidth]);

      // Y scale to handle main area
      let mainY = d3.scaleLinear().domain([0, totalMaxVerticalCounts]).range([0, height]);

      // Y scale to handle overview area
      let overviewY = d3
        .scaleLinear()
        .domain([0, totalMaxVerticalCounts])
        .range([0, overviewHeight]);

      // Process episode dates
      let episodeSpansData = [];

      episodes.forEach(function (episode) {
        let obj = {};
        let datesArr = episodeDates[episode];
        let newDatesArr = [];
        // console.log(episodeDates);

        datesArr.forEach(function (d) {
          // console.log("Original date string:", d);

          // The date is already in YYYY/MM/DD format, which JavaScript can parse directly
          let date = new Date(d);
          // console.log("Parsed Date object:", date);

          // Now format and parse if needed
          let formattedTimeStr = formatTime(date);
          // console.log("Formatted time string:", formattedTimeStr);

          let finalDate = parseTime(formattedTimeStr);
          // console.log("Final parsed date:", finalDate);
          // console.log("---");

          newDatesArr.push(finalDate);
        });

        let minDate = d3.min(newDatesArr, function (d) {
          return d;
        });
        let maxDate = d3.max(newDatesArr, function (d) {
          return d;
        });

        // Assemble the obj properties
        obj.episode = episode;
        obj.startDate = minDate;
        obj.endDate = maxDate;

        episodeSpansData.push(obj);
      });

      let container = document.getElementById(svgContainerId);
      if (!container) {
        container = document.createElement("div");
        container.id = svgContainerId;
        document.body.appendChild(container);
      }

      // Remove any existing SVG before creating a new one
      d3.select(`#${svgContainerId}`).selectAll("svg").remove();

      // SVG
      const totalHeight =
        margin.top +
        legendHeight +
        gapBetweenlegendAndMain +
        height +
        pad +
        overviewHeight +
        pad +
        ageAreaHeight +
        margin.bottom;

      const svg = d3
        .select("#" + svgContainerId)
        .append("svg")
        .attr("class", "patient_episode_timeline_svg")
        .attr("viewBox", `0 0 ${containerWidth} ${totalHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet") // Keeps aspect ratio on resize
        .style("width", "100%")
        .style("height", "auto");

      // Dynamically calculate the x posiiton of each legend rect
      let episodeLegendX = function (index) {
        let x = 10;

        for (let i = 0; i < index; i++) {
          // Remove white spaces and hyphens, treat the string as one single word
          // this yeilds a better (still not perfect) calculation of the x
          let processedEpisodeStr = episodes[i].replace(/-|\s/g, "");
          x +=
            processedEpisodeStr.length * widthPerLetter +
            i * (reportMainRadius * 2 + legendSpacing);
        }

        return episodeLegendAnchorPositionX + legendSpacing + x;
      };

      svg
        .append("text")
        .attr("x", 10) // or whatever left margin you want
        .attr("y", margin.top + episodeLegendAnchorPositionY)
        .attr("dy", ".5ex")
        .attr("class", "episode_legend_text")
        .attr("text-anchor", "start")
        .text("Document Episode Type:");

      svg
        .append("line")
        .attr("x1", 10) // match the x of "Time Relation:"
        .attr("y1", margin.top + legendHeight)
        .attr("x2", margin.left + svgWidth)
        .attr("y2", margin.top + legendHeight)
        .attr("class", "legend_group_divider");

      let episodeLegendGrp = svg
        .append("g")
        .attr("class", "episode_legend_group")
        .attr("transform", "translate(110, " + margin.top + ")");

      let episodeLegend = episodeLegendGrp
        .selectAll(".episode_legend")
        .data(episodes)
        .enter()
        .append("g")
        .attr("class", "episode_legend");

      episodeLegend
        .append("circle")
        .attr("class", "episode_legend_circle")
        .attr("cx", function (d, i) {
          return episodeLegendX(i);
        })
        .attr("cy", 6)
        .attr("r", reportMainRadius)
        .style("fill", function (d) {
          return color(d);
        })
        .style("stroke", function (d) {
          return color(d);
        })
        .on("click", function (d) {
          // Toggle (hide/show reports of the clicked episode)
          let nodes = d3.selectAll("." + episode2CssClass(d));
          nodes.each(function () {
            let node = d3.select(this);
            node.classed("hide", !node.classed("hide"));
          });

          // Also toggle the episode legend look
          let legendCircle = d3.select(this);
          let cssClass = "selected_episode_legend_circle";
          legendCircle.classed(cssClass, !legendCircle.classed(cssClass));
        });

      // Legend label text
      episodeLegend
        .append("text")
        .attr("x", function (d, i) {
          return reportMainRadius * 2 + legendSpacing + episodeLegendX(i);
        })
        .attr("y", 10)
        .attr("class", "episode_legend_text")
        .text(function (d) {
          return d + " (" + episodeCounts[d] + ")";
        })
        .on("click", function (d, i) {
          // Toggle
          let legendText = d3.select(this);
          let cssClass = "selected_episode_legend_text";

          if (legendText.classed(cssClass)) {
            legendText.classed(cssClass, false);

            // Reset to show all
            defocusEpisode();
          } else {
            // Remove previously added class on other legend text
            $(".episode_legend_text").removeClass(cssClass);

            legendText.classed(cssClass, true);

            // episodeSpansData maintains the same order of episodes as the episodes array
            // so we can safely use i to get the corresponding startDate and endDate
            let episodeSpanObj = episodeSpansData[i];
            focusEpisode(episodeSpanObj);
          }
        });

      // Specify a specific region of an element to display, rather than showing the complete area
      // Any parts of the drawing that lie outside of the region bounded by the currently active clipping path are not drawn.
      svg
        .append("defs")
        .append("clipPath")
        .attr("id", "main_area_clip")
        .append("rect")
        .attr("width", svgWidth)
        .attr("height", height + gapBetweenlegendAndMain);

      let update = function () {
        // Update the episode bars
        // d3.selectAll(".episode_bar")
        //     .attr("x", function (d) {
        //       return mainX(d.startDate) - reportMainRadius;
        //     })
        //     .attr("width", function (d) {
        //       return (
        //           mainX(d.endDate) - mainX(d.startDate) + reportMainRadius * 2
        //       );
        //     });

        // Update main area
        d3.selectAll(".main_report_PE").attr("cx", function (d) {
          return mainX(d.formattedDate);
        });

        // Update the main x axis
        d3.select(".main-PE-x-axis").call(xAxis);
      };

      // Function expression to handle mouse wheel zoom or drag on main area
      // Need to define this before defining zoom since it's function expression instead of function declariation
      let zoomed = function (event) {
        // Ignore zoom-by-brush
        if (event.sourceEvent && event.sourceEvent.type === "brush") {
          return;
        }
        let transform = event.transform;

        mainX.domain(transform.rescaleX(overviewX).domain());

        // Update the report dots in main area
        update();

        // Update the overview as moving
        overview.select(".brush").call(brush.move, mainX.range().map(transform.invertX, transform));

        // Also need to update the position of custom brush handles
        // First we need to get the current brush selection
        // https://github.com/d3/d3-brush#brushSelection
        // The node desired in the argument for d3.brushSelection is the g element corresponding to your brush.
        let selection = d3.brushSelection(overviewBrush.node());

        // Then translate the x of each custom brush handle
        showAndMoveCustomBrushHandles(selection);
      };

      // Zoom rect that covers the main area
      let zoom = d3
        .zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([
          [0, 0],
          [svgWidth, height],
        ])
        .extent([
          [0, 0],
          [svgWidth, height],
        ])
        .on("zoom", zoomed);

      // Appending zoom rect after the main area will prevent clicking on the report circles/
      // So we need to create the zoom panel first
      svg
        .append("rect")
        .attr("class", "zoom_PE")
        .attr("width", svgWidth)
        .attr("height", height + gapBetweenlegendAndMain)
        .attr("transform", "translate(" + margin.left + "," + (margin.top + legendHeight) + ")")
        .call(zoom);

      // Main area
      // Create main area after zoom panel, so we can select the report circles
      let main = svg
        .append("g")
        .attr("class", "main")
        .attr(
          "transform",
          "translate(" +
            margin.left +
            "," +
            (margin.top + legendHeight + gapBetweenlegendAndMain) +
            ")"
        );

      // Encounter ages
      let age = svg
        .append("g")
        .attr("class", "age")
        .attr(
          "transform",
          "translate(" +
            margin.left +
            "," +
            (margin.top + legendHeight + gapBetweenlegendAndMain + height + pad) +
            ")"
        );

      // Mini overview
      let overview = svg
        .append("g")
        .attr("class", "overview")
        .attr(
          "transform",
          "translate(" +
            margin.left +
            "," +
            (margin.top +
              legendHeight +
              gapBetweenlegendAndMain +
              height +
              pad +
              ageAreaHeight +
              ageAreaBottomPad) +
            ")"
        );

      let getReportCirclePositionY = function (d, yScaleCallback, reportTypeRowHeightPerCount) {
        let arr = reportsGroupedByDateAndTypeObj[d.date][d.type];

        // console.log(arr, arr.length);
        // console.log(reportsGroupedByDateAndTypeObj);

        if (arr.length > 1) {
          let index = 0;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === d.id) {
              index = i;
              break;
            }
          }

          // The height of per chunk
          let h = (maxVerticalCountsPerType[d.type] * reportTypeRowHeightPerCount) / arr.length;
          return (
            yScaleCallback(verticalPositions[d.type]) - ((arr.length - (index + 1)) * h + h / 2)
          );
        } else {
          // Vertically center the dot if only one
          return (
            yScaleCallback(verticalPositions[d.type]) -
            (reportTypeRowHeightPerCount * maxVerticalCountsPerType[d.type]) / 2
          );
        }
      };

      // Episode interval spans
      let focusEpisode = function (episode) {
        // Here we we add extra days before the start and after the end date to have a little cushion
        let daysDiff = Math.floor((episode.endDate - episode.startDate) / (1000 * 60 * 60 * 24));
        let numOfDays = daysDiff > 30 ? 3 : 1;

        // setDate() will change the start and end dates, and we still need the original dates to update the episode bar
        // so we clone the date objects
        let newStartDate = new Date(episode.startDate.getTime());
        let newEndDate = new Date(episode.endDate.getTime());

        // The setDate() method sets the day of the month to the date object.
        newStartDate.setDate(newStartDate.getDate() - numOfDays);
        newEndDate.setDate(newEndDate.getDate() + numOfDays);

        // Span the episode coverage across the whole main area using this new domain
        mainX.domain([newStartDate, newEndDate]);

        let transt = d3.transition().duration(transitionDuration).ease(d3.easeLinear);

        // Move the brush with transition
        // The brush move will cause the report circles move accordingly
        // So no need to call update() with transition
        // https://github.com/d3/d3-selection#selection_call
        //Can also use brush.move(d3.select(".brush"), [overviewX(newStartDate), overviewX(newEndDate)]);
        overview
          .select(".brush")
          .transition(transt)
          .call(brush.move, [overviewX(newStartDate), overviewX(newEndDate)]);
      };

      let defocusEpisode = function () {
        // Reset the mainX domain
        mainX.domain([startDate, endDate]);

        // Move the brush with transition
        // https://github.com/d3/d3-selection#selection_call
        //Can also use brush.move(d3.select(".brush"), [overviewX(newStartDate), overviewX(newEndDate)]);
        overview
          .select(".brush")
          .transition(transt)
          .call(brush.move, [overviewX(startDate), overviewX(endDate)]);
      };

      const reportTypesToDraw = reportTypes.slice(0, -1); // Skip the last one
      // Main report type divider lines
      // Put this before rendering the report dots so the enlarged dot on hover will cover the divider line
      main
        .append("g")
        .selectAll(".report_type_divider")
        .data(reportTypesToDraw)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", svgWidth)
        .each(function (d) {
          const y = mainY(verticalPositions[d]);
          d3.select(this).attr("y1", y).attr("y2", y);
        })
        .attr("class", "report_type_divider");

      // Report types texts
      main
        .append("g")
        .selectAll(".report_type_label")
        .data(reportTypes)
        .enter()
        .append("text")
        .text(function (d) {
          return d + " (" + typeCounts[d] + "):";
        })
        .attr("x", -textMargin) // textMargin on the left of main area
        .attr("y", function (d, i) {
          // console.log(verticalPositions[d], maxVerticalCountsPerType[d])
          return mainY(verticalPositions[d] - maxVerticalCountsPerType[d] / 2);
        })
        .attr("dy", ".5ex")
        .attr("class", "report_type_label");

      // Report dots in main area
      // Reference the clipping path that shows the report dots
      // let mainReports = main
      //   .append("g")
      //   .attr("clip-path", "url(#main_area_clip)");
      // const that = this;

      setTimeout(() => {
        // Your code that renders the data points or calls a function
        let mainReports = main.append("g").attr("clip-path", "url(#main_area_clip)");
        const that = this;
        mainReports
          .selectAll(".main_report_PE")
          .data(reportData)
          .enter()
          .append("g")
          .append("circle")
          .attr("class", function (d) {
            return "main_report_PE " + episode2CssClass(d.episode);
          })
          .attr("id", function (d) {
            return "main_" + d.id;
          })
          .attr("data-episode", function (d) {
            return d.episode;
          })
          .attr("r", reportMainRadius)
          .attr("cx", function (d) {
            return mainX(d.formattedDate);
          })
          .attr("cy", function (d) {
            return getReportCirclePositionY(d, mainY, mainReportTypeRowHeightPerCount);
          })
          .style("fill", function (d) {
            return color(d.episode);
          })
          .style("stroke", function (d) {
            return color(d.episode);
          })
          .style("cursor", "pointer")
          .on("click", function (d) {
            const $circle = $("#main_" + d.id);
            const isSelected = $circle.hasClass("selected_report");
            console.log("data: ", d);

            // Always clear previous selections first
            $(".main_report_PE").removeClass("selected_report");
            $(".overview_report").removeClass("selected_report");
            $(".selected_report_icon").remove();

            if (isSelected) {
              removeFactBasedHighlighting(d.id);
              $("#docs").hide();
              $("#report_instance").hide();
              return;
            }

            $("#docs").show();

            if (Object.keys(factBasedReports).indexOf(d.id) === -1) {
              removeFactBasedHighlighting(d.id);
            }

            highlightSelectedTimelineReport(d.id);
            $("#report_instance").show();
            setReportId(d.id);

            // Set current document index if found
            const docIndex = patientJson?.documents?.findIndex((doc) => d.id === doc.id);
            if (docIndex !== -1) {
              setCurrDocId(docIndex);
            } else {
              console.warn("❗Could not find document for reportId:", d.id);
            }
          });
      }, 100); // Delay execution for 200ms

      // Main area x axis
      // https://github.com/d3/d3-axis#axisBottom
      let xAxis = d3.axisBottom(mainX).tickSizeInner(5).tickSizeOuter(0);

      // Append x axis to the bottom of main area
      main
        .append("g")
        .attr("class", "main-PE-x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // Encounter ages
      age
        .append("text")
        .attr("x", -textMargin)
        .attr("y", ageAreaHeight / 2) // Relative to the overview area
        .attr("dy", ".5ex")
        .attr("class", "age_label")
        .text("Patient Age");

      // Patient's first and last encounter dates and corresponding ages
      // We use the dates to render x position
      let encounterDates = [xMinDate, xMaxDate];
      // We use the calculated ages to render the text of age
      let encounterAges = [patientInfo.firstEncounterAge, patientInfo.lastEncounterAge];

      age
        .selectAll(".encounter_age")
        .data(encounterDates)
        .enter()
        .append("text")
        .attr("x", function (d) {
          return mainX(d);
        })
        .attr("y", ageAreaHeight / 2)
        .attr("dy", ".5ex")
        .attr("class", "encounter_age")
        .text(function (d, i) {
          return encounterAges[i];
        });

      // Vertical guidelines based on min and max dates (date objects)
      age
        .selectAll(".encounter_age_guideline")
        .data(encounterDates)
        .enter()
        .append("line")
        .attr("x1", function (d) {
          return mainX(d);
        })
        .attr("y1", 12)
        .attr("x2", function (d) {
          return mainX(d);
        })
        .attr("y2", 25)
        .attr("class", "encounter_age_guideline");

      // Overview label text
      overview
        .append("text")
        .attr("x", -textMargin)
        .attr("y", overviewHeight + 10) // Relative to the overview area
        .attr("dy", ".5ex")
        .attr("class", "overview_label")
        .text("Date");

      // Report dots in overview area
      // No need to use clipping path since the overview area contains all the report dots
      overview
        .append("g")
        .selectAll(".overview_report")
        .data(reportData)
        .enter()
        .append("g")
        .append("circle")
        .attr("id", function (d) {
          // Prefix with "overview_"
          return "overview_" + d.id;
        })
        .attr("class", "overview_report")
        .attr("r", reportOverviewRadius)
        .attr("cx", function (d) {
          return overviewX(d.formattedDate);
        })
        .attr("cy", function (d) {
          return getReportCirclePositionY(d, overviewY, overviewReportTypeRowHeightPerCount);
        })
        .style("fill", function (d) {
          return color(d.episode);
        });

      // Overview x axis
      let overviewXAxis = d3.axisBottom(overviewX).tickSizeInner(5).tickSizeOuter(0);
      // Abbreviated month format
      // .tickFormat(d3.timeFormat("%b"));

      // Append x axis to the bottom of overview area
      overview
        .append("g")
        .attr("class", "overview-x-axis")
        .attr("transform", "translate(0, " + overviewHeight + ")")
        .call(overviewXAxis);

      // Add brush to overview
      let overviewBrush = overview.append("g").attr("class", "brush");

      // Add custom brush handles
      let customBrushHandlesData = [{ type: "w" }, { type: "e" }];

      // Function expression to create custom brush handle path
      let createCustomBrushHandle = function (d) {
        let e = +(d.type === "e"),
          x = e ? 1 : -1,
          y = overviewHeight / 2;

        return (
          "M" +
          0.5 * x +
          "," +
          y +
          "A6,6 0 0 " +
          e +
          " " +
          6.5 * x +
          "," +
          (y + 6) +
          "V" +
          (2 * y - 6) +
          "A6,6 0 0 " +
          e +
          " " +
          0.5 * x +
          "," +
          2 * y +
          "ZM" +
          2.5 * x +
          "," +
          (y + 8) +
          "V" +
          (2 * y - 8) +
          "M" +
          4.5 * x +
          "," +
          (y + 8) +
          "V" +
          (2 * y - 8)
        );
      };

      // Add two custom brush handles
      let customBrushHandle = overviewBrush
        .selectAll(".handle--custom")
        .data(customBrushHandlesData)
        .enter()
        .append("path")
        .attr("class", "handle--custom")
        .attr("cursor", "ew-resize")
        .attr("d", createCustomBrushHandle)
        .attr("transform", function (d, i) {
          // Position the custom handles based on the default selection range
          let selection = [0, svgWidth];
          return "translate(" + [selection[i], -overviewHeight / 4] + ")";
        });

      // Function expression of updating custom handles positions
      let showAndMoveCustomBrushHandles = function (selection) {
        customBrushHandle
          // First remove the "display: none" added by brushStart to show the handles
          .style("display", null)
          // Then move the handles to desired positions
          .attr("transform", function (d, i) {
            return "translate(" + [selection[i], -overviewHeight / 4] + ")";
          });
      };

      // Function expression to create brush function redraw with selection
      // Need to define this before defining brush since it's function expression instead of function declariation
      let brushed = function (event) {
        // Ignore brush-by-zoom
        if (event.sourceEvent && event.sourceEvent.type === "zoom") {
          return;
        }

        let selection = d3.brushSelection(overviewBrush.node());

        // Update the position of custom brush handles
        showAndMoveCustomBrushHandles(selection);

        // Set the domain of the main area based on brush selection
        mainX.domain(selection.map(overviewX.invert, overviewX));

        update();

        // Zoom the main area
        svg
          .select(".zoom_PE")
          .call(
            zoom.transform,
            d3.zoomIdentity
              .scale(svgWidth / (selection[1] - selection[0]))
              .translate(-selection[0], 0)
          );
      };

      // D3 brush
      let brush = d3
        .brushX()
        .extent([
          [0, 0],
          [svgWidth, overviewHeight],
        ])
        // Update the UI on brush move
        .on("brush", brushed);

      // Applying brush on the overviewBrush element
      // Don't merge this with the overviewBrush definition because
      // brush calls brushed which uses customBrushHandle when it gets called and
      // we can't define overviewBrush before brush if combined.
      overviewBrush
        // For the first time of loading this page, no brush movement
        .call(brush)
        // We use overviewX.range() as the default selection
        // https://github.com/d3/d3-selection#selection_call
        // call brush.move and pass overviewX.range() as argument
        // https://github.com/d3/d3-brush#brush_move
        .call(brush.move, overviewX.range());

      // Reset button
      svg
        .append("foreignObject")
        .attr("id", "reset")
        .attr(
          "transform",
          "translate(10, " +
            (margin.top + pad + height + pad + ageAreaHeight + ageAreaBottomPad + overviewHeight) +
            ")"
        )
        .append("xhtml:body")
        .html("<button>Reset</button>");
    }
  };

  useEffect(() => {
    const url = getUrl();

    const fetchAndProcess = async () => {
      try {
        // const response = await fetchData(url);
        // const jsonResponse = await response.json();
        processTimelineResponse(timeline);
      } catch (error) {
        console.error("PatientEpisodeTimeline fetch error:", error);
      }
    };

    fetchAndProcess();
  }, [patientId]);

  return <div className="Timeline" id={svgContainerId}></div>;
};

export default PatientEpisodeTimeline;
