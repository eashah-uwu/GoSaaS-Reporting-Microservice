const { z } = require("zod");

const querySchema = z.object({
  query: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  pageSize: z.string().regex(/^\d+$/).transform(Number).optional(),
  filters: z.record(z.string(), z.string()).optional(),  // Allows any filter with string key-value pairs
  sortField: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

module.exports = querySchema;
