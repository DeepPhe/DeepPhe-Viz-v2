const CANCER_ATTRIBUTES_STORE = "cancerAttributesStore";
const TUMOR_ATTRIBUTES_STORE = "tumorAttributesStore";
const TUMOR_ATTRIBUTES_TEXT_FILE = "tumor_attributes.csv";
const CANCER_ATTRIBUTES_TEXT_FILE = "cancer_attributes.csv";
const DEEPPHE_DB = "DeepPheDB";

const OMAP_DX_TEXT_FILE = "calculated_dx_data.csv";
const OMAP_DX_STORE = "omapDxStore";
const OMAP_PATIENT_TEXT_FILE = "calculated_patient_data.csv";
const OMAP_PATIENT_STORE = "omapPatientStore";
const DEEPPHE_TXT_FILE = "DeepPheOutput.txt";

const CANCER_ATTRIBUTES_MAP = {
  PATIENT_NAME: "patientid",
  CANCER_ID: "cancerid",
  CANCER_TYPE: "cancer_type",
  ATTRIBUTE_NAME: "attribid",
  ATTRIBUTE_VALUE: "attribval",
  CONFIDENCE: "confidence",
};

const TUMOR_ATTRIBUTES_MAP = {
  PATIENT_NAME: "patientid",
  CANCER_ID: "CANCER_ID",
  TUMOR_ID: "TUMOR_ID",
  TUMOR_TYPE: "tumor_type",
  ATTRIBUTE_NAME: "attribute_name",
  ATTRIBUTE_VALUE: "attribute_value",
  CONFIDENCE: "confidence",
  ATTRIBUTE_STATUS: "attribute_status",
};

export {
  DEEPPHE_DB,
  DEEPPHE_TXT_FILE,
  OMAP_DX_TEXT_FILE,
  OMAP_DX_STORE,
  OMAP_PATIENT_TEXT_FILE,
  OMAP_PATIENT_STORE,
  CANCER_ATTRIBUTES_MAP,
  TUMOR_ATTRIBUTES_MAP,
  CANCER_ATTRIBUTES_STORE,
  TUMOR_ATTRIBUTES_STORE,
  TUMOR_ATTRIBUTES_TEXT_FILE,
  CANCER_ATTRIBUTES_TEXT_FILE,
};
