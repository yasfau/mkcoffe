export const ORDER_STATUSES = ["PENDING", "PROCESSING", "READY", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Menunggu",
  PROCESSING: "Diproses",
  READY: "Siap",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  PROCESSING: "bg-blue-100 text-blue-900",
  READY: "bg-green-100 text-green-900",
  COMPLETED: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-red-100 text-red-800",
};
