const { z } = require("zod");

// Schema for creating a new destination
const createDestinationSchema = z.object({
  alias: z.string().max(255).optional(),
  url: z.string().url("Invalid URL format").optional(),
  apiKey: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  applicationID: z.number().int(),
  createdBy: z.number().int(),
  updatedBy: z.number().int().optional(),
});

// Schema for updating an existing destination
const updateDestinationSchema = z.object({
  alias: z.string().max(255).optional(),
  url: z.string().url("Invalid URL format").optional(),
  apiKey: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  updatedBy: z.number().int().optional(),
});

module.exports = {
  createDestinationSchema,
  updateDestinationSchema,
};
