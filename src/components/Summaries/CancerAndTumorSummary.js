import React from "react";
import Handlebars from "handlebars";
import { withRouter } from "../../utils/withRouter";

const { Component } = React;

const source = `
    {{#if cancers.length}}
        {{#each cancers}}
        <div class="cancer_and_tumor_summary clearfix">
        
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
                    <div class="tnm clearfix">
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
                    <div class="list_view_tumor clearfix">
                        <div class="list_view_tumor_type">
                        {{type}}
                            <ul class="list_view_tumor_list clearfix">
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
  render() {
    return <div className="container" dangerouslySetInnerHTML={{ __html: template(this.props) }} />;
  }
}

// Remove the direct DOM rendering code - only export the component
export default withRouter(CancerAndTumorSummary);
