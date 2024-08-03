const { z } = require("zod");

const connectionSchema = z.object({
  alias: z.string().max(255).optional(),
  host: z.string().max(255).optional(),
  port: z.number().int().optional(),
  database: z.string().max(255).optional(),
  type: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  password: z.string().max(255).optional(),
  applicationID: z.number().int(),
  createdBy: z.number().int().optional(),
  updatedBy: z.number().int().optional(),
});

module.exports = connectionSchema;
