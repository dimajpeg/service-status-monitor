// components/Dashboard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Service } from '@/types/service';
import ServiceStatusCard from './ServiceStatusCard';
import serviceStatusNotifier, { Observer } from '@/lib/ServiceStatusNotifier';

const Dashboard: React.FC = () => {
  // Використовуємо початковий стан з Notifier, якщо він вже має дані
  const [services, setServices] = useState<Service[]>(serviceStatusNotifier.currentServices);
  // isLoading тепер залежить від того, чи були вже дані завантажені Notifier-ом
  const [isLoading, setIsLoading] = useState<boolean>(!serviceStatusNotifier.hasFetchedOnce && serviceStatusNotifier.currentServices.length === 0);
  const [error, setError] = useState<string | null>(null); // Поки не обробляємо помилки від Notifier

  useEffect(() => {
    const observer: Observer = {
      update: (updatedServices: Service[]) => {
        setServices(updatedServices);
        if (isLoading) setIsLoading(false); // Вимикаємо індикатор, якщо він був активний
        setError(null); // Скидаємо помилку, якщо дані прийшли
      },
      // onError: (fetchError: Error) => { // Можна буде додати обробку помилок
      //   setError(fetchError.message || 'Помилка оновлення даних');
      //   setIsLoading(false); // Також вимкнути завантаження при помилці
      // }
    };

    serviceStatusNotifier.subscribe(observer);
    serviceStatusNotifier.startPolling(10000); // Запускаємо/підтверджуємо polling

    // Якщо на момент підписки даних немає і Notifier не завантажує їх,
    // і ще не було першого завантаження, то setIsLoading(true)
    // Ця логіка вже частково покрита ініціалізацією useState вище.
    // Можна перевірити ще раз:
    if (serviceStatusNotifier.currentServices.length === 0 && !serviceStatusNotifier.isFetching && !serviceStatusNotifier.hasFetchedOnce) {
        setIsLoading(true);
        // Notifier сам повинен ініціювати fetch при subscribe або startPolling, якщо потрібно
    }


    return () => {
      serviceStatusNotifier.unsubscribe(observer);
      // Зазвичай не зупиняємо polling, якщо можуть бути інші спостерігачі
      // або якщо додаток завжди має тримати дані актуальними.
      // Якщо треба зупиняти:
      // if (serviceStatusNotifier['observers'].length === 0) { // Потрібно буде зробити observers публічним або додати метод
      //   serviceStatusNotifier.stopPolling();
      // }
    };
  }, [isLoading]); // Залишаємо isLoading тут для коректного вимкнення

  if (isLoading) {
    return <div className="text-center py-10">Завантаження статусів...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Помилка: {error}</div>;
  }

  if (services.length === 0) { // Не додаємо !isLoading, бо стан помилки вже оброблено
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