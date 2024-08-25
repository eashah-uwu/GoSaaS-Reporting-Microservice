const { z } = require("zod");

const connectionSchema = z.object({
  alias: z.string().min(3, "Alias must be at least 3 characters").max(25, "Alias must be at most 25 characters").regex(/^[^\d]/, "Alias cannot start with a number"),
  host: z.string().min(3, "Host must be atleast 3 characters").max(25, "Host should not exceed 25 characters"),
  port: z.number().int(),
  username: z.string().min(3, "Username must be atleast 3 characters").max(50, "Username should not exceed 50 characters").regex(/^[^\d]/, "Username cannot start with a number"),
  database: z.string().min(3, "Database name must be atleast 3 characters").max(50, "Database name should not exceed 50 characters").regex(/^[^\d]/, "Database name cannot start with a number"),
  type: z.string().min(3, "Type must be atleast 3 characters").max(50, "Type should not exceed 50 characters"),
  isactive: z.boolean().default(true),
  isdeleted: z.boolean().default(false),
  password: z.string().min(5, "Password should be at least 5 characters").max(50, "Password should not exceed 50 characters"),
  applicationid: z.number().int(),
  schema: z.string().min(3, "Schema Name must be atleast 3 characters").max(50, "Schema Name should not exceed 50 characters").regex(/^[^\d]/, "Schema name cannot start with a number"), 
});

module.exports = connectionSchema;
