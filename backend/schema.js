const { integer, pgTable, varchar } = require("drizzle-orm/pg-core");

const usersTable = pgTable("jlabs-users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  hashedPassword: varchar({ length: 255 }).notNull(),
  salt: varchar({ length: 255 }).notNull(),
});

module.exports = {
  usersTable,
};
