// types/service.ts
export interface Service {
  id: string;
  name: string;
  status: "OK" | "WARNING" | "ERROR"; // Використовуємо об'єднання типів для статусу
  lastChecked: string; // Це буде рядок дати у форматі ISO
  details: string;
}