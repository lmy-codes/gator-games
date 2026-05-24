const GOOGLE_CALENDAR_EMBED_URL = "";

const EVENT_RULES = [
  {
    title: "MTG Commander",
    category: "magic",
    weekday: 2,
    start: "16:00",
    end: "20:00",
    price: "$6.50 + tax",
    description: "Two rounds of Bracket 3 Commander with booster and promo prize support.",
  },
  {
    title: "Open Wargaming",
    category: "wargaming",
    weekday: 3,
    start: "12:00",
    end: "18:00",
    price: "Free",
    description: "Terrain and tables for 40k or other miniatures wargames.",
  },
  {
    title: "Yu-Gi-Oh Locals",
    category: "yugioh",
    weekday: 4,
    start: "16:00",
    end: "19:00",
    price: "$5 + tax",
    description: "Advanced Format locals with OTS pack support.",
  },
  {
    title: "Friday Night Magic",
    category: "magic",
    weekday: 5,
    start: "16:00",
    end: "19:30",
    price: "$6.50 + tax",
    description: "Modern Constructed with Swiss rounds and FNM prize support.",
  },
];

const state = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  filter: "all",
  agendaExpanded: false,
};

const grid = document.querySelector("[data-calendar-grid]");
const label = document.querySelector("[data-calendar-label]");
const agenda = document.querySelector("[data-agenda-list]");
const agendaTitle = document.querySelector("[data-agenda-title]");

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseTime(date, time) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
}

function googleDate(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    pad(date.getMinutes()),
    "00",
  ].join("");
}

function formatTimeRange(event) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(event.startDate)}-${formatter.format(event.endDate)}`;
}

function makeGoogleLink(event) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${googleDate(event.startDate)}/${googleDate(event.endDate)}`,
    details: `${event.description} Entry: ${event.price}`,
    location: "Gator Games, 4212 Olympic Ave, San Mateo, CA 94403",
    ctz: "America/Los_Angeles",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function monthEvents(year, month) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const events = [];

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month, day);
    EVENT_RULES.filter((rule) => rule.weekday === date.getDay()).forEach((rule) => {
      events.push({
        ...rule,
        date,
        startDate: parseTime(date, rule.start),
        endDate: parseTime(date, rule.end),
      });
    });
  }

  return events;
}

function visibleEvents(events) {
  if (state.filter === "all") {
    return events;
  }
  return events.filter((event) => event.category === state.filter);
}

function futureEvents(events) {
  const now = new Date();
  return events.filter((event) => event.endDate >= now);
}

function renderCalendar() {
  const monthDate = new Date(state.year, state.month, 1);
  const allEvents = monthEvents(state.year, state.month);
  const events = visibleEvents(allEvents);
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthDate);

  label.textContent = monthName;
  agendaTitle.textContent = state.filter === "all" ? "This month" : state.filter;
  state.agendaExpanded = false;
  grid.innerHTML = "";

  const firstWeekday = monthDate.getDay();
  const lastDay = new Date(state.year, state.month + 1, 0).getDate();

  for (let blank = 0; blank < firstWeekday; blank += 1) {
    const cell = document.createElement("div");
    cell.className = "calendar-day muted";
    grid.append(cell);
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const cell = document.createElement("button");
    const date = new Date(state.year, state.month, day);
    const dayEvents = events.filter((event) => event.date.getDate() === day);
    const today = new Date();
    const isToday =
      today.getFullYear() === state.year &&
      today.getMonth() === state.month &&
      today.getDate() === day;

    cell.type = "button";
    cell.className = `calendar-day${dayEvents.length ? " has-events" : ""}${isToday ? " is-today" : ""}`;
    cell.innerHTML = `<span class="day-number">${day}</span>`;
    cell.setAttribute("aria-label", `${date.toDateString()}, ${dayEvents.length} events`);

    dayEvents.slice(0, 2).forEach((event) => {
      const chip = document.createElement("span");
      chip.className = `event-chip ${event.category}`;
      chip.textContent = event.title.replace("Friday Night Magic", "FNM");
      cell.append(chip);
    });

    cell.addEventListener("click", () => {
      state.agendaExpanded = false;
      renderAgenda(dayEvents.length ? dayEvents : events);
    });
    grid.append(cell);
  }

  renderAgenda(events);
}

function renderAgenda(events) {
  const sortedEvents = futureEvents(events).sort((a, b) => a.startDate - b.startDate);
  const previewLimit = 3;
  const displayedEvents = state.agendaExpanded
    ? sortedEvents
    : sortedEvents.slice(0, previewLimit);
  agenda.innerHTML = "";

  if (!sortedEvents.length) {
    agenda.innerHTML = `<p class="empty-agenda">No upcoming events match this filter.</p>`;
    return;
  }

  displayedEvents.forEach((event) => {
    const item = document.createElement("article");
    item.className = "agenda-item";
    item.innerHTML = `
      <div class="agenda-date">
        <span>${new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(event.date)}</span>
        <strong>${event.date.getDate()}</strong>
      </div>
      <div>
        <span class="event-meta">${formatTimeRange(event)} · ${event.price}</span>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <a href="${makeGoogleLink(event)}" target="_blank" rel="noreferrer">Add to Google Calendar</a>
      </div>
    `;
    agenda.append(item);
  });

  if (sortedEvents.length > previewLimit) {
    const toggle = document.createElement("button");
    const hiddenCount = sortedEvents.length - previewLimit;

    toggle.type = "button";
    toggle.className = "agenda-toggle";
    toggle.textContent = state.agendaExpanded
      ? "Show Less"
      : `See All ${sortedEvents.length} Events`;
    toggle.setAttribute(
      "aria-expanded",
      state.agendaExpanded ? "true" : "false",
    );
    toggle.addEventListener("click", () => {
      state.agendaExpanded = !state.agendaExpanded;
      renderAgenda(sortedEvents);
    });

    if (!state.agendaExpanded) {
      toggle.dataset.count = `${hiddenCount} more`;
    }

    agenda.append(toggle);
  }
}

function initGoogleCalendar() {
  if (!GOOGLE_CALENDAR_EMBED_URL) {
    return;
  }

  const googleCard = document.createElement("div");
  const googleFrame = document.createElement("iframe");

  googleCard.className = "google-calendar-card";
  googleFrame.title = "Gator Games Google Calendar";
  googleFrame.loading = "lazy";
  googleFrame.src = GOOGLE_CALENDAR_EMBED_URL;
  googleCard.append(googleFrame);
  document.querySelector(".calendar-shell").append(googleCard);
}

document.querySelector("[data-calendar-prev]").addEventListener("click", () => {
  state.month -= 1;
  if (state.month < 0) {
    state.month = 11;
    state.year -= 1;
  }
  renderCalendar();
});

document.querySelector("[data-calendar-next]").addEventListener("click", () => {
  state.month += 1;
  if (state.month > 11) {
    state.month = 0;
    state.year += 1;
  }
  renderCalendar();
});

document.querySelector("[data-calendar-today]").addEventListener("click", () => {
  const today = new Date();
  state.month = today.getMonth();
  state.year = today.getFullYear();
  renderCalendar();
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    state.agendaExpanded = false;
    document.querySelectorAll("[data-filter]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderCalendar();
  });
});

initGoogleCalendar();
renderCalendar();
