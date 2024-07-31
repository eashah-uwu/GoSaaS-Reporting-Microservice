const { z } = require("zod");

const applicationSchema = z.object({
  name: z.string().max(255),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  userID: z.number().int(),
  createdBy: z.number().int().optional(),
  updatedBy: z.number().int().optional(),
  isDeleted: z.boolean().default(false),
});

module.exports = applicationSchema;
