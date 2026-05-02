import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { mockApi } from "./mockApi";
import "./styles.css";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

async function api(path, options = {}) {
  try {
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      const error = contentType.includes("application/json")
        ? await response.json().catch(() => ({ error: "Request failed" }))
        : { error: "Backend API unavailable" };
      throw new Error(error.error);
    }
    return response.json();
  } catch (error) {
    if (path.startsWith("/api/")) return mockApi(path, options);
    throw error;
  }
}

function formatDate(value) {
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function Toasts({ toasts }) {
  return <div className="toast-region" aria-live="polite">{toasts.map((item) => <div className="toast" key={item.id}>{item.message}</div>)}</div>;
}

function Tag({ children, tone = "" }) {
  return <span className={`tag ${tone}`}>{children}</span>;
}

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="brand">
        <span className="brand-mark">TM</span>
        <div><strong>TravelMate</strong><span>Full-stack control tower</span></div>
      </div>
      <nav>
        <a href="#dashboard" className="active">Dashboard</a>
        <a href="#refunds">Refunds</a>
        <a href="#reviews">Reviews</a>
        <a href="#flights">Live flights</a>
        <a href="#selection">Seats & rooms</a>
        <a href="#pricing">Pricing</a>
        <a href="#recommendations">For you</a>
      </nav>
    </aside>
  );
}

function Header({ user }) {
  return (
    <header className="topbar" id="dashboard">
      <div>
        <p className="eyebrow">React + Express travel platform</p>
        <h1>Book, track, change, and recover every trip from one workspace.</h1>
      </div>
      <div className="profile-pill">
        <span>{user.name.charAt(0)}</span>
        <div><strong>{user.name}</strong><small>{user.tier} member</small></div>
      </div>
    </header>
  );
}

function Hero({ notifications }) {
  return (
    <section className="hero-grid">
      <article className="trip-focus">
        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80" alt="Beach resort with blue water" />
        <div className="trip-overlay">
          <span>Next recommended trip</span>
          <h2>Bali ocean stay with flexible cancellation</h2>
          <p>Dynamic prices, refundable rooms, premium seat upgrades, and live flight tracking are wired to mock APIs.</p>
        </div>
      </article>
      <article className="panel live-panel">
        <div className="panel-head"><h2>Live alerts</h2><span className="pulse" /></div>
        <div className="stack">
          {notifications.length ? notifications.slice(0, 4).map((item) => (
            <div className="notice-card" key={item.id}>
              <strong>{item.title}</strong>
              <p className="muted">{item.body}</p>
              <Tag>{formatDate(item.createdAt)}</Tag>
            </div>
          )) : <div className="notice-card"><strong>No critical alerts</strong><p className="muted">Mock push updates will appear automatically.</p></div>}
        </div>
      </article>
    </section>
  );
}

function Metrics({ bookings, flights, pricing }) {
  const active = bookings.filter((booking) => booking.status === "confirmed").length;
  const refunds = bookings.filter((booking) => booking.refundStatus).length;
  return (
    <section className="metrics" aria-label="Platform summary">
      <div><span>{active}</span><small>Active bookings</small></div>
      <div><span>{refunds}</span><small>Refund trackers</small></div>
      <div><span>{flights.length}</span><small>Tracked flights</small></div>
      <div><span>{money.format(pricing.price)}</span><small>Current dynamic fare</small></div>
    </section>
  );
}

function Bookings({ bookings, onCancel }) {
  const [reasons, setReasons] = useState({});
  const tone = (status) => status === "cancelled" ? "danger" : "success";
  return (
    <section className="section-grid two" id="refunds">
      <article className="panel">
        <div className="panel-head"><div><p className="eyebrow">Cancellation center</p><h2>Your bookings</h2></div></div>
        <div className="booking-list">
          {bookings.map((booking) => (
            <div className="booking-card" key={booking.id}>
              <div>
                <div className="tag-row"><Tag tone={tone(booking.status)}>{booking.status}</Tag><Tag>{booking.type}</Tag><Tag>{money.format(booking.amount)}</Tag></div>
                <h3>{booking.title}</h3>
                <p className="muted">{booking.provider} - Reservation {formatDate(booking.reservationDate)} - Selected {booking.selection}</p>
                {booking.status === "confirmed" ? (
                  <div className="cancel-row">
                    <select value={reasons[booking.id] || ""} onChange={(event) => setReasons({ ...reasons, [booking.id]: event.target.value })}>
                      <option value="">Select cancellation reason</option>
                      <option>Change in travel plan</option>
                      <option>Found a better price</option>
                      <option>Medical or emergency reason</option>
                      <option>Flight timing issue</option>
                      <option>Other service concern</option>
                    </select>
                    <button onClick={() => onCancel(booking.id, reasons[booking.id])}>Cancel booking</button>
                  </div>
                ) : <p className="muted">Reason: {booking.cancelReason || "Not applicable"}</p>}
              </div>
              <div><strong>{booking.id}</strong></div>
            </div>
          ))}
        </div>
      </article>
      <RefundTracker bookings={bookings} />
    </section>
  );
}

function RefundTracker({ bookings }) {
  const refunds = bookings.filter((booking) => booking.refundStatus);
  return (
    <article className="panel">
      <div className="panel-head"><div><p className="eyebrow">Refund transparency</p><h2>Status tracker</h2></div></div>
      <div className="stack">
        {refunds.length ? refunds.map((booking) => {
          const refund = booking.refundStatus;
          return (
            <div className="notice-card" key={refund.id}>
              <div className="tag-row"><Tag tone="warn">{refund.status}</Tag><Tag>{refund.percent}% refund</Tag><Tag>{refund.timeline}</Tag></div>
              <h3>{refund.id} - {booking.title}</h3>
              <p>{money.format(refund.amount)} calculated using {refund.policy}.</p>
              <p className="muted">Expected timeline: {refund.timeline}. Last updated {formatDate(refund.updatedAt)}.</p>
            </div>
          );
        }) : <div className="notice-card"><strong>No refunds yet</strong><p className="muted">Cancel an eligible booking to create a refund tracker.</p></div>}
      </div>
    </article>
  );
}

function Reviews({ reviews, setReviews, notify }) {
  const [sort, setSort] = useState("helpful");
  const [replyText, setReplyText] = useState({});
  const sorted = useMemo(() => [...reviews].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "highest") return b.rating - a.rating;
    return b.helpful - a.helpful;
  }), [reviews, sort]);

  async function submitReview(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const target = form.get("target");
    const result = await api("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        target,
        targetType: target.includes("Resort") ? "hotel" : "flight",
        rating: form.get("rating"),
        photo: form.get("photo"),
        text: form.get("text")
      })
    });
    setReviews([result.review, ...reviews]);
    event.currentTarget.reset();
    notify("Review published.");
  }

  async function reply(id) {
    if (!replyText[id]?.trim()) return notify("Write a reply first.");
    const result = await api(`/api/reviews/${id}/reply`, { method: "POST", body: JSON.stringify({ text: replyText[id] }) });
    setReviews(reviews.map((review) => review.id === id ? result.review : review));
  }

  async function flag(id) {
    const result = await api(`/api/reviews/${id}/flag`, { method: "POST" });
    setReviews(reviews.map((review) => review.id === id ? result.review : review));
    notify("Review sent to moderation queue.");
  }

  return (
    <section className="section-grid two" id="reviews">
      <article className="panel">
        <div className="panel-head split">
          <div><p className="eyebrow">User content</p><h2>Reviews & ratings</h2></div>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort reviews">
            <option value="helpful">Most helpful</option>
            <option value="newest">Newest</option>
            <option value="highest">Highest rated</option>
          </select>
        </div>
        <div className="review-list">
          {sorted.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="tag-row"><span className="stars">{"*".repeat(review.rating)}{"-".repeat(5 - review.rating)}</span><Tag>{review.targetType}</Tag>{review.flagged && <Tag tone="danger">moderation queued</Tag>}</div>
              <h3>{review.target}</h3>
              <p>{review.text}</p>
              <p className="muted">By {review.author} - {review.helpful} helpful - {formatDate(review.createdAt)}</p>
              {review.photos.map((photo) => <img src={photo} alt="Traveler uploaded review" key={photo} />)}
              {review.replies.map((item, index) => <p className="reply" key={`${item.author}-${index}`}><strong>{item.author}</strong>: {item.text}</p>)}
              <div className="review-actions">
                <input value={replyText[review.id] || ""} onChange={(event) => setReplyText({ ...replyText, [review.id]: event.target.value })} placeholder="Reply to this review" />
                <button className="secondary" onClick={() => reply(review.id)}>Reply</button>
                <button className="secondary" onClick={() => flag(review.id)}>Flag</button>
              </div>
            </article>
          ))}
        </div>
      </article>
      <article className="panel">
        <div className="panel-head"><div><p className="eyebrow">Add feedback</p><h2>Write a review</h2></div></div>
        <form className="form-grid" onSubmit={submitReview}>
          <label>Target<select name="target"><option>Azure Palm Resort, Bali</option><option>IndiGo 6E-147</option><option>Vistara UK-115</option></select></label>
          <label>Rating<input name="rating" type="range" min="1" max="5" defaultValue="5" /></label>
          <label>Photo URL<input name="photo" placeholder="https://images.unsplash.com/..." /></label>
          <label>Review<textarea name="text" rows="5" placeholder="Share what future travelers should know" /></label>
          <button type="submit">Submit review</button>
        </form>
      </article>
    </section>
  );
}

function Flights({ flights, onRefresh }) {
  return (
    <section className="panel" id="flights">
      <div className="panel-head split"><div><p className="eyebrow">Mock real-time API</p><h2>Live flight status</h2></div><button className="secondary" onClick={onRefresh}>Refresh now</button></div>
      <div className="flight-grid">
        {flights.map((flight) => (
          <article className="flight-card" key={flight.id}>
            <div className="tag-row"><Tag>{flight.number}</Tag><Tag>{flight.terminal}</Tag><Tag>Gate {flight.gate}</Tag></div>
            <div><p className="muted">{flight.route}</p><div className="flight-status">{flight.status}</div></div>
            <p>{flight.reason}</p>
            <p className="muted">Departure {formatDate(flight.departure)} - ETA {formatDate(flight.eta)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Selection({ selections, preferences, notify }) {
  const [selectedSeat, setSelectedSeat] = useState(preferences.seat);
  const [selectedRoom, setSelectedRoom] = useState(preferences.roomType);

  async function savePreference(payload, message) {
    await api("/api/preferences", { method: "POST", body: JSON.stringify(payload) });
    notify(message);
  }

  return (
    <section className="section-grid two" id="selection">
      <article className="panel">
        <div className="panel-head"><div><p className="eyebrow">Flight upsell</p><h2>Dynamic seat map</h2></div></div>
        <div className="seat-map" aria-label="Seat map">
          {Array.from({ length: 18 }, (_, rowIndex) => rowIndex + 1).flatMap((row) => ["A", "B", "C", "aisle", "D", "E", "F"].map((col) => {
            if (col === "aisle") return <div className="aisle" key={`${row}-aisle`} />;
            const seat = selections.seats.find((item) => item.id === `${row}${col}`);
            return <button key={seat.id} className={`seat ${seat.premium ? "premium" : ""} ${seat.available ? "" : "unavailable"} ${selectedSeat === seat.id ? "selected" : ""}`} disabled={!seat.available} title={`${seat.premium ? "Premium" : "Standard"} ${money.format(seat.price)}`} onClick={() => setSelectedSeat(seat.id)}>{seat.id}</button>;
          }))}
        </div>
        <div className="selection-footer"><span>Selected: {selectedSeat}</span><button className="secondary" onClick={() => savePreference({ seat: selectedSeat }, `${selectedSeat} saved as seat preference.`)}>Save preference</button></div>
      </article>
      <article className="panel">
        <div className="panel-head"><div><p className="eyebrow">Hotel upsell</p><h2>Room grid & preview</h2></div></div>
        <div className="room-grid">
          {selections.rooms.map((room) => (
            <article className={`room-card ${selectedRoom === room.type ? "selected" : ""}`} key={room.id} onClick={() => { setSelectedRoom(room.type); savePreference({ roomType: room.type }, `${room.type} saved as room preference.`); }}>
              <div className="tag-row"><Tag tone={room.available ? "success" : "danger"}>{room.available ? "available" : "sold out"}</Tag>{room.premium && <Tag tone="warn">upgrade</Tag>}</div>
              <img src={room.image} alt={`${room.type} preview`} />
              <h3>{room.type}</h3>
              <p className="muted">{money.format(room.price)} per night</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}

function Pricing({ pricing, priceHistory, freezes, setFreezes, notify }) {
  const min = Math.min(...priceHistory.map((point) => point.price)) - 1000;
  const max = Math.max(...priceHistory.map((point) => point.price)) + 1000;
  const points = priceHistory.map((point, index) => ({
    ...point,
    x: 45 + index * 90,
    y: 200 - ((point.price - min) / (max - min)) * 160
  }));

  async function freezePrice() {
    const result = await api("/api/pricing/freeze", { method: "POST" });
    setFreezes([result.freeze, ...freezes]);
    notify("Current price frozen for 15 minutes.");
  }

  return (
    <section className="section-grid two" id="pricing">
      <article className="panel">
        <div className="panel-head split"><div><p className="eyebrow">Dynamic pricing engine</p><h2>Price movement</h2></div><button onClick={freezePrice}>Freeze price</button></div>
        <div className="chart-wrap">
          <svg viewBox="0 0 640 240" role="img" aria-label="Price history graph">
            <polyline fill="none" stroke="#145db6" strokeWidth="4" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
            {points.map((point) => <g key={point.day}><circle cx={point.x} cy={point.y} r="6" fill="#0b6b6f" /><text x={point.x} y="224" textAnchor="middle" fontSize="12" fill="#64717f">{point.day}</text><text x={point.x} y={point.y - 14} textAnchor="middle" fontSize="12" fill="#17202a">{Math.round(point.price / 1000)}k</text></g>)}
          </svg>
        </div>
        <div className="factor-row">{pricing.factors.map((factor) => <Tag key={factor.label}>{factor.label}: {factor.value}</Tag>)}</div>
      </article>
      <article className="panel">
        <div className="panel-head"><div><p className="eyebrow">Locked fares</p><h2>Price freeze</h2></div></div>
        <div className="stack">
          {freezes.length ? freezes.map((freeze) => <div className="notice-card" key={freeze.id}><div className="tag-row"><Tag tone="success">locked</Tag><Tag>{freeze.id}</Tag></div><h3>{money.format(freeze.price)}</h3><p className="muted">Expires {formatDate(freeze.expiresAt)}</p></div>) : <div className="notice-card"><strong>No frozen prices</strong><p className="muted">Lock the current fare for 15 minutes before demand changes.</p></div>}
        </div>
      </article>
    </section>
  );
}

function Recommendations({ items, notify }) {
  async function feedback(id, sentiment) {
    await api(`/api/recommendations/${id}/feedback`, { method: "POST", body: JSON.stringify({ sentiment }) });
    notify("Recommendation feedback saved.");
  }

  return (
    <section className="panel" id="recommendations">
      <div className="panel-head"><div><p className="eyebrow">Personalization</p><h2>Recommended for you</h2></div></div>
      <div className="recommendation-grid">
        {items.map((item) => (
          <article className="recommendation-card" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="tag-row"><Tag>{item.type}</Tag><Tag tone="success">{item.score}% match</Tag></div>
            <h3>{item.title}</h3>
            <p className="muted">{item.subtitle}</p>
            <span className="why" data-tip={item.why}>Why this recommendation?</span>
            <div className="tag-row"><button className="secondary" onClick={() => feedback(item.id, "helpful")}>Helpful</button><button className="secondary" onClick={() => feedback(item.id, "irrelevant")}>Irrelevant</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [state, setState] = useState(null);
  const [toasts, setToasts] = useState([]);

  function notify(message) {
    const toast = { id: crypto.randomUUID(), message };
    setToasts((items) => [...items, toast]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== toast.id)), 3600);
  }

  useEffect(() => {
    api("/api/bootstrap").then(setState).catch((error) => notify(error.message));
  }, []);

  useEffect(() => {
    const timer = setInterval(refreshFlights, 20000);
    return () => clearInterval(timer);
  }, []);

  async function refreshFlights() {
    const result = await api("/api/flights/status");
    setState((current) => current ? { ...current, flights: result.flights, notifications: result.notifications, pricing: result.pricing } : current);
  }

  async function cancelBooking(id, reason) {
    if (!reason) return notify("Select a cancellation reason first.");
    const result = await api(`/api/bookings/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) });
    setState({ ...state, bookings: state.bookings.map((booking) => booking.id === id ? result.booking : booking) });
    notify(`Refund tracker created for ${id}.`);
  }

  if (!state) return <main className="loading">Loading TravelMate platform...</main>;

  return (
    <div className="app-shell">
      <Sidebar />
      <main>
        <Header user={state.user} />
        <Hero notifications={state.notifications} />
        <Metrics bookings={state.bookings} flights={state.flights} pricing={state.pricing} />
        <Bookings bookings={state.bookings} onCancel={cancelBooking} />
        <Reviews reviews={state.reviews} setReviews={(reviews) => setState({ ...state, reviews })} notify={notify} />
        <Flights flights={state.flights} onRefresh={refreshFlights} />
        <Selection selections={state.selections} preferences={state.user.preferences} notify={notify} />
        <Pricing pricing={state.pricing} priceHistory={state.priceHistory} freezes={state.freezes} setFreezes={(freezes) => setState({ ...state, freezes })} notify={notify} />
        <Recommendations items={state.recommendations} notify={notify} />
      </main>
      <Toasts toasts={toasts} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
