import React, { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import { hexToRgba } from "./ColorUtils";

export function DocumentPanel(props) {
  // const [doc, setDoc] = useState(props.doc);
  const [docText, setDocText] = useState(props.doc.getDocumentText());
  const concepts = props.concepts;
  const mentions = props.mentions;
  const clickedTerms = props.clickedTerms;
  const semanticGroups = props.semanticGroups;
  const filteredConcepts = props.filteredConcepts;
  const [filteredConceptsStartingCopy, setFilteredConceptsStartingCopy] = useState([]);
  const [mentionsForClickedConcepts, setMentionsForClickedConcepts] = useState(new Set());
  const fontSize = props.fontSize;
  const confidence = props.confidence;
  const filterLabel = props.filterLabel;
  const reportId = props.reportId;

  useEffect(() => {
    if (Array.isArray(filteredConcepts) && filteredConcepts.length > 0) {
      setFilteredConceptsStartingCopy(filteredConcepts);
    }
  }, [filteredConcepts]);

  // When clickedTerms change:
  useEffect(() => {
    const mentions = new Set(getMentionsForClickedConcept(clickedTerms)); // Store mentions in a Set
    setMentionsForClickedConcepts(mentions); // Store the mentions in state for efficient lookups
  }, [props.clickedTerms, props.doc]);

  const getMentionsGivenMentionIds = (mentionIds) => {
    return props.doc.getMentionIdsInDocument().filter((m) => mentionIds.includes(m.id));
  };

  const getMentionsForClickedConcept = (conceptIds) => {
    if (!conceptIds || conceptIds.length === 0) return [];
    // console.log("CONCEPT IDS",conceptIds);
    return conceptIds.flatMap((conceptId) => {
      if (conceptId === "") return [];
      // console.log(concepts);
      const idx = concepts.findIndex((c) => c.id === conceptId);
      // console.log(idx);

      if (idx === -1) return [];
      // console.log(concepts[idx].mentionIds);
      // console.log(props.doc.getMentionIdsInDocument());
      return concepts[idx].mentionIds.filter((mentionId) =>
        props.doc.getMentionIdsInDocument().some((m) => m.id === mentionId)
      );
    });
  };

  const getMentionsForConcept = (conceptId) => {
    if (conceptId === "") return [];
    if (conceptId !== undefined) {
      const idx = concepts.findIndex((c) => c.id === conceptId);
      if (idx === -1) return [];
      // console.log(concepts, props.doc.getMentionIdsInDocument());
      const validMentionIds = concepts[idx].mentionIds.filter((mentionId) => {
        // console.log(`mentionId ${mentionId} is ${result ? "valid" : "invalid"}`);
        return props.doc.getMentionIdsInDocument().some((m) => {
          // console.log(`Comparing mentionId: ${mentionId} with m: ${m.id}`);
          return m.id === mentionId;
        });
      });

      // console.log('Filtered Mention IDs:', validMentionIds);
      return validMentionIds;
    }
    return [];
  };

  // const mentionsForClickedConcepts = useMemo(() => {
  //   return new Set(getMentionsForConcept(clickedTerms));
  // }, [clickedTerms]);

  function calculateMentionConfidence(obj) {
    let mentionConfidence = 0;

    if (filterLabel === "Concepts") {
      // console.log(filteredConceptsStartingCopy);
      // console.log(obj.id);
      const result = filteredConceptsStartingCopy.find(
        (category) => category.mentionIds && category.mentionIds.includes(obj.id)
      );
      // console.log(result);
      if (result) {
        mentionConfidence = Math.round(result.confidence);
      } else {
        console.log(result.preferredText, "has no confidence");
      }
    } else {
      mentionConfidence = Math.round(obj.confidence);
    }
    return mentionConfidence;
  }

  function getDpheGroupByMentionId(mentionId) {
    const match = concepts.find((item) => item.mentionIds.includes(mentionId));
    return match ? match.dpheGroup : null;
  }

  function determineBackgroundColor(obj, mentionConfidence) {
    let backgroundColor = "";
    const dpheGroup = getDpheGroupByMentionId(obj.id);
    const groupInfo = semanticGroups[dpheGroup];

    if (
      !groupInfo || // group not found
      mentionConfidence < confidence * 100 ||
      groupInfo.checked === false
    ) {
      backgroundColor = "lightgrey";
    } else {
      backgroundColor = hexToRgba(groupInfo.backgroundColor, 0.65);
    }

    return backgroundColor;
  }

  function createMentionObj(FilteredConceptsIds) {
    let textMentions = [];
    // console.log(FilteredConceptsIds);
    FilteredConceptsIds.forEach(function (nestedArray) {
      // console.log(nestedArray);
      nestedArray.forEach(function (obj) {
        // console.log(mentionsForClickedConcepts.has(obj.id));
        const mentionConfidence = calculateMentionConfidence(obj);
        // console.log(mentionsForClickedConcepts);
        // console.log("OBJ", obj);
        let textMentionObj = {
          // preferredText: obj["preferredText"],
          begin: obj.begin,
          end: obj.end,
          id: obj.id,
          negated: obj.negated,
          classUri: obj.classUri,
          confidence: mentionConfidence,
          backgroundColor: determineBackgroundColor(obj, mentionConfidence),
          clickedTerm: mentionsForClickedConcepts.has(obj.id),
        };
        // console.log(textMentionObj);

        textMentions.push(textMentionObj);
      });
    });

    // Sort by confidence in ascending order (lower confidence first, higher last)
    textMentions.sort((a, b) => a.confidence - b.confidence);

    return textMentions;
  }

  function flattenRanges(ranges) {
    let points = [];
    let flattened = [];
    for (let i in ranges) {
      if (ranges[i].end < ranges[i].begin) {
        //RE-ORDER THIS ITEM (BEGIN/END)
        let tmp = ranges[i].end; //RE-ORDER BY SWAPPING
        ranges[i].end = ranges[i].begin;
        ranges[i].begin = tmp;
      }
      points.push(ranges[i].begin);
      points.push(ranges[i].end);
    }

    points.sort(function (a, b) {
      return a - b;
    });

    for (let i in points) {
      if (i === 0 || points[i] === points[i - 1]) continue;
      let includedRanges = ranges.filter(function (x) {
        return Math.max(x.begin, points[i - 1]) < Math.min(x.end, points[i]);
      });

      if (includedRanges.length > 0) {
        let flattenedRange = {
          begin: points[i - 1],
          end: points[i],
          count: 0,
        };

        for (let j in includedRanges) {
          let includedRange = includedRanges[j];

          for (let prop in includedRange) {
            if (prop !== "begin" && prop !== "end") {
              if (!flattenedRange[prop]) flattenedRange[prop] = [];
              flattenedRange[prop].push(includedRange[prop]);
            }
          }

          flattenedRange.count++;
        }

        flattened.push(flattenedRange);
      }
    }
    return flattened;
  }

  function isNegated(negatedArray) {
    return negatedArray.includes(true);
  }

  function highlightTextMentions(textMentions, reportText) {
    //No mentions in reportText, we return just reportText
    // console.log("ALL TEXTMENTIONS IN DOC:", textMentions);

    if (textMentions.length === 0) {
      return reportText;
    }

    // Flatten the ranges, this is the key to solve overlapping
    textMentions = flattenRanges(textMentions);

    let textFragments = [];
    let lastValidTMIndex = 0;

    // For loop to highlight each mention in the report text
    for (let i = 0; i < textMentions.length; i++) {
      let textMention = textMentions[i];
      // , Confidence: ${textMention.confidence}`
      //   console.log(`Mention: ${textMention.preferredText}| DpheGroup: ${textMention.dpheGroup}`);
      textMention.backgroundColor =
        textMention.backgroundColor[textMention.backgroundColor.length - 1];

      let lastValidTM = textMentions[lastValidTMIndex];

      if (i === 0) {
        if (textMention.begin === 0) {
          textFragments.push("");
        } else {
          textFragments.push(reportText.substring(0, textMention.begin));
        }
      } else {
        if (textMention.begin <= lastValidTM.end) {
          lastValidTMIndex = i;
        } else {
          textFragments.push(reportText.substring(lastValidTM.end, textMention.begin));
        }
      }

      let borderColor = textMention.clickedTerm.some((element) => {
        return element;
      })
        ? "border-color: black;"
        : "border-color: transparent;";

      //We want to check what is in front of text mention without checking what is behind it, so this is a special
      //case for the first textMention
      if (i === 0 && textMentions[i + 1]) {
        if (
          textMention.backgroundColor ===
          textMentions[i + 1].backgroundColor[textMentions[i + 1].backgroundColor.length - 1]
        ) {
          const spanClass = isNegated(textMention.negated) ? "neg" : "";
          const spanStyle = `background-color: ${textMention.backgroundColor};
              border-style: solid; 
              ${borderColor};
              border-radius: 5px 0 0 5px;
              padding-left: 2px;
              padding-right: 2px;`;
          const htmlString =
            `<span style="${spanStyle}${
              isNegated(textMention.negated) ? "; line-height: 1.2;" : ""
            }" class="span-info ${spanClass}">` +
            `${reportText.substring(textMention.begin, textMention.end).trim()}` +
            `<span class="tooltip">${textMention.confidence[0]}%</span>` +
            (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : "") +
            `</span>`;

          textFragments.push(htmlString);
        }
        //regular 5px border
        else {
          const spanClass = isNegated(textMention.negated) ? "neg" : "";
          const spanStyle = `background-color: ${textMention.backgroundColor};
          border-style: solid; 
          ${borderColor};
          border-radius: 5px;
          padding-left: 2px;
          padding-right: 2px;`;
          const htmlString =
            `<span style="${spanStyle}${
              isNegated(textMention.negated) ? "; line-height: 1.2;" : ""
            }" class="span-info ${spanClass}">` +
            `${reportText.substring(textMention.begin, textMention.end).trim()}` +
            `<span class="tooltip">${textMention.confidence[0]}%</span>` +
            (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : "") +
            `</span>`;

          textFragments.push(htmlString);
        }
      }

      //We want to check what is behind the last text mention without checking what is in front it, so this is a special
      //case for the last textMention
      if (
        i === textMentions.length - 1 &&
        reportText.substring(textMention.begin, textMention.end).trim() !== ""
      ) {
        if (textMentions[i - 1].backgroundColor === textMention.backgroundColor) {
          const spanClass = isNegated(textMention.negated) ? "neg" : "";
          const spanStyle = `background-color: ${textMention.backgroundColor};
          border-style: solid; 
          ${borderColor};
          border-radius:0 5px 5px 0;
          padding-left: 2px;
          padding-right: 2px;`;
          const htmlString =
            `<span style="${spanStyle}${
              isNegated(textMention.negated) ? "; line-height: 1.2;" : ""
            }" class="span-info ${spanClass}">` +
            `${reportText.substring(textMention.begin, textMention.end).trim()}` +
            `<span class="tooltip">${textMention.confidence[0]}%</span>` +
            (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : "") +
            `</span>`;

          textFragments.push(htmlString);
        } else {
          const spanClass = isNegated(textMention.negated) ? "neg" : "";
          const spanStyle = `background-color: ${textMention.backgroundColor};
          border-style: solid; 
          ${borderColor};
          border-radius: 5px;
          padding-left: 2px;
          padding-right: 2px;`;
          const htmlString =
            `<span style="${spanStyle}${
              isNegated(textMention.negated) ? "; line-height: 1.2;" : ""
            }" class="span-info ${spanClass}">` +
            `${reportText.substring(textMention.begin, textMention.end).trim()}` +
            `<span class="tooltip">${textMention.confidence[0]}%</span>` +
            (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : "") +
            `</span>`;

          textFragments.push(htmlString);
        }
      }

      if (
        i > 0 &&
        i < textMentions.length - 1 &&
        reportText.substring(textMention.begin, textMention.end).trim() !== ""
      ) {
        const borderRadius = determineBorderRadius(textMention, textMentions, i);
        const spanClass = isNegated(textMention.negated) ? "neg" : "";
        const spanStyle = `background-color: ${textMention.backgroundColor};
        border-style: solid; 
        ${borderColor};
        border-radius:${borderRadius};
        padding-left: 2px;
        padding-right: 2px;`;

        const htmlString =
          `<span style="${spanStyle}${
            isNegated(textMention.negated) ? "; line-height: 1.2;" : ""
          }" class="span-info ${spanClass}">` +
          `${reportText.substring(textMention.begin, textMention.end).trim()}` +
          `<span class="tooltip">${textMention.confidence[0]}%</span>` +
          (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : "") +
          `</span>`;

        textFragments.push(htmlString);
      }

      lastValidTMIndex = i;
    }

    textFragments.push(reportText.substring(textMentions[lastValidTMIndex].end));

    // Assemble the final report content with highlighted texts
    let highlightedReportText = "";
    textFragments = cleanUpTextFragments(textFragments);

    for (let j = 0; j < textFragments.length; j++) {
      highlightedReportText += textFragments[j];
    }

    return highlightedReportText;
  }

  //Backgrounds both have color
  function determineBorderRadius(textMention, textMentions, i) {
    //check for past and future textMention, if they are same color then change border to 0
    if (
      textMentions[i - 1].backgroundColor &&
      textMention.backgroundColor &&
      textMentions[i + 1].backgroundColor[textMentions[i + 1].backgroundColor.length - 1]
    ) {
      return "0";
    }
    //checking past textMention only
    else if (textMentions[i - 1].backgroundColor && textMention.backgroundColor) {
      return "0 5px 5px 0";
    }
    //checking future textMention only
    else if (
      textMention.backgroundColor &&
      textMentions[i + 1].backgroundColor[textMentions[i + 1].backgroundColor.length - 1]
    ) {
      return "5px 0 0 5px";
    }
    //its by its self between two non highlighted spans
    else {
      return "5px";
    }
  }

  function cleanUpTextFragments(textFragments) {
    //getting correct click
    for (let i = 0; i < textFragments.length; i++) {
      if (textFragments[i].includes("border-color: black;")) {
        // console.log('solid: ', textFragments[i]);
        if (textFragments[i + 1].includes("</span>") && !textFragments[i - 1].includes("</span>")) {
          // console.log('left', textFragments[i]);
          textFragments[i] = textFragments[i].replace(
            "borderLeft: solid; borderTop: solid; borderBottom: solid;"
          );
        } else if (
          textFragments[i - 1].includes("</span>") &&
          !textFragments[i + 1].includes("border-style: solid;")
        ) {
          // console.log('right', textFragments[i]);
          textFragments[i] = textFragments[i].replace(
            "borderRight: solid; borderTop: solid; borderBottom: solid;"
          );
        } else if (
          textFragments[i + 1].includes("</span>") &&
          textFragments[i - 1].includes("</span>")
        ) {
          // console.log('middle', textFragments[i]);
          textFragments[i] = textFragments[i].replace("borderTop: solid; borderBottom: solid;");
        }
      }

      //if border-radius is 5px 0 0 5px, there should be a span to the right, if there isn't then we should change that border
      if (textFragments[i].includes("border-radius: 5px 0 0 5px;")) {
        if (!textFragments[i + 1].includes("</span>")) {
          textFragments[i] = textFragments[i].replace(
            "border-radius: 5px 0 0 5px;",
            "border-radius: 5px;"
          );
        }
      }

      //if border-radius is 0, there should be a span to the right and left of it
      //if not, there could be a mention to the right or left of it that is spaced away
      //we need to figure this out and make changes accordingly
      if (textFragments[i].includes("border-radius:0;")) {
        if (!textFragments[i + 1].includes("</span>")) {
          textFragments[i] = textFragments[i].replace(
            "border-radius:0;",
            "border-radius:0 5px 5px 0;"
          );
        } else if (!textFragments[i - 1].includes("</span>")) {
          textFragments[i] = textFragments[i].replace(
            "border-radius:0;",
            "border-radius: 5px 0 0 5px;"
          );
        }
      }

      //if border-radius is 0 5px 5px 0, there should be a span to the left, if there isn't then we should change that border
      if (textFragments[i].includes("border-radius:0 5px 5px 0")) {
        if (!textFragments[i - 1].includes("</span>")) {
          textFragments[i] = textFragments[i].replace(
            "border-radius:0 5px 5px 0;",
            "border-radius: 5px;"
          );
        }
      }
    }
    return textFragments;
  }

  function getAllMentionsInDoc() {
    let MentionList = [];

    console.log("filtereDCONEPTS", filteredConceptsStartingCopy);

    for (let i = 0; i < filteredConceptsStartingCopy.length; i++) {
      const conceptId = filteredConceptsStartingCopy[i].id;
      const mentionIdsFromConceptId = getMentionsForConcept(conceptId);
      // console.log(mentionIdsFromConceptId);
      const mentions = getMentionsGivenMentionIds(mentionIdsFromConceptId);
      // console.log(mentions);
      MentionList.push(mentions);
    }
    // console.log(MentionList);
    return MentionList;
  }

  const setHTML = useCallback(() => {
    const mentions = getAllMentionsInDoc();
    // console.log(mentions);
    // const mentions =
    const hasAtLeastOneMention = mentions.some((group) => group.length > 0);

    if (hasAtLeastOneMention && props.doc.getDocumentText()) {
      const html = highlightTextMentions(createMentionObj(mentions), props.doc.getDocumentText());
      setDocText(html);
    }
  }, [getAllMentionsInDoc, highlightTextMentions, createMentionObj, props.doc.getDocumentText]);

  useEffect(() => {
    if (props.doc.getDocumentText()) {
      setDocText(props.doc.getDocumentText()); // Raw text shown until mentions ready
    }
  }, [docText]);

  useEffect(() => {
    // Combined the checks for filteredConcepts and filteredConceptsStartingCopy
    // console.log(props.filteredConcepts.length, filteredConceptsStartingCopy.length, docText);
    // console.log("IS THIS BEING CALLED");
    console.log(props.clickedTerms);
    if ((props.filteredConcepts.length > 0 || filteredConceptsStartingCopy.length > 0) && docText) {
      // console.log("does this get called");
      setHTML();
    }
  }, [
    props.filteredConcepts,
    filteredConceptsStartingCopy,
    docText,
    props.clickedTerms,
    props.confidence,
    props.semanticGroups,
    filterLabel,
    mentionsForClickedConcepts,
    props.doc,
    props.reportId,
  ]);

  const getHTML = (docText) => {
    return parse(docText);
  };

  if (props.doc === null) {
    return <div>Loading...</div>;
  } else {
    return (
      <React.Fragment>
        <div style={{ fontSize: fontSize }}>{getHTML(docText)}</div>
      </React.Fragment>
    );
  }
}
