import bcrypt from "bcrypt";
import sanitize from "mongo-sanitize";
import { tryCatch } from "../middlewares/trycatch.js";
import { loginZodSchema, registerZodSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import { User } from "../model/user.js";
import crypto from "crypto";
import sendEmail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import generateToken, {
  generateAccessTokenUsingRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../config/generateToken.js";
import { generateCSRFToken } from "../config/csrfMiddleware.js";

export const registerUser = tryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body); // prevent NoSQL injection operation
  const validateBody = registerZodSchema.safeParse(sanitizedBody); // Zod validation

  // safeParse returns { success: true, data } or { success: false, error }.

  // console.log(validateBody); this console.log error result is below
  //   {
  //   success: false,
  //   error: ZodError: [
  //     {
  //       "origin": "string",
  //       "code": "too_small",
  //       "minimum": 8,
  //       "inclusive": true,
  //       "path": [
  //         "password"
  //       ],
  //       "message": "Password have to be at least 8 char long"
  //     }
  //   ]
  // }

  if (!validateBody.success) {
    const zodError = validateBody.error;
    // console.log(zodError); this console.log error result is below
    // ZodError: [
    //   {
    //     "origin": "string",
    //     "code": "too_small",
    //     "minimum": 8,
    //     "inclusive": true,
    //     "path": [
    //       "password"
    //     ],
    //     "message": "Password have to be at least 8 char long"
    //   }
    // ]

    // console.log(zodError.issues); this console.log error result is below. its an array
    // [
    //   {
    //     origin: 'string',
    //     code: 'too_small',
    //     minimum: 8,
    //     inclusive: true,
    //     path: [ 'password' ],
    //     message: 'Password have to be at least 8 char long'
    //   }
    // ]
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

  const { name, email, password } = validateBody.data;

  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many request",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      message: "User already exist",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const token = crypto.randomBytes(32).toString("hex");
  const verifyKey = `verify:${token}`;

  const dataToStore = JSON.stringify({
    name,
    email,
    password: hashedPassword,
  });

  await redisClient.set(verifyKey, dataToStore, { EX: 300 });

  const subject = "Verify your email for registration";
  const html = getVerifyEmailHtml({ email, token });

  await sendEmail({ email, subject, html });
  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.json({
    message:
      "If your email is valid, a verification link has been sent. It will expire in 5 minutes",
  });
});

export const verifyUser = tryCatch(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ message: "Verification Token is required" });
  }

  const verifyKey = `verify:${token}`;

  const userDataJSON = await redisClient.get(verifyKey);
  if (!userDataJSON) {
    return res.status(400).json({ message: "Verification link is expired" });
  }

  await redisClient.del(verifyKey);

  const userData = JSON.parse(userDataJSON);

  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return res.status(400).json({
      message: "User already exist",
    });
  }

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  res.status(201).json({
    message: "Email verified successfully. Your account has been created",
    user: { id: newUser._id, email: newUser.email, name: newUser.name },
  });
});

export const loginUser = tryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validateBody = loginZodSchema.safeParse(sanitizedBody);

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

  const { email, password } = validateBody.data;

  const rateLimitKey = `login-rate-limit:${req.ip}:${req.email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many login attempt. Try again later",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid crediential" });
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return res.status(400).json({ message: "Invalid credential" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, JSON.stringify(otp), { EX: 300 });

  const subject = "OTP for verification";
  const html = getOtpHtml({ email, otp });

  await sendEmail({ email, subject, html });
  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.status(201).json({
    message:
      "If your mail is valid, otp has been sent to your email. It will valid only for 5 min.",
  });
});

export const verifyOTP = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Please provide all details" });
  }

  const otpKey = `otp:${email}`;
  const storedOtpJson = await redisClient.get(otpKey);

  if (!storedOtpJson) {
    return res.status(400).json({ message: "OTP is expired" });
  }

  const storedOtp = JSON.parse(storedOtpJson);
  if (storedOtp !== otp) {
    return res.status(400).json({ message: "OTP is not valid" });
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });

  const tokenData = await generateToken(user._id, res);

  res.status(201).json({ message: `welcome ${user.name}`, user });
});

export const myProfile = tryCatch(async (req, res) => {
  const user = req.user;
  res.json(user);
});

export const refreshToken = tryCatch(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const decode = await verifyRefreshToken(refreshToken);
  if (!decode) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  generateAccessTokenUsingRefreshToken(decode.id, res);

  res.status(200).json({ message: "Token refreshed" });
});

export const logoutUser = tryCatch(async (req, res) => {
  const userId = req.user._id;

  await revokeRefreshToken(userId);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.clearCookie("csrfToken");

  await redisClient.del(`user:${userId}`);

  res.status(201).json({ message: "Logged out successfully" });
});

export const refreshCSRF = tryCatch(async (req, res) => {
  const userId = req.user._id;

  const newCsrfToken = await generateCSRFToken(userId, res);

  res
    .status(201)
    .json({
      message: "Csrf token refreshed successfully",
      csrfToken: newCsrfToken,
    });
});


export const adminController = tryCatch(async (req,res) => {
  res.json({message: "Hello Admin"})
})
