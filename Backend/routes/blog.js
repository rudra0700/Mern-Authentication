import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createBlog, readBlog } from "../controllers/blog.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";

const router = express.Router();

router.post("/createBlog", isAuth, verifyCSRFToken, createBlog);
router.get("/readBlog", readBlog);

export const BlogRoutes = router;