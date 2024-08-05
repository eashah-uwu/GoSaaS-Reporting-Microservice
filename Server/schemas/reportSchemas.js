const { z } = require("zod");

// Define the schema for the report
const reportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  generationdate: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Invalid date format",
  }),
  parameters: z.record(z.string()), // JSON object with string keys and values
  sourceconnectionid: z.number().int(),
  destinationid: z.number().int(),
  applicationid: z.number().int(),
  storedprocedureid: z.number().int(),
  userid: z.number().int(),
  createdby: z.number().int(),
});

module.exports = { reportSchema };
