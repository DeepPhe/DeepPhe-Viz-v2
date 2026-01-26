import React from "react";
import Handlebars from "handlebars";
import { withRouter } from "../../utils/withRouter";
import "./CancerAndTumorSummary.css";

const { Component } = React;

const source = `
    {{#if cancers.length}}
        {{#each cancers}}
        <div class="cancer_and_tumor_summary">
        
            <div class="cancer_id">Cancer ID: {{title}}</div>
            
            <div class="cancer_and_tnm">
                <ul class="cancer_facts">
                    {{#each collatedCancerFacts}}
                    <li class="cancer_facts_item">
                        <span class="cancer_fact_category_name">{{categoryName}}: </span>
                        <ul class="cancer_fact_list">
                            {{#each facts}}
                            <li><span class="fact" id="{{id}}">{{value}}</span></li>
                            {{/each}}
                        </ul>
                    </li>
                    {{/each}}
                </ul>

                {{#if tnm.length}}
                    <div class="tnm">
                        {{#each tnm}}
                        <div class="tnm_by_type">
                            <span class="tnm_type">{{type}} TNM: </span>
                            
                            {{#if data.T}}
                            <ul class="cancer_tnm_fact_list">
                                {{#each data.T}}
                                <li><span class="fact" id="{{id}}">{{value}}</span></li>
                                {{/each}}
                            </ul>
                            {{/if}}

                            {{#if data.N}}
                            <ul class="cancer_tnm_fact_list">
                                {{#each data.N}}
                                <li><span class="fact" id="{{id}}">{{value}}</span></li>
                                {{/each}}
                            </ul>
                            {{/if}}

                            {{#if data.M}}
                            <ul class="cancer_tnm_fact_list">
                                {{#each data.M}}
                                <li><span class="fact" id="{{id}}">{{value}}</span></li>
                                {{/each}}
                            </ul>
                            {{/if}}
                        </div>
                        {{/each}}
                    </div>
                {{/if}}
            </div>

            {{#if tumors.tumors.length}}
            <div class="tumor_summary">
                <div class="tumor_summary_title">Tumor Summary</div>

                <!-- List View Only -->
                <div id="list_view_{{cancerId}}" class="list_view">
                    {{#each tumors.listViewData}}
                    <div class="list_view_tumor">
                        <div class="list_view_tumor_type">
                        {{type}}
                            <ul class="list_view_tumor_list">
                                {{#each data}}
                                    {{#if facts}}
                                    <li class="list_view_tumor_list_item">
                                        {{category}}:
                                        <ul class="list_view_tumor_fact_list">
                                            {{#each facts}}
                                            <li><span class="fact" id="list_view_{{id}}">{{value}}</span></li>
                                            {{/each}}
                                        </ul>
                                    </li>
                                    {{/if}}
                                {{/each}}
                            </ul>
                        </div>
                    </div>
                    {{/each}}
                </div>
            </div>
            {{/if}}

        </div>
        {{/each}}
    {{/if}}
`;

const template = Handlebars.compile(source);

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("inArray", function (item, arr, opts) {
  if (Array.isArray(arr)) {
    if (arr.indexOf(item) > -1) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  } else {
    console.error("ERROR: arr is not an array!");
    console.error("Item:" + item);
    console.error("Opts:" + opts);
    return false;
  }
});

class CancerAndTumorSummary extends Component {
  state = {
    selectedFactId: null,
  };

  handleFactClick = (e) => {
    const el = e.target.closest(".fact");
    if (!el) return;

    const factId = el.id;

    // 1️⃣ Find basic info
    const info = this.findBasicFactInfo(factId);
    if (!info) return;

    // 2️⃣ Find corresponding attribute value
    const attributeValue = this.findAttributeByFact(info);

    // 3️⃣ Find mentions and documents
    const conceptIds = attributeValue?.valueObj?.conceptIds || [];
    const mentions = this.findMentionsForConcept(conceptIds);
    const documents = this.getDocumentsFromMentions(mentions);

    // 4️⃣ Store everything in state
    this.setState({
      selectedFactInfo: info,
      selectedAttributeValue: attributeValue,
      selectedConceptMentions: mentions,
      selectedConceptDocuments: documents,
    });
  };

  findBasicFactInfo = (factId) => {
    const { cancers = [] } = this.props;

    for (const cancer of cancers) {
      for (const group of cancer.collatedCancerFacts || []) {
        for (const fact of group.facts || []) {
          if (fact.id === factId) {
            return {
              cancerId: cancer.cancerId,
              selectedFactId: fact.id,
              categoryName: group.categoryName,
              prettyName: fact.prettyName || fact.value,
            };
          }
        }
      }
    }

    return null;
  };

  findAttributeByFact = (selectedFactInfo) => {
    if (!selectedFactInfo) return null;

    const { patientJson } = this.props;
    const { cancerId, selectedFactId } = selectedFactInfo;

    if (!patientJson?.cancers) return null;

    // Find the cancer that matches the selectedFact's cancerId
    const matchedCancer = patientJson.cancers.find((c) => c.id === cancerId);
    if (!matchedCancer) return null;

    // Loop through attributes
    for (const attr of matchedCancer.attributes || []) {
      for (const val of attr.values || []) {
        if (val.id === selectedFactId) {
          return {
            attributeName: attr.name || attr.category || "Unknown",
            valueObj: val,
          };
        }
      }
    }

    return null;
  };

  findMentionsForConcept = (conceptIds = []) => {
    const { patientJson } = this.props;
    if (!patientJson?.concepts) return [];

    // Collect all mentions that match any of the conceptIds
    const mentions = [];

    for (const concept of patientJson.concepts) {
      if (!conceptIds.includes(concept.id)) continue;

      // Each concept may have mentions
      if (concept.mentions?.length) {
        mentions.push(...concept.mentions);
      }
    }

    return mentions;
  };

  getDocumentsFromMentions = (mentions = []) => {
    // Extract unique document IDs from mentions
    const docIds = new Set();
    for (const mention of mentions) {
      if (mention.documentId) {
        docIds.add(mention.documentId);
      }
    }

    // Optionally map to full document objects if you have patientJson.documents
    const documents = [];
    const { patientJson } = this.props;
    if (patientJson?.documents) {
      for (const doc of patientJson.documents) {
        if (docIds.has(doc.id)) {
          documents.push(doc);
        }
      }
    }

    return documents;
  };

  render() {
    console.log("CancerAndTumorSummary props:", this.props);
    // I need to import fullJson, then get the AV id from this.state.selectedFactInfo.selectedFactId
    // with the AV id I will then look at fullJson -> cancers -> cancerId -> attributes -> values | AV = Attr Value

    // Now that we have conceptId, I'll need to go into PatientJson -> concepts -> find mentions for matching concept
    // -> get the documents that those mentions are within -> from here we can display which documents contain that
    // clicked concept

    // console.log("props:", this.state.selectedAttributeValue.valueObj.conceptIds);

    return (
      <div className="summary_layout">
        {/* LEFT: existing Handlebars output */}
        <div
          className="summary_main"
          onClick={this.handleFactClick}
          dangerouslySetInnerHTML={{ __html: template(this.props) }}
        />

        {/* RIGHT: info panel */}
        <div className="summary_side_panel">
          <h3>Details</h3>

          {this.state.selectedFactInfo ? (
            <div>
              <div>
                <strong>Cancer ID:</strong> {this.state.selectedFactInfo.cancerId}
              </div>
              <div>
                <strong>Fact ID:</strong> {this.state.selectedFactInfo.selectedFactId}
              </div>
              <div>
                <strong>Category:</strong> {this.state.selectedFactInfo.categoryName}
              </div>
              <div>
                <strong>Pretty Name:</strong> {this.state.selectedFactInfo.prettyName}
              </div>

              {this.state.selectedAttributeValue ? (
                <div>
                  <div>
                    <strong>Concept Ids:</strong>{" "}
                    {this.state.selectedAttributeValue.valueObj.conceptIds}
                  </div>
                  <div>
                    <strong>Negated:</strong>{" "}
                    {String(this.state.selectedAttributeValue.valueObj.negated)}
                  </div>
                  <div>
                    <strong>Confidence:</strong>{" "}
                    {String(this.state.selectedAttributeValue.valueObj.confidence)}%
                  </div>
                  {/*<div>*/}
                  {/*  <strong>Attribute Name:</strong>{" "}*/}
                  {/*  {this.state.selectedAttributeValue.attributeName}*/}
                  {/*</div>*/}
                  {/*<pre style={{ fontSize: "12px" }}>*/}
                  {/*  {JSON.stringify(this.state.selectedAttributeValue.valueObj, null, 2)}*/}
                  {/*</pre>*/}

                  {this.state.selectedConceptDocuments?.length ? (
                    <div style={{ marginTop: 8 }}>
                      <strong>Documents containing this concept:</strong>
                      <ul>
                        {this.state.selectedConceptDocuments.map((doc) => (
                          <li key={doc.id}>{doc.title || doc.id}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>No documents contain this concept.</div>
                  )}
                </div>
              ) : (
                <div>No attribute value found for this fact.</div>
              )}
            </div>
          ) : (
            <div>Click a fact to see details here.</div>
          )}
        </div>
      </div>
    );
  }
}

// Remove the direct DOM rendering code - only export the component
export default withRouter(CancerAndTumorSummary);
