import { Router } from "express";
import { col, now } from "../db.js";
import {
  findAdminByEmail,
  hashPassword,
  issueToken,
  publicAdmin,
  requireAdmin,
  verifyPassword,
} from "../auth.js";

export const authRouter = Router();

/**
 * POST /api/auth/login
 *
 * The failure message never says whether it was the email or the password
 * that was wrong — that difference tells someone probing the panel which
 * addresses are real accounts.
 */
authRouter.post("/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ error: "Enter your email and password." });
  }

  const admin = await findAdminByEmail(email);
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return res.status(401).json({ error: "That email and password do not match." });
  }

  const updated = await col("admins").findOneAndUpdate(
    { id: admin.id },
    { $set: { last_login_at: now() } },
    { returnDocument: "after" },
  );

  res.json({ token: issueToken(updated), admin: publicAdmin(updated) });
});

/** GET /api/auth/me — used on load to tell a valid session from a stale one. */
authRouter.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: publicAdmin(req.admin) });
});

/** POST /api/auth/password — change your own password. */
authRouter.post("/password", requireAdmin, async (req, res) => {
  const current = String(req.body?.current ?? "");
  const next = String(req.body?.next ?? "");

  if (!verifyPassword(current, req.admin.password_hash)) {
    return res
      .status(422)
      .json({ error: "That is not your current password.", fields: { current: "Wrong password." } });
  }
  if (next.length < 8) {
    return res.status(422).json({
      error: "Pick a longer password.",
      fields: { next: "Use at least 8 characters." },
    });
  }

  // Bumping the token version is what actually signs the old sessions out:
  // `requireAdmin` compares the version in the token against this column.
  const updated = await col("admins").findOneAndUpdate(
    { id: req.admin.id },
    { $set: { password_hash: hashPassword(next) }, $inc: { token_version: 1 } },
    { returnDocument: "after" },
  );

  res.json({ ok: true, token: issueToken(updated) });
});
