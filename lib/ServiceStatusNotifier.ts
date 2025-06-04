// lib/ServiceStatusNotifier.ts
import { getServiceStatuses } from './apiService';
import { Service } from '@/types/service';

export interface Observer {
  update(services: Service[]): void;
  // Можна додати для помилок пізніше: onError?(error: Error): void;
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
      // Якщо даних немає, не йде запит і початковий запит ще не був зроблений, ініціюємо
      // Це допоможе, якщо компонент підписується до того, як polling стартував
      this.fetchStatuses();
    }
  }

  public unsubscribe(observer: Observer): void {
    this.observers = this.observers.filter(obs => obs !== observer);
    // Якщо спостерігачів не залишилося, можна зупинити polling
    // if (this.observers.length === 0) {
    //   this.stopPolling();
    // }
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
                               // Або можна додати стару перевірку:
                               // if (JSON.stringify(newServices) !== JSON.stringify(this.services)) {
                               //   this.services = newServices;
                               //   this.notifyObservers();
                               // } else if (!this.initialFetchDone) {
                               //   // Для першого завантаження, якщо дані не змінилися, але треба сповістити
                               //   this.services = newServices; // переконатися, що кеш оновлений
                               //   this.notifyObservers();
                               // }
    } catch (error) {
      console.error('Failed to fetch service statuses (Notifier):', error);
      // Тут можна буде сповіщати спостерігачів про помилку
      // this.observers.forEach(obs => obs.onError?.(error as Error));
    } finally {
      this.fetching = false;
    }
  }

  public startPolling(intervalMs: number = 10000): void { // Змінив дефолтний інтервал на 10с
    if (this.intervalId) {
      // Polling вже запущено, нічого не робимо або перезапускаємо, якщо треба змінити інтервал
      // Для простоти поки що, якщо вже є, не чіпаємо.
      // Якщо треба змінювати інтервал: this.stopPolling();
      return;
    }

    // Запускаємо перший запит негайно, якщо ще не було зроблено
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

  // Додамо getter для перевірки стану (може знадобитися Dashboard)
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