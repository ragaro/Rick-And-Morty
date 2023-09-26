import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

export default function loginHandler(req, res) {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin") {
    // expire in 30 days
    const token = sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
        username: username,
      },
      process.env.JWT_SECRET
    );

    const serialized = serialize(process.env.TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: "/",
    });

    res.setHeader("Set-Cookie", serialized);
    return res.status(200).json({
      message: "Login successful",
    });
  }

  return res.status(401).json({ error: "Invalid credentials" });
}