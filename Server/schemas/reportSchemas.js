const { z } = require("zod");

// Define the schema for the report
const reportSchema = z.object({
  title: z.string().min(3, "Title must be atleast 3 characters").max(25, "Title should not exceed 25 characters"),
  description: z.string().min(5, "Description must be atleast 5 characters").max(125, "Description should not exceed 125 characters"),
  parameters: z.record(z.string()), // JSON object with string keys and values
  sourceconnectionid: z.number().int(),
  destinationid: z.number().int(),
  applicationid: z.number().int(),
  storedprocedureid: z.number().int(),
});

module.exports = reportSchema;
