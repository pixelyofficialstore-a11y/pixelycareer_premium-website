import { boolean, index, integer, jsonb, numeric, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Every website table lives in the `website` schema. `public` belongs to the CRM: never touch it. */
export const website = pgSchema("website");

const base = () => ({
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  market: text("market"),
  country: text("country"),
  utmSource: text("utm_source"), utmMedium: text("utm_medium"), utmCampaign: text("utm_campaign"), utmContent: text("utm_content"), utmTerm: text("utm_term"),
  fbclid: text("fbclid"), gclid: text("gclid"), fbp: text("fbp"), fbc: text("fbc"),
  landingPage: text("landing_page"), referrer: text("referrer"), clientIp: text("client_ip"), userAgent: text("user_agent"),
  assignedTo: text("assigned_to"),
  internalNotes: text("internal_notes"),
});

export const orderStatus = website.enum("order_status", ["cart", "abandoned", "new", "payment_submitted", "paid", "in_progress", "delivered", "refunded", "cancelled"]);
export const callStatus = website.enum("call_status", ["requested", "confirmed", "completed", "no_show", "cancelled"]);
export const reviewStatus = website.enum("cv_review_status", ["new", "in_review", "sent", "converted"]);
export const partnerStatus = website.enum("partner_status", ["new", "contacted", "trial", "active", "lost"]);

export type AddonLine = { id: string; name: string; qty: number; price: number };

export const orders = website.table("orders", {
  ...base(),
  status: orderStatus("status").notNull().default("cart"),
  package: text("package").notNull(),
  packagePrice: integer("package_price").notNull(),
  addons: jsonb("addons").$type<AddonLine[]>().notNull().default([]),
  sameDay: boolean("same_day").notNull().default(false),
  offer: text("offer"),
  isBundle: boolean("is_bundle").notNull().default(false),
  payChoice: text("pay_choice"),
  discount: integer("discount").notNull().default(0),
  subtotal: integer("subtotal").notNull(),
  total: integer("total").notNull(),
  currency: text("currency").notNull(),
  name: text("name"), whatsapp: text("whatsapp"), email: text("email"),
  targetCountry: text("target_country"), targetCountries: text("target_countries").array(), targetRole: text("target_role"), notes: text("notes"),
  cvUrl: text("cv_url"), cvPublicId: text("cv_public_id"),
  paymentMethod: text("payment_method"), paymentScreenshotUrl: text("payment_screenshot_url"), paymentScreenshotPublicId: text("payment_screenshot_public_id"), transactionId: text("transaction_id"),
  stepReached: integer("step_reached").notNull().default(1),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
  eventId: text("event_id"),
  leadEventId: text("lead_event_id"), eventSourceUrl: text("event_source_url"),
  payAmountType: text("pay_amount_type"), amountPaidNow: integer("amount_paid_now"), balanceDue: integer("balance_due"),
  campaignId: text("campaign_id"), adsetId: text("adset_id"), adId: text("ad_id"), campaignName: text("campaign_name"), adsetName: text("adset_name"), adName: text("ad_name"),
  lastTouch: jsonb("last_touch").$type<Record<string, string>>(), externalId: text("external_id"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
}, (t) => [index("orders_status_idx").on(t.status), index("orders_created_at_idx").on(t.createdAt), index("orders_whatsapp_idx").on(t.whatsapp)]).enableRLS();

export const calls = website.table("calls", {
  ...base(),
  status: callStatus("status").notNull().default("requested"),
  name: text("name").notNull(), whatsapp: text("whatsapp").notNull(), email: text("email"),
  preferredDate: text("preferred_date"), preferredTime: text("preferred_time"), timezone: text("timezone"),
  targetRole: text("target_role"), notes: text("notes"),
}, (t) => [index("calls_status_idx").on(t.status), index("calls_created_at_idx").on(t.createdAt), index("calls_whatsapp_idx").on(t.whatsapp)]).enableRLS();

export const cvReviews = website.table("cv_reviews", {
  ...base(),
  campaignId: text("campaign_id"), adsetId: text("adset_id"), adId: text("ad_id"), campaignName: text("campaign_name"), adsetName: text("adset_name"), adName: text("ad_name"),
  lastTouch: jsonb("last_touch").$type<Record<string, string>>(), externalId: text("external_id"),
  leadEventId: text("lead_event_id"),
  status: reviewStatus("status").notNull().default("new"),
  name: text("name").notNull(), whatsapp: text("whatsapp").notNull(), email: text("email"),
  targetRole: text("target_role"), targetCountry: text("target_country"), targetCountries: text("target_countries").array(),
  cvUrl: text("cv_url"), cvPublicId: text("cv_public_id"), cvFilename: text("cv_filename"), notes: text("notes"),
}, (t) => [index("cv_reviews_status_idx").on(t.status), index("cv_reviews_created_at_idx").on(t.createdAt), index("cv_reviews_whatsapp_idx").on(t.whatsapp)]).enableRLS();

export const partners = website.table("partners", {
  ...base(),
  campaignId: text("campaign_id"), adsetId: text("adset_id"), adId: text("ad_id"), campaignName: text("campaign_name"), adsetName: text("adset_name"), adName: text("ad_name"),
  lastTouch: jsonb("last_touch").$type<Record<string, string>>(), externalId: text("external_id"),
  leadEventId: text("lead_event_id"),
  status: partnerStatus("status").notNull().default("new"),
  orgName: text("org_name").notNull(), orgType: text("org_type"), contactName: text("contact_name").notNull(), designation: text("designation"),
  whatsapp: text("whatsapp").notNull(), email: text("email"), countryHq: text("country_hq"), destinations: text("destinations"),
  monthlyVolume: text("monthly_volume"), model: text("model"), notes: text("notes"),
}, (t) => [index("partners_status_idx").on(t.status), index("partners_created_at_idx").on(t.createdAt), index("partners_whatsapp_idx").on(t.whatsapp)]).enableRLS();

export const events = website.table("events", {
  ...base(),
  status: text("status").notNull().default("recorded"),
  sessionId: text("session_id"),
  orderId: uuid("order_id"),
  name: text("name").notNull(),
  value: numeric("value"),
  currency: text("currency"),
  page: text("page"),
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
}, (t) => [index("events_status_idx").on(t.status), index("events_created_at_idx").on(t.createdAt), index("events_name_idx").on(t.name)]).enableRLS();
