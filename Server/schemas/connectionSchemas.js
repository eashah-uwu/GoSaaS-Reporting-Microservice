const { z } = require("zod");

const connectionSchema = z.object({
  alias: z.string().max(255).optional(),
  host: z.string().max(255).optional(),
  port: z.number().int().optional(),
  username: z.string().max(255).optional(),
  database: z.string().max(255).optional(),
  type: z.string().max(50).optional(),
  isactive: z.boolean().default(true),
  isdeleted: z.boolean().default(false),
  password: z.string().max(255).optional(),
  applicationid: z.number().int(),
  createdby: z.number().int().optional(),
  updatedby: z.number().int().optional(),
});

module.exports = connectionSchema;
