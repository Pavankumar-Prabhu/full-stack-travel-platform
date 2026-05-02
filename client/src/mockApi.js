const nowPlusHours = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

function buildSeatMap() {
  const seats = [];
  const cols = ["A", "B", "C", "D", "E", "F"];
  for (let row = 1; row <= 18; row += 1) {
    cols.forEach((col) => {
      const id = `${row}${col}`;
      const premium = row <= 4 || col === "A" || col === "F";
      seats.push({
        id,
        row,
        col,
        premium,
        available: !["1A", "1B", "4F", "7C", "9D", "14A", "16E"].includes(id),
        price: premium ? 2400 : 650
      });
    });
  }
  return seats;
}

const mockDb = {
  user: {
    id: "usr_101",
    name: "Aarav Mehta",
    tier: "Platinum",
    preferences: {
      seat: "12A",
      roomType: "Ocean View Suite",
      themes: ["beach", "family", "premium economy"]
    }
  },
  bookings: [
    {
      id: "BK-48291",
      type: "flight",
      title: "Bengaluru to Dubai",
      provider: "IndiGo 6E-147",
      amount: 36000,
      reservationDate: nowPlusHours(18),
      status: "confirmed",
      refundStatus: null,
      selection: "12A",
      cancelReason: null
    },
    {
      id: "BK-49002",
      type: "hotel",
      title: "Azure Palm Resort, Bali",
      provider: "5 nights, breakfast included",
      amount: 68000,
      reservationDate: nowPlusHours(62),
      status: "confirmed",
      refundStatus: null,
      selection: "Ocean View Suite",
      cancelReason: null
    },
    {
      id: "BK-45117",
      type: "flight",
      title: "Mumbai to Singapore",
      provider: "Vistara UK-115",
      amount: 28500,
      reservationDate: nowPlusHours(-10),
      status: "completed",
      refundStatus: null,
      selection: "8C",
      cancelReason: null
    }
  ],
  flights: [
    {
      id: "FL-6E147",
      number: "6E 147",
      route: "BLR -> DXB",
      gate: "18B",
      terminal: "T2",
      status: "Boarding",
      delayMinutes: 0,
      reason: "Final security checks are complete.",
      departure: nowPlusHours(2),
      eta: nowPlusHours(6)
    },
    {
      id: "FL-UK115",
      number: "UK 115",
      route: "BOM -> SIN",
      gate: "11",
      terminal: "T2",
      status: "Delayed by 1h",
      delayMinutes: 60,
      reason: "Late inbound aircraft and runway congestion.",
      departure: nowPlusHours(4),
      eta: nowPlusHours(9)
    },
    {
      id: "FL-AI302",
      number: "AI 302",
      route: "DEL -> NRT",
      gate: "42A",
      terminal: "T3",
      status: "On Time",
      delayMinutes: 0,
      reason: "Scheduled operations running normally.",
      departure: nowPlusHours(8),
      eta: nowPlusHours(16)
    }
  ],
  reviews: [
    {
      id: "REV-1001",
      targetType: "hotel",
      target: "Azure Palm Resort, Bali",
      author: "Nisha Rao",
      rating: 5,
      text: "Clean rooms, quick beach access, and staff handled an early breakfast request without fuss.",
      photos: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=640&q=80"],
      helpful: 42,
      createdAt: "2026-04-28T09:00:00.000Z",
      flagged: false,
      replies: [{ author: "Azure Palm Team", text: "Thank you, Nisha. We are glad the early breakfast helped.", createdAt: "2026-04-28T12:10:00.000Z" }]
    },
    {
      id: "REV-1002",
      targetType: "flight",
      target: "IndiGo 6E-147",
      author: "Kabir S",
      rating: 4,
      text: "Boarding was organized and the crew was sharp. Seat pitch is okay for a medium-haul flight.",
      photos: ["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=640&q=80"],
      helpful: 26,
      createdAt: "2026-04-25T15:30:00.000Z",
      flagged: false,
      replies: []
    }
  ],
  selections: {
    seats: buildSeatMap(),
    rooms: [
      { id: "RM-201", type: "City King", price: 5200, available: true, premium: false, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80" },
      { id: "RM-305", type: "Garden Deluxe", price: 7400, available: true, premium: true, image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80" },
      { id: "RM-418", type: "Ocean View Suite", price: 11200, available: true, premium: true, image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80" },
      { id: "RM-501", type: "Family Club Room", price: 9800, available: false, premium: true, image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80" }
    ]
  },
  priceHistory: [
    { day: "Apr 25", price: 32800 },
    { day: "Apr 26", price: 33600 },
    { day: "Apr 27", price: 34200 },
    { day: "Apr 28", price: 33750 },
    { day: "Apr 29", price: 34900 },
    { day: "Apr 30", price: 36000 },
    { day: "May 01", price: 37200 }
  ],
  freezes: [],
  notifications: []
};

function pricing() {
  const base = 36000;
  const demandMultiplier = 1 + mockDb.flights.filter((flight) => flight.status !== "On Time").length * 0.04;
  const seasonalMultiplier = [0, 6].includes(new Date().getDay()) ? 1.2 : 1.08;
  const inventoryMultiplier = mockDb.selections.seats.filter((seat) => seat.available).length < 50 ? 1.12 : 1;
  return {
    base,
    price: Math.round(base * demandMultiplier * seasonalMultiplier * inventoryMultiplier),
    factors: [
      { label: "Demand", value: `${Math.round((demandMultiplier - 1) * 100)}%` },
      { label: "Season", value: `${Math.round((seasonalMultiplier - 1) * 100)}%` },
      { label: "Inventory", value: `${Math.round((inventoryMultiplier - 1) * 100)}%` }
    ]
  };
}

function recommendations() {
  return [
    {
      id: "REC-1",
      type: "destination",
      title: "Bali beach escape",
      subtitle: "Ocean resorts from Rs. 11,200/night",
      score: 96,
      why: "You frequently book beach destinations and saved an ocean-view room preference.",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "REC-2",
      type: "flight",
      title: "Dubai premium economy deal",
      subtitle: "Morning departures with aisle/window upgrades",
      score: 88,
      why: "Similar Platinum users who booked Bengaluru-Dubai selected premium economy seats.",
      image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "REC-3",
      type: "hotel",
      title: "Goa family club stay",
      subtitle: "Pool-facing rooms with breakfast",
      score: 82,
      why: "Your profile includes family travel and short-haul beach trips.",
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80"
    }
  ];
}

function cancellationPolicy(booking) {
  const hoursUntilReservation = (new Date(booking.reservationDate).getTime() - Date.now()) / 36e5;
  if (hoursUntilReservation >= 24) return { percent: 75, timeline: "3-5 business days", label: "Early cancellation refund" };
  if (hoursUntilReservation > 0) return { percent: 50, timeline: "5-7 business days", label: "Within 24 hours of reservation" };
  return { percent: 15, timeline: "7-10 business days", label: "Post reservation goodwill credit" };
}

function tickFlightStatuses() {
  const options = [
    { status: "On Time", delayMinutes: 0, reason: "Scheduled operations running normally." },
    { status: "Boarding", delayMinutes: 0, reason: "Boarding is active by zone." },
    { status: "Delayed by 1h", delayMinutes: 60, reason: "Air traffic flow control at destination." },
    { status: "Gate Changed", delayMinutes: 10, reason: "Operational gate reassignment." }
  ];
  const flight = mockDb.flights[Math.floor(Math.random() * mockDb.flights.length)];
  const next = options[Math.floor(Math.random() * options.length)];
  Object.assign(flight, next, {
    eta: new Date(new Date(flight.eta).getTime() + next.delayMinutes * 60 * 1000).toISOString()
  });
  mockDb.notifications.unshift({
    id: crypto.randomUUID(),
    title: `${flight.number} ${flight.status}`,
    body: `${flight.route}: ${flight.reason}`,
    createdAt: new Date().toISOString()
  });
  mockDb.notifications = mockDb.notifications.slice(0, 8);
}

export async function mockApi(path, options = {}) {
  const method = options.method || "GET";

  if (method === "GET" && path === "/api/bootstrap") {
    return {
      user: mockDb.user,
      bookings: mockDb.bookings,
      flights: mockDb.flights,
      reviews: mockDb.reviews,
      selections: mockDb.selections,
      pricing: pricing(),
      priceHistory: mockDb.priceHistory,
      recommendations: recommendations(),
      notifications: mockDb.notifications,
      freezes: mockDb.freezes
    };
  }

  if (method === "GET" && path === "/api/flights/status") {
    tickFlightStatuses();
    return { flights: mockDb.flights, notifications: mockDb.notifications, pricing: pricing() };
  }

  if (method === "POST" && path.match(/^\/api\/bookings\/[^/]+\/cancel$/)) {
    const body = JSON.parse(options.body || "{}");
    const bookingId = path.split("/")[3];
    const booking = mockDb.bookings.find((item) => item.id === bookingId);
    const policy = cancellationPolicy(booking);
    booking.status = "cancelled";
    booking.cancelReason = body.reason;
    booking.refundStatus = {
      id: `RF-${Date.now().toString().slice(-6)}`,
      status: "pending",
      amount: Math.round((booking.amount * policy.percent) / 100),
      percent: policy.percent,
      policy: policy.label,
      timeline: policy.timeline,
      updatedAt: new Date().toISOString()
    };
    return { booking };
  }

  if (method === "POST" && path === "/api/reviews") {
    const body = JSON.parse(options.body || "{}");
    const review = {
      id: `REV-${Date.now().toString().slice(-5)}`,
      targetType: body.targetType || "hotel",
      target: body.target,
      author: mockDb.user.name,
      rating: Number(body.rating || 5),
      text: body.text || "",
      photos: body.photo ? [body.photo] : [],
      helpful: 0,
      createdAt: new Date().toISOString(),
      flagged: false,
      replies: []
    };
    mockDb.reviews.unshift(review);
    return { review };
  }

  if (method === "POST" && path.match(/^\/api\/reviews\/[^/]+\/reply$/)) {
    const body = JSON.parse(options.body || "{}");
    const reviewId = path.split("/")[3];
    const review = mockDb.reviews.find((item) => item.id === reviewId);
    review.replies.push({ author: mockDb.user.name, text: body.text || "", createdAt: new Date().toISOString() });
    return { review };
  }

  if (method === "POST" && path.match(/^\/api\/reviews\/[^/]+\/flag$/)) {
    const reviewId = path.split("/")[3];
    const review = mockDb.reviews.find((item) => item.id === reviewId);
    review.flagged = true;
    return { review, moderationStatus: "queued" };
  }

  if (method === "POST" && path === "/api/preferences") {
    const body = JSON.parse(options.body || "{}");
    mockDb.user.preferences = { ...mockDb.user.preferences, ...body };
    return { preferences: mockDb.user.preferences };
  }

  if (method === "POST" && path === "/api/pricing/freeze") {
    const freeze = {
      id: `PF-${Date.now().toString().slice(-6)}`,
      price: pricing().price,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
    mockDb.freezes.unshift(freeze);
    return { freeze };
  }

  if (method === "POST" && path.match(/^\/api\/recommendations\/[^/]+\/feedback$/)) {
    return { saved: true };
  }

  throw new Error("Mock API route not found");
}
