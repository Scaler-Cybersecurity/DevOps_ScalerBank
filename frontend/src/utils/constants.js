export const API = "/api";

export const CATEGORY_ICONS = {
  food: "🍕", shopping: "🛍️", transport: "🚗", entertainment: "🎬",
  bills: "📄", health: "💊", travel: "✈️", education: "📚",
  income: "💰", transfer: "↔️", other: "📌"
};

export const CATEGORY_COLORS = {
  food: "#c4841d", shopping: "#8b1c1c", transport: "#2a7d6e",
  entertainment: "#1a5c3a", bills: "#a33030", health: "#2d8659",
  travel: "#3d6b8e", education: "#4a6741", income: "#2d8659",
  transfer: "#5a8f6e", other: "#8a8a8a"
};

export const PIE_COLORS = [
  "#1a5c3a", "#8b1c1c", "#c4841d", "#2a7d6e",
  "#2d8659", "#a33030", "#3d6b8e", "#4a6741"
];

export const fmt = (n, cur = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: cur, maximumFractionDigits: 0
  }).format(n);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  });
