import express from "express";
import { BlogRoutes } from "./blog.js";
import { AuthRoutes } from "./user.js";

export const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/blog",
    route: BlogRoutes,
  },
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})
