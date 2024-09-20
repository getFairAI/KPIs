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

import { Transaction, Tag } from "../interfaces";
import { ViewOptions } from "@/Enum";
import {
  SECONDS_PER_DAY,
  SECONDS_PER_WEEK,
  SECONDS_PER_MONTH,
} from "@/constants";
import redstone from "redstone-api";

export const filterTransactionsByTag = (
  transactions: Transaction[],
  tag: string
): Transaction[] => {
  return transactions.filter((transaction) => {
    // Check if the transaction has the specified tag
    return transaction.node.tags.some((t) => t.name === tag);
  });
};

export const findTag = (tags: Tag[], tagName: string): Tag | undefined => {
  return tags.find((tag) => tag.name === tagName);
};

export const filterTransactionsIncludeTagNamesAndExcludeTags = (
  transactions: any[],
  tagsToInclude: string[],
  addressesToExclude: string[] = [],
  tagsToExclude: { name: string; values: string[] }[] = []
): Transaction[] => {
  return transactions.filter((transaction) => {
    // Check if the transaction has any of the specified tags to include
    const hasTagsToInclude = tagsToInclude.some((tagName) =>
      transaction.node.tags.some((tag: any) => tag.name === tagName)
    );

    // Check if any of the excluded tags are present in the transaction
    const hasExcludedTags = tagsToExclude.some((excludedTag) => {
      const { name, values } = excludedTag;
      return transaction.node.tags.some(
        (tag: any) => tag.name === name && values.includes(tag.value)
      );
    });

    // Check if owner address is from Fair

    const isTransactionFromFair = addressesToExclude.includes(
      transaction.node.owner.address
    );

    return hasTagsToInclude && !hasExcludedTags && !isTransactionFromFair;
  });
};

export function sumArraySlice(
  arr: number[],
  start: number,
  end: number
): number {
  return arr.slice(start, end + 1).reduce((acc, current) => acc + current, 0);
}

export const getSecondsByViewOption = (view: string): number => {
  switch (view) {
    case ViewOptions.DAILY:
      return SECONDS_PER_DAY;
    case ViewOptions.WEEKLY:
      return SECONDS_PER_WEEK;
    case ViewOptions.MONTHLY:
      return SECONDS_PER_MONTH;
    default:
      throw new Error(
        "Please check your view option it seems we dont support that"
      );
  }
};

export const getLabelByViewOption = (view: string): string => {
  switch (view) {
    case ViewOptions.DAILY:
      return "Day";
    case ViewOptions.WEEKLY:
      return "Week";
    case ViewOptions.MONTHLY:
      return "Month";
    default:
      throw new Error(
        "Please check your view option it seems we dont support that"
      );
  }
};

export const getUPriceInUSD = async () => {
  const priceData = await redstone.getPrice("U");

  return priceData.value;
};
