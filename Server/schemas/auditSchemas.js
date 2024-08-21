const { z } = require("zod");

const createAuditTrailSchema = z.object({
  userId: z.number().optional(),
  createdBy: z.string().nonempty("CreatedBy is required"),
  description: z.string().optional(),
  module: z.string().nonempty("Module is required"),
  event: z.string().nonempty("Event is required"),
});

module.exports = {
  createAuditTrailSchema,
};
