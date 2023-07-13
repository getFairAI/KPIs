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

import { gql } from '@apollo/client';

export const QUERY_TXS_WITH = gql`
  query QUERY_TX_WITH($tags: [TagFilter!], $first: Int, $after: String) {
    transactions(tags: $tags, sort: HEIGHT_ASC, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          owner {
            address
          }
          fee {
            ar
          }
          quantity {
            ar
            winston
          }
          block {
            timestamp
          }
          tags {
            name
            value
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;