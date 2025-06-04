// components/ServiceStatusCard.tsx
import React from 'react';
import { Service } from '@/types/service'; // Імпортуємо наш тип

interface ServiceStatusCardProps {
  service: Service;
}

const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ service }) => {
  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'OK':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'WARNING':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'ERROR':
        return 'bg-red-100 border-red-500 text-red-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };
  
  return (
    <div
      className={`p-4 border rounded-lg shadow-md ${getStatusColor(service.status)}`}
    >
      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
      <p className="text-sm mb-1">
        <span className="font-medium">Статус:</span> {service.status}
      </p>
      <p className="text-sm mb-1">
        <span className="font-medium">Остання перевірка:</span>{' '}
        {new Date(service.lastChecked).toLocaleString('uk-UA')}
      </p>
      <p className="text-sm">
        <span className="font-medium">Деталі:</span> {service.details}
      </p>
    </div>
  );
};

export default ServiceStatusCard;