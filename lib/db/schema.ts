import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const ACTIVITY_TYPES = ["call", "email", "meeting"] as const

export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export const leadStatusEnum = pgEnum("lead_status", LEAD_STATUSES)
export const activityTypeEnum = pgEnum("activity_type", ACTIVITY_TYPES)

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("users_email_unique_idx").on(t.email),
])

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("projects_user_id_idx").on(t.userId),
])

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  source: text("source"),
  status: leadStatusEnum("status").notNull().default("new"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("leads_user_id_idx").on(t.userId),
  index("leads_user_id_status_idx").on(t.userId, t.status),
  index("leads_user_id_project_id_idx").on(t.userId, t.projectId),
])

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
}, (t) => [
  index("tags_user_id_idx").on(t.userId),
  uniqueIndex("tags_user_id_name_unique_idx").on(t.userId, t.name),
])

export const leadTags = pgTable("lead_tags", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.leadId, t.tagId] }),
  index("lead_tags_user_id_idx").on(t.userId),
  index("lead_tags_tag_id_idx").on(t.tagId),
])

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("customers_user_id_idx").on(t.userId),
  uniqueIndex("customers_lead_id_unique_idx").on(t.leadId),
])

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("notes_user_id_idx").on(t.userId),
  index("notes_user_id_lead_id_idx").on(t.userId, t.leadId),
])

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  type: activityTypeEnum("type").notNull(),
  summary: text("summary").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("activities_user_id_idx").on(t.userId),
  index("activities_user_id_lead_id_idx").on(t.userId, t.leadId),
])

export const reminders = pgTable("reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  done: boolean("done").notNull().default(false),
}, (t) => [
  index("reminders_user_id_idx").on(t.userId),
  index("reminders_user_id_lead_id_idx").on(t.userId, t.leadId),
  index("reminders_user_id_done_due_at_idx").on(t.userId, t.done, t.dueAt),
])

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  leads: many(leads),
  tags: many(tags),
  leadTags: many(leadTags),
  customers: many(customers),
  notes: many(notes),
  activities: many(activities),
  reminders: many(reminders),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  leads: many(leads),
}))

export const leadsRelations = relations(leads, ({ one, many }) => ({
  user: one(users, { fields: [leads.userId], references: [users.id] }),
  project: one(projects, { fields: [leads.projectId], references: [projects.id] }),
  leadTags: many(leadTags),
  notes: many(notes),
  activities: many(activities),
  reminders: many(reminders),
  customer: one(customers, { fields: [leads.id], references: [customers.leadId] }),
}))

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  leadTags: many(leadTags),
}))

export const leadTagsRelations = relations(leadTags, ({ one }) => ({
  user: one(users, { fields: [leadTags.userId], references: [users.id] }),
  lead: one(leads, { fields: [leadTags.leadId], references: [leads.id] }),
  tag: one(tags, { fields: [leadTags.tagId], references: [tags.id] }),
}))

export const customersRelations = relations(customers, ({ one }) => ({
  user: one(users, { fields: [customers.userId], references: [users.id] }),
  lead: one(leads, { fields: [customers.leadId], references: [leads.id] }),
}))

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  lead: one(leads, { fields: [notes.leadId], references: [leads.id] }),
}))

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
  lead: one(leads, { fields: [activities.leadId], references: [leads.id] }),
}))

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, { fields: [reminders.userId], references: [users.id] }),
  lead: one(leads, { fields: [reminders.leadId], references: [leads.id] }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type LeadTag = typeof leadTags.$inferSelect
export type NewLeadTag = typeof leadTags.$inferInsert

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert

export type Reminder = typeof reminders.$inferSelect
export type NewReminder = typeof reminders.$inferInsert
