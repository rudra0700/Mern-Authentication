import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import { generateCSRFToken, revokeCSRFToken } from "./csrfMiddleware.js";

const generateToken = async (id, res) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenKey = `refresh-token-key:${id}`;

  
  await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const csrfToken = await generateCSRFToken(id, res);

  return { accessToken, refreshToken, csrfToken };
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await redisClient.get(`refresh-token-key:${decode.id}`);

    if (storedToken === refreshToken) {
      return decode;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const generateAccessTokenUsingRefreshToken = (id, res) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });
};

export const revokeRefreshToken = async (userId) => {
  await redisClient.del(`refresh-token-key:${userId}`);
  await revokeCSRFToken(userId)
};

export default generateToken;
