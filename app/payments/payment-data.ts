/**
 * Datos simulados del flujo de pago de remesas (hasta integrar
 * SearchCashPickUp, GetCustomerInformation y PayCashPickUp).
 * Las reglas de cumplimiento replican las dependencias de
 * public/templates/payment.snapshot.json.
 */

export type OperationStatus = "available" | "onHold" | "paid";

export type CustomerProfile = {
  documentType: string;
  documentNumber: string;
  documentCountry: string;
  documentIssueDate: string;
  documentExpiryDate: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  birthCountry: string;
  nationality: string;
  gender: string;
  email: string;
  residenceCountry: string;
  street: string;
  houseNumber: string;
  address2: string;
  zone: string;
  department: string;
  city: string;
  postalCode: string;
  phoneCode: string;
  phone: string;
  isPep: boolean;
  isPepRelated: boolean;
};

export type PaymentOperation = {
  number: string;
  provider: "RIA" | "WU" | "MONEYGRAM";
  status: OperationStatus;
  amount: number;
  currency: string;
  exchangeRate: number;
  originCountry: string;
  senderName: string;
  beneficiaryName: string;
  /** Documento que declaró el remitente; el cajero lo valida contra el físico. */
  declaredDocument: {
    type: string;
    country: string;
    number: string;
  };
  /** Datos del beneficiario que trae la transacción. */
  transactionData: Partial<CustomerProfile>;
  /** Ficha del cliente en CIS si ya cobró o envió antes. */
  existingCustomer: CustomerProfile | null;
  /** Información  que ya declaró el cliente en operaciones anteriores. */
  knownUifData?: Record<string, string>;
};

const JORGE_PROFILE: CustomerProfile = {
  documentType: "Cédula",
  documentNumber: "7807365",
  documentCountry: "Bolivia",
  documentIssueDate: "2020-01-01",
  documentExpiryDate: "2030-01-01",
  firstName: "Jorge",
  middleName: "",
  lastName: "Céspedes",
  secondLastName: "",
  birthDate: "1988-04-12",
  birthCountry: "Bolivia",
  nationality: "Bolivia",
  gender: "Masculino",
  email: "",
  residenceCountry: "Bolivia",
  street: "Las Palmas",
  houseNumber: "125",
  address2: "",
  zone: "Equipetrol",
  department: "Santa Cruz",
  city: "Santa Cruz de la Sierra",
  postalCode: "",
  phoneCode: "+591",
  phone: "71948652",
  isPep: false,
  isPepRelated: false,
};

export const PAYMENT_OPERATIONS: PaymentOperation[] = [
  {
    number: "12090991105",
    provider: "RIA",
    status: "available",
    amount: 975,
    currency: "BOB",
    exchangeRate: 1,
    originCountry: "Spain",
    senderName: "Mario Moreno",
    beneficiaryName: "Jorge Céspedes",
    declaredDocument: { type: "Cédula", country: "Bolivia", number: "7807365" },
    transactionData: {
      firstName: "Jorge",
      lastName: "Céspedes",
      street: "Las Palmas",
      houseNumber: "125",
      phoneCode: "+591",
      phone: "71948652",
    },
    existingCustomer: JORGE_PROFILE,
    knownUifData: {
      occupation: "Comerciante",
      employmentLevel: "Dueño/a",
      economicActivity: "Comercio",
      employer: "Comercial Céspedes",
      position: "Propietario",
      workAddress: "Mercado Los Pozos, puesto 14",
      monthlyIncome: "3.001 a 7.000 BOB",
      workStartDate: "2015-03-01",
      civilStatus: "Soltero/a",
      idExtensionPlace: "Santa Cruz",
    },
  },
  {
    number: "12090991200",
    provider: "RIA",
    status: "available",
    amount: 15400,
    currency: "BOB",
    exchangeRate: 1,
    originCountry: "United States",
    senderName: "Lucía Fernández Vargas",
    beneficiaryName: "Ana María Quispe",
    declaredDocument: { type: "Cédula", country: "Bolivia", number: "6543210" },
    transactionData: {
      firstName: "Ana",
      middleName: "María",
      lastName: "Quispe",
      street: "Av. Busch",
      houseNumber: "1450",
      // El proveedor envía el teléfono con el prefijo del país.
      phone: "59176543210",
    },
    existingCustomer: null,
  },
  {
    number: "12090991300",
    provider: "RIA",
    status: "available",
    amount: 15400,
    currency: "BOB",
    exchangeRate: 1,
    originCountry: "Spain",
    senderName: "Mario Moreno",
    beneficiaryName: "Jorge Céspedes",
    declaredDocument: { type: "Cédula", country: "Bolivia", number: "7807365" },
    transactionData: {
      firstName: "Jorge",
      lastName: "Céspedes",
      street: "Las Palmas",
      houseNumber: "125",
      phoneCode: "+591",
      phone: "71948652",
    },
    existingCustomer: JORGE_PROFILE,
    knownUifData: {
      occupation: "Comerciante",
      employmentLevel: "Dueño/a",
      economicActivity: "Comercio",
      employer: "Comercial Céspedes",
      position: "Propietario",
      workAddress: "Mercado Los Pozos, puesto 14",
      monthlyIncome: "3.001 a 7.000 BOB",
      workStartDate: "2015-03-01",
      civilStatus: "Soltero/a",
      idExtensionPlace: "Santa Cruz",
    },
  },
  {
    number: "12090990000",
    provider: "RIA",
    status: "onHold",
    amount: 3200,
    currency: "BOB",
    exchangeRate: 1,
    originCountry: "Argentina",
    senderName: "Pedro Gómez",
    beneficiaryName: "Luis Mamani",
    declaredDocument: { type: "Cédula", country: "Bolivia", number: "5550001" },
    transactionData: {},
    existingCustomer: null,
  },
  {
    number: "12090991111",
    provider: "RIA",
    status: "paid",
    amount: 500,
    currency: "BOB",
    exchangeRate: 1,
    originCountry: "Chile",
    senderName: "Rosa Díaz",
    beneficiaryName: "Carla Rojas",
    declaredDocument: { type: "Cédula", country: "Bolivia", number: "4440002" },
    transactionData: {},
    existingCustomer: null,
  },
];

export const AGENCY_COUNTRY = "Bolivia";
export const AGENCY_PHONE_CODE = "+591";
export const AGENCY_CASH_BOB = 20000;

/** Umbral  (Valor envío / Monto a pagar >= 13.720 BOB, ~2.000 USD). */
export const UIF_AMOUNT_THRESHOLD = 13720;
/** Umbral para exigir origen de los fondos (>= 6.860 BOB, ~1.000 USD). */
export const FUNDS_ORIGIN_THRESHOLD = 6860;
/**
 * Países de origen de alto riesgo según la regla "País Origen >> Ocupación"
 * (nombres como en catalog-countries.json).
 */
export const HIGH_RISK_ORIGIN_COUNTRIES = [
  "Albania",
  "Burkina Faso",
  "Gibraltar",
  "Haiti",
  "Jamaica",
  "Jordan",
  "Cambodia",
  "Morocco",
  "Malta",
  "Mali",
  "Pakistan",
  "Panama",
  "Senegal",
  "Sudan",
  "Syria",
  "Uganda",
  "Yemen",
  "Korea South",
  "Lebanon",
  "Benin",
  "Ivory Coast",
  "Cameroon",
  "Myanmar",
  "Togo",
];

export const BOLIVIA_DEPARTMENTS: Record<string, string[]> = {
  "La Paz": ["La Paz", "El Alto", "Viacha", "Copacabana"],
  "Santa Cruz": ["Santa Cruz de la Sierra", "Montero", "Warnes", "Cotoca"],
  Cochabamba: ["Cochabamba", "Quillacollo", "Sacaba", "Tiquipaya"],
  Chuquisaca: ["Sucre", "Monteagudo", "Camargo"],
  Oruro: ["Oruro", "Challapata", "Huanuni"],
  Potosí: ["Potosí", "Uyuni", "Tupiza", "Villazón"],
  Tarija: ["Tarija", "Yacuiba", "Bermejo", "Villamontes"],
  Beni: ["Trinidad", "Riberalta", "Guayaramerín"],
  Pando: ["Cobija", "Porvenir"],
};

export const GENDER_OPTIONS = ["Femenino", "Masculino"];
export const PHONE_CODE_OPTIONS = ["+591", "+54", "+56", "+51", "+34", "+1"];
export const OCCUPATION_OPTIONS = [
  "Abogado/a",
  "Administrador/a",
  "Comerciante",
  "Docente",
  "Empleado/a privado/a",
  "Estudiante",
  "Funcionario/a público/a",
  "Independiente",
  "Jubilado/a",
  "Labores de casa",
];
export const EMPLOYMENT_LEVEL_OPTIONS = [
  "Dueño/a",
  "Gerente / Director/a",
  "Mando medio",
  "Operativo/a",
  "No aplica",
];
export const ECONOMIC_ACTIVITY_OPTIONS = [
  "Comercio",
  "Construcción",
  "Educación",
  "Servicios",
  "Transporte",
  "Agricultura",
  "Sin actividad",
];
export const CIVIL_STATUS_OPTIONS = [
  "Soltero/a",
  "Casado/a",
  "Unión libre",
  "Divorciado/a",
  "Viudo/a",
];
export const FUNDS_ORIGIN_OPTIONS = [
  "Ahorros del remitente",
  "Salario del remitente",
  "Venta de bienes",
  "Préstamo",
  "Herencia",
];
export const PURPOSE_OPTIONS = [
  "Manutención familiar",
  "Educación",
  "Salud",
  "Ahorro",
  "Compra de bienes",
  "Pago de deudas",
];
export const SENDER_RELATION_OPTIONS = [
  "Familiar",
  "Cónyuge",
  "Amigo/a",
  "Empleador/a",
  "Socio/a comercial",
];
export const MONTHLY_INCOME_OPTIONS = [
  "Hasta 3.000 BOB",
  "3.001 a 7.000 BOB",
  "7.001 a 14.000 BOB",
  "Más de 14.000 BOB",
];
export const PEP_RELATION_OPTIONS = [
  "Cónyuge",
  "Padre / Madre",
  "Hijo/a",
  "Hermano/a",
  "Socio/a",
  "Colaborador/a cercano/a",
];
export const PUBLIC_OFFICE_OPTIONS = [
  "Poder Ejecutivo",
  "Poder Legislativo",
  "Poder Judicial",
  "Fuerzas Armadas / Policía",
  "Empresa pública",
  "Organismo internacional",
];

const bobFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

export const formatAmount = (value: number) => bobFormatter.format(value);

export const formatMoney = (value: number, currency = "BOB") =>
  `${formatAmount(value)} ${currency}`;

/** Agrupa el número de operación para dictarlo: 1209 0991 105. */
export const formatOperationNumber = (value: string) =>
  value.replace(/(\d{4})(?=\d)/g, "$1 ");

export function maskName(name: string) {
  return name
    .split(" ")
    .map((part) =>
      part.length <= 3
        ? part
        : `${part.slice(0, 3)}${"•".repeat(part.length - 3)}`,
    )
    .join(" ");
}

export function maskDocument(value: string) {
  return `${"•".repeat(Math.max(0, value.length - 3))}${value.slice(-3)}`;
}

export function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Separa "59176543210" en código +591 y número local. */
export function splitPhone(raw: string | undefined) {
  if (!raw) return { phoneCode: AGENCY_PHONE_CODE, phone: "" };
  const digits = raw.replace(/\D/g, "");
  const code = PHONE_CODE_OPTIONS.map((item) => item.slice(1))
    .sort((a, b) => b.length - a.length)
    .find((item) => digits.startsWith(item) && digits.length > item.length + 6);
  if (!code) return { phoneCode: AGENCY_PHONE_CODE, phone: digits };
  return { phoneCode: `+${code}`, phone: digits.slice(code.length) };
}

const BOB_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1];

/** Desglose sugerido de billetes y monedas para entregar el efectivo. */
export function cashBreakdown(amount: number) {
  let remaining = Math.round(amount * 100);
  const lines: { value: number; count: number }[] = [];
  for (const value of BOB_DENOMINATIONS) {
    const cents = Math.round(value * 100);
    const count = Math.floor(remaining / cents);
    if (count > 0) {
      lines.push({ value, count });
      remaining -= count * cents;
    }
  }
  return lines;
}
