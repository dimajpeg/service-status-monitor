import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const mockServices = [
    {
      id: "auth-service",
      name: "Сервіс Авторизації",
      status: "ERROR", // ЗМІНЕНИЙ СТАТУС
      lastChecked: new Date().toISOString(), // Можна не чіпати, або оновити для реалістичності
      details: "Критична помилка в сервісі авторизації!" // ЗМІНЕНІ ДЕТАЛІ
    },
    {
      id: "payment-service",
      name: "Платіжний Сервіс",
      status: "WARNING",
      lastChecked: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 хвилин тому
      details: "Високе навантаження, можливі затримки",
    },
    {
      id: "notification-service",
      name: "Сервіс Сповіщень",
      status: "ERROR",
      lastChecked: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 хвилин тому
      details: "Не вдалося підключитися до бази даних",
    },
    {
      id: "user-profile-service",
      name: "Сервіс Профілів Користувачів",
      status: "OK",
      lastChecked: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 хвилини тому
      details: "Працює стабільно",
    },
  ];

  // Імітація невеликої затримки, як у реальному API
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockServices);
}
