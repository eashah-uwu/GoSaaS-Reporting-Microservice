const { z } = require("zod");

const querySchema = z.object({
  query: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  pageSize: z.string().regex(/^\d+$/).transform(Number).optional(),
  filters: z
    .object({
      name: z.string().optional(),
      status: z.enum(["active", "inactive", "delete"]).optional(),
      sortField: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
});

module.exports = querySchema;
