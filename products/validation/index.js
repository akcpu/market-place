const Ajv = require("ajv");
const product_schema_getID = require("./product_schema_getID.json");
const product_schema_setData = require("./product_schema_setData.json");
const ajv = (exports.ajv = new Ajv());
ajv.addSchema(product_schema_getID, "getID");
ajv.addSchema(product_schema_setData, "setData");
