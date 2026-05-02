const path = require("path");
const express = require("express");
const cors = require("cors");
const {
  db,
  cancellationPolicy,
  dynamicPricing,
  recommendations,
  tickFlightStatuses
} = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "travelmate-api" });
});

app.get("/api/bootstrap", (_req, res) => {
  res.json({
    user: db.user,
    bookings: db.bookings,
    flights: db.flights,
    reviews: db.reviews,
    selections: db.selections,
    pricing: dynamicPricing(),
    priceHistory: db.priceHistory,
    recommendations: recommendations(),
    notifications: db.notifications,
    freezes: db.freezes
  });
});

app.get("/api/flights/status", (_req, res) => {
  res.json({ flights: db.flights, notifications: db.notifications, pricing: dynamicPricing() });
});

app.post("/api/bookings/:id/cancel", (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (!req.body.reason) return res.status(400).json({ error: "Cancellation reason is required" });

  const policy = cancellationPolicy(booking);
  booking.status = "cancelled";
  booking.cancelReason = req.body.reason;
  booking.refundStatus = {
    id: `RF-${Date.now().toString().slice(-6)}`,
    status: "pending",
    amount: Math.round((booking.amount * policy.percent) / 100),
    percent: policy.percent,
    policy: policy.label,
    timeline: policy.timeline,
    updatedAt: new Date().toISOString()
  };

  res.json({ booking });
});

app.post("/api/reviews", (req, res) => {
  const review = {
    id: `REV-${Date.now().toString().slice(-5)}`,
    targetType: req.body.targetType || "hotel",
    target: req.body.target || "Azure Palm Resort, Bali",
    author: db.user.name,
    rating: Number(req.body.rating || 5),
    text: req.body.text || "",
    photos: req.body.photo ? [req.body.photo] : [],
    helpful: 0,
    createdAt: new Date().toISOString(),
    flagged: false,
    replies: []
  };
  db.reviews.unshift(review);
  res.status(201).json({ review });
});

app.post("/api/reviews/:id/reply", (req, res) => {
  const review = db.reviews.find((item) => item.id === req.params.id);
  if (!review) return res.status(404).json({ error: "Review not found" });
  review.replies.push({ author: db.user.name, text: req.body.text || "", createdAt: new Date().toISOString() });
  res.json({ review });
});

app.post("/api/reviews/:id/flag", (req, res) => {
  const review = db.reviews.find((item) => item.id === req.params.id);
  if (!review) return res.status(404).json({ error: "Review not found" });
  review.flagged = true;
  res.json({ review, moderationStatus: "queued" });
});

app.post("/api/preferences", (req, res) => {
  db.user.preferences = { ...db.user.preferences, ...req.body };
  res.json({ preferences: db.user.preferences });
});

app.post("/api/pricing/freeze", (_req, res) => {
  const pricing = dynamicPricing();
  const freeze = {
    id: `PF-${Date.now().toString().slice(-6)}`,
    price: pricing.price,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  };
  db.freezes.unshift(freeze);
  res.status(201).json({ freeze });
});

app.post("/api/recommendations/:id/feedback", (req, res) => {
  res.json({ saved: true, recommendationId: req.params.id, sentiment: req.body.sentiment || "helpful" });
});

setInterval(tickFlightStatuses, 18000);

const distDir = path.join(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`TravelMate API running at http://localhost:${PORT}`);
});
