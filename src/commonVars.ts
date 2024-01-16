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
  MARKETPLACE,
  VAULT_ADDRESS,
  OPERATOR_ONE, 
  OPERATOR_TWO, 
  MAIN_OPERATOR,
  CURATOR, 
  USER_ONE, 
  CREATOR,
  USER_THREE,
  USER_FOUR,
  USER_DEPLOY_TEST,
  SCRIPT,
  USER_TWITTER,
  TEST_MODELS,
  USER_DEMO_MG,
} from './constants'

export const fairWallets = [ MARKETPLACE, VAULT_ADDRESS, OPERATOR_ONE, OPERATOR_TWO, MAIN_OPERATOR, CURATOR, USER_ONE, USER_THREE, USER_FOUR, USER_TWITTER, CREATOR, USER_DEPLOY_TEST, SCRIPT, TEST_MODELS, USER_DEMO_MG];

export const targetUWallets = [ MARKETPLACE, VAULT_ADDRESS, OPERATOR_ONE, OPERATOR_TWO, MAIN_OPERATOR, CURATOR, USER_ONE, SCRIPT];

export const activeUsersDescription = "Active users made at least 5 transactions in the specified time.";

export const paymentsDescription = "One payment from this chart can mean multiple requests. Ex: 1 request can have N images.";

export const usersPerXDescription = "Users who made at least 1 transaction in the specified time."

export const failedPaymentDescription = "Requests for which the respective payments were not found.";

export const newScriptsDescription = "One AI model can have multiple scripts associated.";

export const retentionRateDescription = "The percentage of users who made at least 1 transaction in 2 consecutive periods.";

export const newModelsDescription = "New models uploaded to the marketplace.";

export const activeOperatorsDescription = "Operators can have multiple script registrations (one per script).";

export const subTitle = "This website shows all transaction made on the Fair Protocol marketplace, excluding all test and personal wallets from the team that built it.";
  