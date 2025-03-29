import { z } from "zod";

const createFileSchema = z.object({
  fieldname: z.string().min(1, "Field name is required."),
  originalname: z.string().min(1, "Original name is required."),
  encoding: z.string().min(1, "Encoding type is required."),
  mimetype: z.string().regex(/^.+\/.+$/, "Invalid MIME type format."),
  filename: z.string().min(1, "Filename is required."),
  path: z.string().min(1, "File path is required."),
  size: z.number().positive("File size must be greater than zero."),
});

export { createFileSchema };
