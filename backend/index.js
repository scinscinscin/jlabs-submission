require("dotenv/config");
const express = require("express");
const z = require("zod");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const { drizzle } = require("drizzle-orm/node-postgres");
const crs = import("crypto-random-string");
const jwt = require("jsonwebtoken");
const { pbkdf2 } = require("pbkdf2");
const { usersTable } = require("./schema");
const { eq } = require("drizzle-orm");

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;
const db = drizzle(process.env.DATABASE_CONNECTION_STRING);
const AUTH_COOKIE_NAME = "jlabs-auth";

app.use(cors({ credentials: true, origin: FRONTEND_URL }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const loginValdiator = z.object({
  email: z.string().email(),
  password: z.string(),
});

// check if the user is logged in
app.get("/user/me", async (req, res) => {
  const authCookie = req.cookies[AUTH_COOKIE_NAME];
  if (authCookie == null) return res.json({ status: false });
  return res.json({ status: true });
});

const createSalt = async () => (await crs).default({ length: 64 });
const createHash = (password, salt) =>
  new Promise((resolve, reject) => {
    pbkdf2(password, salt, 10000, 64, "sha512", (err, hash) => {
      if (err) return reject(err);
      resolve(hash.toString("utf8"));
    });
  });

app.post("/user/register", async (req, res) => {
  const details = await loginValdiator.parseAsync(req.body);
  const salt = await createSalt();
  const hash = await createHash(details.password, salt);

  try {
    const [newUser] = await db
      .insert(usersTable)
      .values({ email: details.email, hashedPassword: hash, salt })
      .returning();

    console.log("Created new user: ", newUser.email);
    return res.json({ success: true });
  } catch (err) {
    console.log("Error while creating user: ", err);
    return res.json({ success: false });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const details = await loginValdiator.parseAsync(req.body);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, details.email));
    if (!user) return res.json({ success: false });

    const createdHash = await createHash(details.password, user.salt);
    if (user.hashedPassword !== createdHash) return res.json({ success: false });

    const token = jwt.sign({ email: details.email }, process.env.JWT_SECRET);
    res.cookie(AUTH_COOKIE_NAME, token);
    return res.json({ success: true });
  } catch (err) {
    console.log("Error while logging in: ", err);
    return res.json({ success: false });
  }
});

app.get("/", (req, res) => {
  res.json({ status: true, message: "API is working" });
});

app.listen(3001, () => {
  console.log("Server started on port 3001");
});

app.use((err, req, res, next) => {
  console.error("An error has occured: ", err);
  res.status(500).send({ status: false, message: "An error has occured" });
});
