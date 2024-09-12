export var Aggregation_Interval;
(function (Aggregation_Interval) {
    Aggregation_Interval["Day"] = "day";
    Aggregation_Interval["Hour"] = "hour";
})(Aggregation_Interval || (Aggregation_Interval = {}));
/** Defines the order direction, either ascending or descending */
export var OrderDirection;
(function (OrderDirection) {
    OrderDirection["Asc"] = "asc";
    OrderDirection["Desc"] = "desc";
})(OrderDirection || (OrderDirection = {}));
export var Transfer_OrderBy;
(function (Transfer_OrderBy) {
    Transfer_OrderBy["ArweaveTx"] = "arweaveTx";
    Transfer_OrderBy["BlockNumber"] = "blockNumber";
    Transfer_OrderBy["BlockTimestamp"] = "blockTimestamp";
    Transfer_OrderBy["From"] = "from";
    Transfer_OrderBy["Id"] = "id";
    Transfer_OrderBy["To"] = "to";
    Transfer_OrderBy["TransactionHash"] = "transactionHash";
    Transfer_OrderBy["Value"] = "value";
})(Transfer_OrderBy || (Transfer_OrderBy = {}));
export var _SubgraphErrorPolicy_;
(function (_SubgraphErrorPolicy_) {
    /** Data will be returned even if the subgraph has indexing errors */
    _SubgraphErrorPolicy_["Allow"] = "allow";
    /** If the subgraph has indexing errors, data will be omitted. The default. */
    _SubgraphErrorPolicy_["Deny"] = "deny";
})(_SubgraphErrorPolicy_ || (_SubgraphErrorPolicy_ = {}));
export const QueryArbitrumTransfersDocument = { "kind": "Document", "definitions": [{ "kind": "OperationDefinition", "operation": "query", "name": { "kind": "Name", "value": "queryArbitrumTransfers" }, "variableDefinitions": [{ "kind": "VariableDefinition", "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "first" } }, "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Int" } } }, { "kind": "VariableDefinition", "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "skip" } }, "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "Int" } } }], "selectionSet": { "kind": "SelectionSet", "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "transfers" }, "arguments": [{ "kind": "Argument", "name": { "kind": "Name", "value": "first" }, "value": { "kind": "Variable", "name": { "kind": "Name", "value": "first" } } }, { "kind": "Argument", "name": { "kind": "Name", "value": "skip" }, "value": { "kind": "Variable", "name": { "kind": "Name", "value": "skip" } } }], "selectionSet": { "kind": "SelectionSet", "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "from" } }, { "kind": "Field", "name": { "kind": "Name", "value": "to" } }, { "kind": "Field", "name": { "kind": "Name", "value": "value" } }, { "kind": "Field", "name": { "kind": "Name", "value": "blockTimestamp" } }, { "kind": "Field", "name": { "kind": "Name", "value": "arweaveTx" } }, { "kind": "Field", "name": { "kind": "Name", "value": "transactionHash" } }, { "kind": "Field", "name": { "kind": "Name", "value": "blockNumber" } }] } }] } }] };
