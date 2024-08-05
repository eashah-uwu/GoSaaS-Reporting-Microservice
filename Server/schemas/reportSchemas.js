const { z } = require('zod');

// Define the schema for the report
const reportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  generationDate: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Invalid date format"
  }),
  parameters: z.record(z.string()), // JSON object with string keys and values
  sourceConnectionID: z.number().int(),
  destinationID: z.number().int(),
  applicationID: z.number().int(),
  storedProcedureID: z.number().int(),
  userID: z.number().int(),
  createdBy: z.number().int(),
  createdAt: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Invalid date format"
  }),
  updatedAt: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Invalid date format"
  })
});

module.exports = { reportSchema };
