// Admin authentication: bcrypt for the stored password, a signed JWT for the
// session. No sign-up route — admins are created by the seed or by another
// admin from inside the panel.

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { config } from "./env.js";

export function findAdminByEmail(email) {
  return db.prepare("SELECT * FROM admins WHERE email = ?").get(String(email).toLowerCase().trim());
}

export function findAdminById(id) {
  return db.prepare("SELECT * FROM admins WHERE id = ?").get(id);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(String(plain), hash);
}

export function hashPassword(plain) {
  return bcrypt.hashSync(String(plain), 12);
}

export function issueToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, v: admin.token_version ?? 0 },
    config.jwtSecret,
    { expiresIn: `${config.sessionHours}h` },
  );
}

/** The public shape of an admin — never includes the password hash. */
export function publicAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    createdAt: admin.created_at,
    lastLoginAt: admin.last_login_at,
  };
}

/**
 * Gate for everything under /api/admin.
 *
 * The account is re-read from the database on every request rather than
 * trusted from the token, so deleting an admin — or changing their password —
 * takes effect immediately instead of when their token happens to expire.
 */
export function requireAdmin(req, res, next) {
  const header = req.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return res.status(401).json({ error: "Sign in to continue." });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: "Your session has expired. Sign in again." });
  }

  const admin = findAdminById(payload.sub);
  if (!admin) {
    return res.status(401).json({ error: "That account no longer exists." });
  }
  if ((payload.v ?? 0) !== admin.token_version) {
    return res
      .status(401)
      .json({ error: "The password for this account changed. Sign in again." });
  }

  req.admin = admin;
  next();
}
