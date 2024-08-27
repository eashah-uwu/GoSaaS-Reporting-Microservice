const { z } = require("zod");

const applicationSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must be at most 25 characters") 
    .regex(/^[^\d]/, "Name cannot start with a number"), 
  description: z.string()
    .min(5, "Description must be at least 5 characters")
    .max(100, "Description must be at most 100 characters")
    .regex(/^[^\d]/, "Description cannot start with a number"),
  isactive: z.boolean().default(true),
  isdeleted: z.boolean().default(false),
});

//validate query parameters(optional)
module.exports = applicationSchema;
