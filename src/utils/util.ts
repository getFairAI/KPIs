import { Transaction, Tag} from "../interfaces";

export const filterTransactionsByTag = (transactions: Transaction[], tag: string): Transaction[] => {
    return transactions.filter((transaction) => {
      // Check if the transaction has the specified tag
      return transaction.node.tags.some((t) => t.name === tag);
    });
  };
  

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