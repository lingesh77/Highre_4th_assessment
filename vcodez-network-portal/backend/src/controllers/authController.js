import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  createPasswordResetToken,
  consumePasswordResetToken,
  sanitize,
} from "../models/userModel.js";
import { signToken } from "../middleware/auth.js";
import { sendEmail } from "../config/mailer.js";
import { accountCreatedTemplate, passwordResetTemplate } from "../utils/emailTemplates.js";

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await createUser({ name, email, password });
    const token = signToken(user);

    sendEmail({
      to: user.email,
      subject: "Welcome to Highre Software Network Portal",
      html: accountCreatedTemplate({ name: user.name }),
    }).catch((e) => console.error("[email] account-created send failed:", e.message));

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    res.json({ user: sanitize(user), token });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const result = await createPasswordResetToken(email);

    // Always respond success (don't leak whether an email exists)
    if (result) {
      const { token, user } = result;
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
      sendEmail({
        to: user.email,
        subject: "Reset your Highre Software Network Portal password",
        html: passwordResetTemplate({ name: user.name, resetUrl }),
      }).catch((e) => console.error("[email] reset send failed:", e.message));
    }

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const userId = await consumePasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    await updateUserPassword(userId, password);
    res.json({ message: "Password updated successfully. You can now sign in." });
  } catch (err) {
    next(err);
  }
}
