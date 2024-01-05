/*
 * Fair Protocol - KPIs
 * Copyright (C) 2023 Fair Protocol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */

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
} from './constants'

import { fairWallets } from './commonVars';


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

export const tagsKpiInferenceResponseNFTS = [
  {
    name: TAG_NAMES.customAppName,
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

 export const tagsToExcludeForModels = [
  {
    name: TAG_NAMES.appVersion,
    values: ['0.1'],
  },
  {
    name: TAG_NAMES.appVersion,
    values: ['0.2'],
  },
  {
    name: TAG_NAMES.appVersion,
    values: ['Fair Protocol'],
  },
  {
    name: TAG_NAMES.modelName,
    values: ['test large file'],
  },
  {
    name: TAG_NAMES.modelName,
    values: ['asdas'],
  },
  ];

  export const uniqueWalletsAlpha = [
    "rwSMutooUrtLmfdvP3q07g4zXjr7Y1ArKT-xV1gTGWA",
    "vLRHFqCw1uHu75xqB4fCDW-QxpkpJxBtFD9g4QYUbfw",
    "udOL7D7qkfFyfnkxfRQA0r1Eoz1-XRwUOSLfiCFee38",
    "mIoV8gDHYakBa9WNgElEm3JbXHG86SoK-HCvc80Lpz4",
    "h7wP8NjoGkJTdLXC6kwS6fLTNgfeYbZr9YoED5NFQX0",
    "lFfVQOlfOd1cQYUKpmfMIQrma1y4E4tVcfmUfHczX-I",
    "oNx0up9sRWDD_yl2LnqfctwFJK7o_zmsacPoXTFDh5k",
    "HJT3UmHQTfbvdb5THR-qUpwgZGcB5RXur3wtw6zyA9Q",
    "9qSYjiKtPmhx2HWBDLRPgJy4UjTVlvwuD0Hq4zkerxM",
    "tOoI8YFZPnkatHux69mw3yO3XLcFye8DyGSByrCw2m8",
    "3nnoNueymOSAondNDPFi9m53eKCYb4p7ny3VhkMX-XI",
    "vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI",
    "A_nS8Da8uIK6RlC2UkZik2xQ83Lt1jMGin-SCQvoMI4",
    "89tR0-C1m3_sCWCoVCChg4gFYKdiH5_ZDyZpdJ2DDRw",
    "WL6tHXZFUtcjLf3uwLIG0GeIzD1pMpx74iyPB7-O5Eg",
    "O6_T-gQG_hfz8FmWDamRqQWYnD7ybZx6Td1Xt6gV1Sw",
    "hv4NIWngChaX8TkmyTdRS9CW1gquds3u9NlVoU9W9KM",
    "0X39b8ImNcLR5Duwc0ppErqbU165vxYR1TP4FZqpLGc",
    "XOXxc-49xz_ElNmMed58mmEn-rn-yFEDYhEsDsPKAwg",
    "5rI0akgMdhlv5R19A5yY8WM6_AGGAAVOY1-SAU9IV7E",
    "qqg_q69nWNQwEXUajdX-Zy3du9HMz-p0Wp-8tFQGDtU",
    "2gJ8_yGjU2OK7uhRaRUrDp7-Z0InMPUPh_yAdigepXc",
    "7nrFkEAaGVMhQ2tP_mA4-5uXXVKOkKmpcs-Qa1LJHEY",
    "QAUKiuTTpVQ0Ozk4bUG69GdAY1mQP2xpGChQr68clWY",
  ];
  
  

  