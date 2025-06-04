// lib/ServiceStatusNotifier.ts
import { getServiceStatuses } from './apiService'; // Додано
import { Service } from '@/types/service';

// Інтерфейс для спостерігача
export interface Observer {
  update(services: Service[]): void;
}

class ServiceStatusNotifier {
  private observers: Observer[] = [];
  private services: Service[] = [];
  private intervalId?: NodeJS.Timeout;
  private fetching: boolean = false; // Флаг, щоб уникнути паралельних запитів

  public subscribe(observer: Observer): void {
    this.observers.push(observer);
    // При першій підписці, якщо ще не отримували, або для нового спостерігача
    if (this.services.length > 0) {
      observer.update(this.services); // Одразу віддати поточні дані
    }
  }

  public unsubscribe(observer: Observer): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  private notifyObservers(): void {
    for (const observer of this.observers) {
      observer.update(this.services);
    }
  }

  public async fetchStatuses(): Promise<void> {
    if (this.fetching) {
      // console.log('Fetch already in progress, skipping.');
      return;
    }
    this.fetching = true;
    // console.log('Fetching statuses...');
    try {
      const response = await fetch('/api/services/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newServices: Service[] = await response.json();

      // Перевіряємо, чи дані дійсно змінилися, щоб не сповіщати без потреби
      // (проста перевірка, можна зробити глибшу, якщо потрібно)
      if (JSON.stringify(newServices) !== JSON.stringify(this.services)) {
        this.services = newServices;
        this.notifyObservers();
      }
    } catch (error) {
      console.error('Failed to fetch service statuses:', error);
      // Тут можна додати логіку сповіщення спостерігачів про помилку, якщо потрібно
    } finally {
      this.fetching = false;
    }
  }

  public startPolling(intervalMs: number = 5000): void { // За замовчуванням кожні 5 секунд
    if (this.intervalId) {
      this.stopPolling();
    }
    // Перший запит одразу
    this.fetchStatuses();
    // Потім періодично
    this.intervalId = setInterval(() => {
      this.fetchStatuses();
    }, intervalMs);
    console.log(`Polling started with interval ${intervalMs}ms`);
  }

  public stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('Polling stopped');
    }
  }
}

// Експортуємо єдиний екземпляр (Singleton)
const serviceStatusNotifier = new ServiceStatusNotifier();
export default serviceStatusNotifier;