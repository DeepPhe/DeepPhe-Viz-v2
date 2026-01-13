import * as d3 from "d3";
import $ from "jquery";

const baseUri = "http://localhost:3001/api";

function highlightReportBasedOnFact(reportId) {
  d3.select("#main_" + reportId).classed("fact_highlighted_report", true);
}

export let factBasedReports = {};

export function getFact(patientId, factId) {
  $.ajax({
    url: baseUri + "/fact/" + patientId + "/" + factId,
    method: "GET",
    async: true,
    dataType: "json",
  })
    .done(function (response) {
      let docIds = Object.keys(response.groupedTextProvenances);
      // Render the html fact info
      let factHtml = '<ul class="fact_detail_list">';

      if (response.hasOwnProperty("prettyName")) {
        factHtml +=
          '<li><span class="fact_detail_label">Selected Fact:</span> ' +
          response.sourceFact.prettyName +
          "</li>";
      }

      if (docIds.length > 0) {
        factHtml +=
          '<li class="clearfix"><span class="fact_detail_label">Related Text Provenances in Source Reports:</span><ul>';

        docIds.forEach(function (id) {
          let group = response.groupedTextProvenances[id];
          // Use a combination of reportId and factId to identify this element
          factHtml +=
            '<li class="grouped_text_provenance"><span class="fact_detail_report_id"><i class="fa fa-file-o"></i> <span id="' +
            id +
            "_" +
            factId +
            '" data-report="' +
            id +
            '" data-fact="' +
            factId +
            '" class="fact_based_report_id">' +
            id +
            '</span> --></span><ul id="terms_list_' +
            id +
            "_" +
            factId +
            '">';

          let innerHtml = "";
          group.textCounts.forEach(function (textCount) {
            innerHtml +=
              '<li><span class="fact_based_term_span">' +
              textCount.text +
              '</span> <span class="count">(' +
              textCount.count +
              ")</span></li>";
          });

          factHtml += innerHtml + "</ul></li>";
        });
      } else {
        factHtml =
          '<span class="fact_detail_label">There are no direct mentions for this finding.</span>';
      }

      factHtml += "</ul>";

      // Fade in the fact detail. Need to hide the div in order to fade in.
      $("#fact_detail").html(factHtml);

      // Also highlight the report and corresponding text mentions if this fact has text provanences in the report
      // Highlight report circles in timeline
      if (docIds.length > 0) {
        // Remove the previouly fact-based highlighting
        $(".main_report").removeClass("fact_highlighted_report");

        docIds.forEach(function (id) {
          // Set fill-opacity to 1
          highlightReportBasedOnFact(id);

          // Add to the global factBasedReports object for highlighting
          // the fact-based terms among all extracted terms of a given report
          if (typeof factBasedReports[id] === "undefined") {
            factBasedReports[id] = {};
          }

          if (typeof factBasedReports[id][factId] === "undefined") {
            // Define an array for each factId
            factBasedReports[id][factId] = [];
          }

          // If not already added, add terms
          // Otherwise reuse what we have in the memory
          if (factBasedReports[id][factId].length === 0) {
            // Only store the unique text
            response.groupedTextProvenances[id].terms.forEach(function (obj) {
              if (factBasedReports[id][factId].indexOf(obj.term) === -1) {
                factBasedReports[id][factId].push(obj.term);
              }
            });
          }
        });

        // Also show the content of the first report
        // The docIds is sorted
        //JDL  getReport(docIds[0], factId);
        //
        // And highlight the current displaying report circle with a thicker stroke
        //highlightSelectedTimelineReport(docIds[0]);

        $("#report_instance").show();
      } else {
        // Dehighlight the previously selected report dot
        const css = "selected_report";
        $(".main_report").removeClass(css);
        $(".overview_report").removeClass(css);
        // Also remove the "fact_highlighted_report" class
        $(".main_report").removeClass("fact_highlighted_report");

        // And empty the report area
        $("#report_id").empty();
        $("#report_mentioned_terms").empty();
        $("#report_text").empty();
        $("#docs").show();
        $("#report_instance").show();
      }
    })
    .fail(function () {
      console.log("Ajax error - can't get fact");
    });
}
