const { z } = require("zod");

const applicationSchema = z.object({
  name: z.string().max(255),
  description: z.string().optional(),
  isactive: z.boolean().default(true),
  userid: z.number().int(),
  createdby: z.number().int().optional(),
  updatedby: z.number().int().optional(),
  isdeleted: z.boolean().default(false),
});

module.exports = applicationSchema;
