export const highlightDocumentCircles = (docIds = []) => {
  // Clear previous concept highlights
  // docIds.forEach((reportId) => {
  //   const existingRing = document.getElementById(`highlight-ring-${reportId}`);
  //   if (existingRing) existingRing.remove();
  // });

  docIds.forEach((reportId) => {
    const normalizedId = reportId.startsWith("main_") ? reportId : "main_" + reportId;
    const circle = document.getElementById(normalizedId);
    console.log(reportId);
    console.log(circle, circle.parentNode);
    if (circle && circle.parentNode) {
      const svg = circle.parentNode;

      const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ring.setAttribute("cx", circle.getAttribute("cx"));
      ring.setAttribute("cy", circle.getAttribute("cy"));
      ring.setAttribute("r", parseFloat(circle.getAttribute("r")) * 1.4);
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "gold");
      ring.setAttribute("stroke-opacity", "0.7");
      ring.setAttribute("stroke-width", "6");
      ring.setAttribute("id", `highlight-ring-${reportId}`);

      svg.insertBefore(ring, circle);
    } else {
      console.log("Circle not found:", reportId);
    }
  });
};

export const clearDocumentHighlights = () => {
  document.querySelectorAll('[id^="highlight-ring-"]').forEach((el) => el.remove());
};
