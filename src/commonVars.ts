import {
  TAG_NAMES, 
  APP_NAME, 
  SCRIPT_INFERENCE_REQUEST, 
  MODEL_CREATION, 
  SCRIPT_CREATION, 
  REGISTER_OPERATION, 
  SCRIPT_INFERENCE_RESPONSE,
  CANCEL_OPERATION,
  INFERENCE_PAYMENT,
  SCRIPT_CREATION_PAYMENT,
  MODEL_CREATION_PAYMENT,
  MARKETPLACE,
  OPERATOR_ONE, 
  OPERATOR_TWO, 
  CURATOR, 
  USER_ONE, 
  USER_TWO, 
  CREATOR,
} from './constants'

export const fairWallets = [ MARKETPLACE, OPERATOR_ONE, OPERATOR_TWO, CURATOR, USER_ONE, USER_TWO, CREATOR];
export const tagsKpiUsers = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [SCRIPT_INFERENCE_REQUEST],
},];

export const tagsKpiUploadModels = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [MODEL_CREATION],
},];

export const tagsKpiUploadScripts = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [SCRIPT_CREATION],
},];

export const tagsKpiOperatorsRegistration = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [REGISTER_OPERATION],
},];

export const tagsKpiInferenceResponse = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [SCRIPT_INFERENCE_RESPONSE],
},];

export const tagsKpiOperatorCancel = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [CANCEL_OPERATION],
},];

export const tagsKpiInferencePayment = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [INFERENCE_PAYMENT],
},];

export const tagsKpiSciptPayment = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [SCRIPT_CREATION_PAYMENT],
},];

export const tagsKpiModelCreationPayment = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [MODEL_CREATION_PAYMENT],
},];


export const tagsToExclude = [
  {
    name: TAG_NAMES.appVersion,
    values: ['test'],
  },
  {
    name: TAG_NAMES.sequenceOwner,
    values: fairWallets,
  },
  ];


  