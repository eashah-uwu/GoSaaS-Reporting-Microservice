const { z } = require("zod");

// Schema for creating a new destination
const createDestinationSchema = z.object({
  alias: z.string().min(3, "Alias must be atleast 3 characters").max(25, "Alias should not exceed 25 characters").regex(/^[^\d]/, "Alias cannot start with a number"),
  url: z.string().url("Invalid URL format").min(3, "Url must be atleast 3 characters").max(100, "Url should not exceed 100 characters"),
  apikey: z.string().min(3, "Api Key must be atleast 3 characters").max(100, "Api Key should not exceed 100 characters"),
  bucketName: z.string().min(2, "BucketName must be atleast 2 characters").max(25, "Bucket Name should not exceed 25 characters"),
  destination: z.string().min(3, "Destination must be atleast 3 characters").max(25, "Destination should not exceed 25 characters"),
  isactive: z.boolean().default(true),
  isdeleted: z.boolean().default(false),
  applicationid: z.number().int(),
});

// Schema for updating an existing destination
const updateDestinationSchema = z.object({
  alias: z.string().max(255).optional(),
  url: z.string().optional(),
  apikey: z.string().max(255).optional(),
  bucketName: z.string().max(255).optional(),
  isactive: z.boolean().optional(),
  isdeleted: z.boolean().optional()
});

module.exports = {
  createDestinationSchema,
  updateDestinationSchema,
};
