export type OrderType = "dine_in" | "takeout";

// Espejo de OrderPipelineStatus / OrderPaymentStatus del backend (src/models/order.py).
// `accepted` cubre dos momentos que se distinguen por paymentStatus:
//   pending -> la cocina dijo que sí y falta que el cliente pague (ya hay link de pago)
//   paid    -> el pago se confirmó y el pedido está en cola para preparar
export type OrderPipelineStatus =
  | "pending_acceptance"
  | "accepted"
  | "in_preparation"
  | "ready_for_pickup"
  | "delivered"
  | "rejected"
  | "cancelled";

export type OrderPaymentStatus = "pending" | "paid" | "failed";

export interface OrderItem {
  id: string;
  // Id del producto en el menú: lo pide el rechazo por falta de stock.
  menuItemId?: string;
  name: string;
  quantity: number;
  // Modificadores elegidos ("Sin cebolla", "Extra queso"): el KDS los muestra aparte del producto.
  modifiers?: string[];
  // Nota libre del cliente para este producto.
  note?: string;
  // Clave del icono de su categoría (accesibilidad: el KDS lo muestra junto al nombre).
  categoryIcon?: string;
}

// Motivo con el que la cocina rechaza una solicitud pendiente (POST /api/orders/{id}/reject).
//   kitchen_load: pasa a la siguiente estación; si no queda ninguna, se rechaza con un "intenta más tarde".
//   out_of_stock: rechazo definitivo; los productos indicados se desactivan del menú por hoy.
export type RejectReason = "kitchen_load" | "out_of_stock";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: OrderType;
  createdAt: string;
  items: OrderItem[];
  pipelineStatus: OrderPipelineStatus;
  paymentStatus: OrderPaymentStatus;
  // Se llena cuando la cocina acepta el pedido (payment_reference en el backend).
  paymentLink?: string;
  // Cuándo la cocina aceptó el pedido (ISO).
  acceptedAt?: string;
  // Hora a la que el cliente quiere recoger el pedido (ISO). Sin valor = "lo antes posible".
  requestedReadyTime?: string;
  // Cuándo debe empezar a prepararse para llegar a tiempo (ISO, lo calcula el backend al pagar).
  prepStartTime?: string;
  // Hora estimada en que el pedido queda listo (ISO).
  readyAt?: string;
  // Código (OTP) que el cliente entrega en mostrador.
  deliveryCode: string;
}

// Respuesta de POST /auth/kds/login.
export interface KdsSession {
  accessToken: string;
  kdsUserId: string;
  username: string;
  restaurantId: string | null;
  restaurantName: string;
}

// Estado de la estación autenticada (GET /api/kds/me). active = false: en pausa, no recibe
// solicitudes nuevas. Si todas las estaciones del restaurante están en pausa, el chatbot lo
// ve como cerrado (kitchen_out_of_service).
export interface KdsStationState {
  kdsUserId: string;
  username: string;
  active: boolean;
}

// Mensaje del WebSocket /ws/kds cuando la estación se pausa o reanuda (desde cualquier
// pantalla con la misma sesión o desde el panel de administración).
export interface KdsStationStatusMessage {
  type: "station_status";
  kds_user_id: string;
  active: boolean;
}

// Producto del menú tal como lo ve la estación KDS para activarlo/desactivarlo.
// Cómo se apaga un producto desde el KDS: "daily" = solo por hoy (hora de Guatemala; vuelve solo al
// día siguiente) · "permanent" = hasta que alguien lo encienda a mano.
export type MenuOffMode = "daily" | "permanent";

export interface KdsMenuItem {
  id: string;
  name: string;
  category: string;
  // Clave del icono de la categoría (ver @repo/category-icons).
  categoryIcon?: string;
  price: number;
  // Disponibilidad efectiva (la que ve el chat): false si está apagado, permanente o por hoy.
  available: boolean;
  // Por qué está apagado (null si está encendido). Sirve para la etiqueta "por hoy".
  inactiveMode: MenuOffMode | null;
}

// --- Auth / registro de estudiantes (WhatsApp + OTP por correo) ------------
// Nombres de campo calcados de src/schemas/auth.py (GP-Agent-Backend) --
// la API los espera tal cual, en snake_case.

export interface RegisterIn {
  whatsapp_number: string; // E.164 con prefijo Guatemala, ej. "+50255551234"
  full_name: string;
  email: string;
  student_id: string;
  confirm_replace?: boolean;
}

export interface RegisterOut {
  status: string; // "sent"
  detail: string;
  expires_in_minutes: number;
  debug_otp_code?: string | null; // solo si el backend corre en ENVIRONMENT=DEVELOPMENT
}

export interface VerifyOtpIn {
  whatsapp_number: string;
  otp_code: string;
}

export interface VerifyOtpOut {
  status: string; // "verified"
  message: string;
}

// Cuerpo del error 409 de /auth/register (correo ya vinculado a otro número).
export interface RegistrationConflictDetail {
  message: string;
  existing_number_masked: string;
  hint: string;
}
