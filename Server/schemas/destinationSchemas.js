const { z } = require("zod");

// Schema for creating a new destination
const createDestinationSchema = z.object({
  alias: z.string().max(255).optional(),
  url: z.string().url("Invalid URL format").optional(),
  apikey: z.string().max(255).optional(),
  isactive: z.boolean().default(true),
  isdeleted: z.boolean().default(false),
  applicationid: z.number().int(),
  createdby: z.number().int(),
  updatedby: z.number().int().optional(),
});

// Schema for updating an existing destination
const updateDestinationSchema = z.object({
  alias: z.string().max(255).optional(),
  url: z.string().url("Invalid URL format").optional(),
  apikey: z.string().max(255).optional(),
  isactive: z.boolean().optional(),
  isdeleted: z.boolean().optional(),
  updatedby: z.number().int().optional(),
});

module.exports = {
  createDestinationSchema,
  updateDestinationSchema,
};
