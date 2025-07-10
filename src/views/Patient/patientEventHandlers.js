import $ from "jquery";
import { getFact } from "./FactUtils";

export function setEventHandlers(patientId)  {

  $(document).on("click", ".list_view .fact", function () {
    //JDL when someone clicks on a cancer fact, it goes here....probably need to make a map from old/new property names now to explain my thinking
    const cssClass = "highlighted_fact";
    // Remove the previous highlighting
    $(".fact").removeClass(cssClass);
    // "list_view_{{id}}"
    let id = $(this).attr("id");
    let factId = id.replace("list_view_", "");
    getFact(patientId, factId);
    // Highlight the clicked fact
    $(this).addClass(cssClass);
    // Also highlight the same fact in table view
    $("#table_view_" + factId).addClass(cssClass);
  });

  $(document).on("click", ".fact", function (event) {
    function hasParentClass(child, classname) {
      if (child.className.split(" ").indexOf(classname) >= 0) return true;
      try {
        //Throws TypeError if child doesn't have parent any more
        return child.parentNode && hasParentClass(child.parentNode, classname);
      } catch (TypeError) {
        return false;
      }
    }

    const cssClass = "highlighted_fact";
    $(".fact").removeClass(cssClass);
    let factId = event.target.id;
    let fact_id_prefix = "";
    if (hasParentClass(event.target, "cancer_and_tnm")) {
    }

    if (hasParentClass(event.target, "table_view")) {
      factId = factId.replace("table_view_", "");
      fact_id_prefix = "#table_view_";
    }

    if (hasParentClass(event.target, "list_view")) {
      factId = factId.replace("list_view_", "");
      fact_id_prefix = "#list_view_";
    }
    getFact(patientId, factId);
    // Highlight the clicked fact
    $(fact_id_prefix + factId).addClass(cssClass);
    $(this).addClass(cssClass);
    event.stopPropagation();
  });

  // Tumor summary
  $(document).on("click", ".list_view_option", function () {
    let cancerId = $(this).attr("id").replace("list_view_option_", "");

    $("#table_view_" + cancerId).hide();
    $("#list_view_" + cancerId).show();
  });

  $(document).on("click", ".table_view_option", function () {
    let cancerId = $(this).attr("id").replace("table_view_option_", "");
    $("#list_view_" + cancerId).hide();
    $("#table_view_" + cancerId).show();
  });

  // Toggle for each tumor type under list view
  $(document).on("click", ".list_view_tumor_type", function () {
    //$(this).next().find(".toggleable").toggle("fast");
    //$(this).find(".fa-caret-right, .fa-caret-down").toggle();
    //$(this).find(".fa-caret-right").toggle();
  });

  // Reset button event
  $(document).on("click", "#reset", function () {
    // Remove highlighted fact
    $(".fact").removeClass("highlighted_fact");
    // Reload timeline
    $("#timeline").html("");
    // getTimeline(patientId, "timeline");
    // Reset the fact detail and displaying document content
    $("#fact_detail").html("");
    $("#report_id").html("");
    $("#report_mentioned_terms").html("");
    $("#report_text").html("");
  });

}