import jwt from "jsonwebtoken";
import { User } from "../model/user.js";
import { redisClient } from "../index.js";


export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(403).json({ message: "Please login - No Token" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (!decodedToken) {
      return res.status(400).json({ message: "Token Expired" });
    }

    const cachedUser = await redisClient.get(`user:${decodedToken.id}`);

    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      return next();
    }

    const user = await User.findById(decodedToken.id).select("-password");
    if (!user) {
      return res.status(400).json({ message: "No user with this id" });
    }

    await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));

    req.user = user;
    return next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authorizedAdmin = (req, res, next) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res
      .status(401)
      .json({ message: "You are not allowed to this activity" });
  }

  next()
};
