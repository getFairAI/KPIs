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


import { Transaction, Tag} from "../interfaces";

export const filterTransactionsByTag = (transactions: Transaction[], tag: string): Transaction[] => {
    return transactions.filter((transaction) => {
      // Check if the transaction has the specified tag
      return transaction.node.tags.some((t) => t.name === tag);
    });
  };
  
export const findTag = (tags: Tag[], tagName: string): Tag | undefined => {
    return tags.find((tag) => tag.name === tagName);
}

export const filterTransactionsIncludeTagNamesAndExcludeTags = (
    transactions: Transaction[],
  tagsToInclude: string[],
  addressesToExclude: string [] = [],
  tagsToExclude: { name: string; values: string[] }[] = []
): Transaction[] => {
  return transactions.filter((transaction) => {
    // Check if the transaction has any of the specified tags to include
    const hasTagsToInclude = tagsToInclude.some((tagName) =>
      transaction.node.tags.some((tag) => tag.name === tagName)
    );

    // Check if any of the excluded tags are present in the transaction
    const hasExcludedTags = tagsToExclude.some((excludedTag) => {
      const { name, values } = excludedTag;
      return (
        transaction.node.tags.some(
          (tag) => tag.name === name && values.includes(tag.value)
        )
      );
    });

    // Check if owner address is from Fair

    const isTransactionFromFair = addressesToExclude.includes(transaction.node.owner.address);

    return hasTagsToInclude && !hasExcludedTags && !isTransactionFromFair;
  });
};