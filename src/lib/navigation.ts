import { tools } from "@/lib/tool-catalog";
export const settingsLink = {
  to: "/settings",
  label: "Настройки",
  title: "Настройки — LePear",
} as const;
export const pageLinks = [
  { to: "/", label: "Главная", title: "LePear — темы, YouTube и конвертер" },
  ...tools.map((tool) => ({
    to: tool.to,
    label: tool.navigationLabel,
    title: tool.pageTitle,
  })),
  { to: "/contact", label: "Обратная связь", title: "Обратная связь — LePear" },
] as const;
export const allPageLinks = [...pageLinks, settingsLink] as const;
export const landingLinks = [
  { to: "/#features", label: "Возможности" },
  { to: "/#how-it-works", label: "Как это работает" },
  { to: "/#faq", label: "Вопросы" },
] as const;
