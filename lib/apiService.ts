// lib/apiService.ts
import { Service } from '@/types/service';

export async function getServiceStatuses(): Promise<Service[]> {
  const response = await fetch('/api/services/status'); // Запит до нашого mock-API
  if (!response.ok) {
    // Можна кидати більш специфічну помилку або обробляти різні статуси
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: Service[] = await response.json();
  return data;
}