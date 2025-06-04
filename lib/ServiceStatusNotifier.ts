// lib/ServiceStatusNotifier.ts
import { getServiceStatuses } from './apiService';
import { Service } from '@/types/service';

export interface Observer {
  update(services: Service[]): void;
}

class ServiceStatusNotifier {
  private observers: Observer[] = [];
  private services: Service[] = [];
  private intervalId?: NodeJS.Timeout;
  private fetching: boolean = false;
  private initialFetchDone: boolean = false; // Додамо прапорець, що початковий запит був зроблений

  public subscribe(observer: Observer): void {
    this.observers.push(observer);
    if (this.services.length > 0) {
      observer.update(this.services);
    } else if (!this.fetching && !this.initialFetchDone) {
      this.fetchStatuses();
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
    if (this.fetching) return;
    this.fetching = true;
    try {
      const newServices: Service[] = await getServiceStatuses();
      this.services = newServices; // Завжди оновлюємо кеш
      this.initialFetchDone = true; // Позначаємо, що хоча б один запит був успішним
      this.notifyObservers(); // Сповіщаємо, навіть якщо дані ті ж самі (для першого завантаження)
    } catch (error) {
      console.error('Failed to fetch service statuses (Notifier):', error);
    } finally {
      this.fetching = false;
    }
  }

  public startPolling(intervalMs: number = 10000): void { // Змінив дефолтний інтервал на 10с
    if (this.intervalId) {
      return;
    }

    if (!this.initialFetchDone && !this.fetching) {
      this.fetchStatuses();
    }

    this.intervalId = setInterval(() => {
      this.fetchStatuses();
    }, intervalMs);
    console.log(`Polling started/confirmed with interval ${intervalMs}ms`);
  }

  public stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.initialFetchDone = false; // Скидаємо, якщо polling зупинено
      console.log('Polling stopped');
    }
  }

  public get currentServices(): Service[] {
    return [...this.services]; // Повертаємо копію
  }

  public get isFetching(): boolean {
    return this.fetching;
  }

  public get hasFetchedOnce(): boolean {
    return this.initialFetchDone;
  }
}

const serviceStatusNotifier = new ServiceStatusNotifier();
export default serviceStatusNotifier;