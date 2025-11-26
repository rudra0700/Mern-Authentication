import { blogZodSchema } from "../config/zod.js";
import { tryCatch } from "../middlewares/tryCatch.js";
import sanitize from "mongo-sanitize";
import { Blog } from "../model/blog.js";

export const createBlog = tryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validateBody = blogZodSchema.safeParse(sanitizedBody);

  if (!validateBody.success) {
    const zodError = validateBody.error;

    let firstErrorMessage = "Validation Failed";
    let allErrorMessage = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrorMessage = zodError.issues.map((issue) => ({
        field: issue?.path ? issue.path.join(".") : "Unknown",
        message: issue?.message || "Validation Error",
        code: issue?.code,
      }));

      firstErrorMessage = allErrorMessage[0]?.message || "Validation Error";
    }

    return res
      .status(400)
      .json({ message: firstErrorMessage, error: allErrorMessage });
  }

  const { title, description } = validateBody.data;

  const data = await Blog.create({title, description});
  res.status(201).json({message: "Blog created successfully", data})
});


export const readBlog = tryCatch(async (req, res) => {
  const data = await Blog.find({});
  res.status(201).json({message: "Blog retrieved successfully", data})
});
