import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getTimeRemaining(deadline: string | Date): {
  text: string;
  isOverdue: boolean;
  urgency: "critical" | "warning" | "normal" | "safe";
} {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    const overdueMins = Math.abs(Math.floor(diffMs / 60000));
    const overdueHours = Math.floor(overdueMins / 60);
    const overdueDays = Math.floor(overdueHours / 24);
    let text = "";
    if (overdueDays > 0) text = `${overdueDays}d overdue`;
    else if (overdueHours > 0) text = `${overdueHours}h overdue`;
    else text = `${overdueMins}m overdue`;
    return { text, isOverdue: true, urgency: "critical" };
  }

  const remainMins = Math.floor(diffMs / 60000);
  const remainHours = Math.floor(remainMins / 60);
  const remainDays = Math.floor(remainHours / 24);

  let text = "";
  if (remainDays > 0) text = `${remainDays}d ${remainHours % 24}h remaining`;
  else if (remainHours > 0) text = `${remainHours}h ${remainMins % 60}m remaining`;
  else text = `${remainMins}m remaining`;

  let urgency: "critical" | "warning" | "normal" | "safe" = "safe";
  if (remainHours < 2) urgency = "critical";
  else if (remainHours < 6) urgency = "warning";
  else if (remainHours < 12) urgency = "normal";

  return { text, isOverdue: false, urgency };
}

export function generateTrackingUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/track/${token}`;
}

export function evaluateCriticalSafety(
  category: string,
  title: string,
  description: string
): boolean {
  const text = `${title} ${description}`.toLowerCase();
  const criticalKeywords = [
    "exposed wire",
    "electric shock",
    "sparking",
    "short circuit",
    "smoke",
    "fire",
    "gas leak",
    "flooding",
    "pipe burst",
    "ceiling collapse",
    "structural crack",
    "water leakage near wire",
    "shocks",
    "flame",
    "hazard",
    "danger",
  ];

  return criticalKeywords.some((keyword) => text.includes(keyword));
}
