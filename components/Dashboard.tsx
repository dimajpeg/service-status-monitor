// components/Dashboard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Service } from '@/types/service';
import ServiceStatusCard from './ServiceStatusCard';
import serviceStatusNotifier, { Observer } from '@/lib/ServiceStatusNotifier'; // Імпорт

const Dashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Початкове завантаження
  const [error, setError] = useState<string | null>(null); // Поки не використовуємо для помилок з Notifier

  useEffect(() => {
    // Створюємо об'єкт спостерігача
    const observer: Observer = {
      update: (updatedServices: Service[]) => {
        setServices(updatedServices);
        if (isLoading) setIsLoading(false); // Вимикаємо індикатор завантаження після першого отримання даних
        // console.log('Dashboard updated with new services:', updatedServices);
      }
    };

    serviceStatusNotifier.subscribe(observer);
    // Запускаємо періодичне опитування, якщо воно ще не запущене
    // (Singleton гарантує, що startPolling не викличеться багато разів, якщо вже запущено)
    // Але для першого завантаження краще викликати fetchStatuses з Notifier
    if (serviceStatusNotifier['services'] && serviceStatusNotifier['services'].length === 0 && !serviceStatusNotifier['fetching']) {
      // Якщо сервісів ще немає і не йде запит, ініціюємо перший запит
      serviceStatusNotifier.fetchStatuses().then(() => {
          if (isLoading) setIsLoading(false);
      }).catch(e => {
          console.error("Initial fetch error from Dashboard:", e);
          setError("Не вдалося завантажити початкові дані");
          if (isLoading) setIsLoading(false);
      });
    } else {
        // Якщо дані вже є або йде запит, просто оновлюємо з кешу або чекаємо
        if (serviceStatusNotifier['services'] && serviceStatusNotifier['services'].length > 0) {
            setServices(serviceStatusNotifier['services']);
            if (isLoading) setIsLoading(false);
        }
    }
    
    // Запускаємо polling (Notifier сам подбає, щоб не було дублів інтервалу)
    serviceStatusNotifier.startPolling(10000); // Оновлювати кожні 10 секунд

    // Функція очищення для відписки при демонтуванні компонента
    return () => {
      serviceStatusNotifier.unsubscribe(observer);
      // Можна додати логіку зупинки polling, якщо це останній спостерігач,
      // але для простоти наш Singleton буде продовжувати працювати.
      // Якщо потрібно зупиняти:
      // if (serviceStatusNotifier['observers'].length === 0) {
      //   serviceStatusNotifier.stopPolling();
      // }
    };
  }, [isLoading]); // Залежність від isLoading, щоб коректно вимкнути його

  // Початковий стан завантаження, поки перші дані не прийшли від Notifier
  if (isLoading && services.length === 0 && !error) {
    return <div className="text-center py-10">Завантаження статусів...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Помилка: {error}</div>;
  }

  if (services.length === 0 && !isLoading) { // Якщо не завантажується і сервісів немає
    return <div className="text-center py-10">Немає сервісів для відображення.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Панель Моніторингу Статусів Сервісів
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceStatusCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;