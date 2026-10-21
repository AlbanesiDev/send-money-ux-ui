import {
  AGENCY_COUNTRY,
  AGENCY_PHONE_CODE,
  FUNDS_ORIGIN_THRESHOLD,
  HIGH_RISK_ORIGIN_COUNTRIES,
  UIF_AMOUNT_THRESHOLD,
  convertUsdToBob,
  formatMoney,
  splitPhone,
  type CustomerProfile,
  type PaymentOperation,
} from "./payment-data";

export type ProfileField = keyof CustomerProfile;

export type ProfileForm = Record<
  Exclude<ProfileField, "isPep" | "isPepRelated">,
  string
> & {
  noIssueDate: boolean;
  noExpiryDate: boolean;
};

export const PROFILE_LABELS: Record<keyof ProfileForm, string> = {
  documentType: "Tipo de documento",
  documentNumber: "Número de documento",
  documentCountry: "País de emisión",
  documentIssueDate: "Fecha de emisión",
  documentExpiryDate: "Fecha de vigencia",
  noIssueDate: "Sin fecha de emisión",
  noExpiryDate: "Sin fecha de vigencia",
  firstName: "Nombre",
  middleName: "Segundo nombre",
  lastName: "Primer apellido",
  secondLastName: "Segundo apellido",
  birthDate: "Fecha de nacimiento",
  birthCountry: "País de nacimiento",
  nationality: "Nacionalidad",
  gender: "Género",
  email: "Correo electrónico",
  residenceCountry: "País de residencia",
  street: "Calle",
  houseNumber: "Número de casa",
  address2: "Depto. / referencia",
  zone: "Zona",
  department: "Departamento",
  city: "Ciudad",
  postalCode: "Código postal",
  phoneCode: "Código",
  phone: "Teléfono",
};

export function isRequiredProfileField(
  field: keyof ProfileForm,
  form: ProfileForm,
) {
  if (field === "documentIssueDate") return !form.noIssueDate;
  if (field === "documentExpiryDate") return !form.noExpiryDate;
  return [
    "documentType",
    "documentNumber",
    "documentCountry",
    "firstName",
    "lastName",
    "birthDate",
    "birthCountry",
    "nationality",
    "gender",
    "residenceCountry",
    "street",
    "houseNumber",
    "zone",
    "department",
    "city",
    "phoneCode",
    "phone",
  ].includes(field);
}

const today = () => new Date().toISOString().slice(0, 10);

export const isExpired = (form: ProfileForm) =>
  !form.noExpiryDate &&
  form.documentExpiryDate !== "" &&
  form.documentExpiryDate < today();

/** Campos obligatorios vacíos o vencidos que bloquean el pago. */
export function missingProfileFields(form: ProfileForm) {
  const missing = (Object.keys(PROFILE_LABELS) as (keyof ProfileForm)[]).filter(
    (field) => {
      if (field === "noIssueDate" || field === "noExpiryDate") return false;
      return isRequiredProfileField(field, form) && !String(form[field]).trim();
    },
  );
  if (isExpired(form)) missing.push("documentExpiryDate");
  return missing;
}

/**
 * Ficha inicial: la del cliente si ya existe en CIS; si no, los datos que
 * trae la transacción más los valores por defecto de la agencia.
 */
export function buildInitialProfile(operation: PaymentOperation): ProfileForm {
  const source: Partial<CustomerProfile> = operation.existingCustomer ?? {
    documentType: operation.declaredDocument.type,
    documentNumber: operation.declaredDocument.number,
    documentCountry: operation.declaredDocument.country,
    birthCountry: AGENCY_COUNTRY,
    nationality: AGENCY_COUNTRY,
    residenceCountry: AGENCY_COUNTRY,
    ...operation.transactionData,
  };
  const phone = source.phoneCode
    ? { phoneCode: source.phoneCode, phone: source.phone ?? "" }
    : splitPhone(source.phone);
  return {
    documentType: source.documentType ?? "Cédula",
    documentNumber: source.documentNumber ?? "",
    documentCountry: source.documentCountry ?? AGENCY_COUNTRY,
    documentIssueDate: source.documentIssueDate ?? "",
    documentExpiryDate: source.documentExpiryDate ?? "",
    noIssueDate: false,
    noExpiryDate: false,
    firstName: source.firstName ?? "",
    middleName: source.middleName ?? "",
    lastName: source.lastName ?? "",
    secondLastName: source.secondLastName ?? "",
    birthDate: source.birthDate ?? "",
    birthCountry: source.birthCountry ?? AGENCY_COUNTRY,
    nationality: source.nationality ?? AGENCY_COUNTRY,
    gender: source.gender ?? "",
    email: source.email ?? "",
    residenceCountry: source.residenceCountry ?? AGENCY_COUNTRY,
    street: source.street ?? "",
    houseNumber: source.houseNumber ?? "",
    address2: source.address2 ?? "",
    zone: source.zone ?? "",
    department: source.department ?? "",
    city: source.city ?? "",
    postalCode: source.postalCode ?? "",
    phoneCode: phone.phoneCode || AGENCY_PHONE_CODE,
    phone: phone.phone,
  };
}

/** Campos que vinieron de la transacción (para marcarlos en el formulario). */
export function fieldsFromTransaction(operation: PaymentOperation) {
  const fields = new Set<string>(Object.keys(operation.transactionData));
  if (operation.transactionData.phone) fields.add("phoneCode");
  fields.add("documentType");
  fields.add("documentNumber");
  fields.add("documentCountry");
  return fields;
}

export type ComplianceFlags = {
  additionalInfo: boolean;
  pep: boolean;
  pepRelated: boolean;
  unusual: boolean;
};

export type UifField =
  | "occupation"
  | "employmentLevel"
  | "economicActivity"
  | "employer"
  | "position"
  | "workAddress"
  | "monthlyIncome"
  | "workStartDate"
  | "civilStatus"
  | "spouseName"
  | "idExtensionPlace"
  | "fundsOrigin"
  | "resourcesDestination"
  | "purpose"
  | "senderRelation"
  | "referenceName"
  | "referencePhone"
  | "publicOffice"
  | "nit"
  | "pepRelation"
  | "pepName"
  | "pepPosition"
  | "unusualReason";

export type UifForm = Record<UifField, string>;

export const EMPTY_UIF: UifForm = {
  occupation: "",
  employmentLevel: "",
  economicActivity: "",
  employer: "",
  position: "",
  workAddress: "",
  monthlyIncome: "",
  workStartDate: "",
  civilStatus: "",
  spouseName: "",
  idExtensionPlace: "",
  fundsOrigin: "",
  resourcesDestination: "",
  purpose: "",
  senderRelation: "",
  referenceName: "",
  referencePhone: "",
  publicOffice: "",
  nit: "",
  pepRelation: "",
  pepName: "",
  pepPosition: "",
  unusualReason: "",
};

const ADDITIONAL_INFO_FIELDS: UifField[] = [
  "occupation",
  "employmentLevel",
  "economicActivity",
  "employer",
  "position",
  "workAddress",
  "monthlyIncome",
  "workStartDate",
  "civilStatus",
  "idExtensionPlace",
  "fundsOrigin",
  "resourcesDestination",
  "purpose",
  "senderRelation",
  "referenceName",
  "referencePhone",
];

/** Motivos por los que el sistema exige el formulario . */
export function uifTriggers(operation: PaymentOperation) {
  const reasons: string[] = [];
  const amountBob = convertUsdToBob(operation.amount);
  if (amountBob >= UIF_AMOUNT_THRESHOLD)
    reasons.push(`El monto supera ${formatMoney(UIF_AMOUNT_THRESHOLD)}.`);
  if (HIGH_RISK_ORIGIN_COUNTRIES.includes(operation.originCountry))
    reasons.push(
      `${operation.originCountry} es un país de origen de alto riesgo.`,
    );
  return reasons;
}

/** Campos  obligatorios según las reglas del snapshot. */
export function requiredUifFields(
  operation: PaymentOperation,
  flags: ComplianceFlags,
  form: UifForm,
  documentType: string,
) {
  const forced = uifTriggers(operation).length > 0;
  const fields = new Set<UifField>();
  if (flags.additionalInfo || forced)
    ADDITIONAL_INFO_FIELDS.forEach((field) => fields.add(field));
  const amountBob = convertUsdToBob(operation.amount);
  if (amountBob >= FUNDS_ORIGIN_THRESHOLD) fields.add("fundsOrigin");
  if (["Casado/a", "Unión libre"].includes(form.civilStatus))
    fields.add("spouseName");
  if (documentType !== "Cédula") fields.delete("idExtensionPlace");
  if (flags.pep) fields.add("publicOffice");
  if (flags.pepRelated) {
    fields.add("pepRelation");
    fields.add("pepName");
    fields.add("pepPosition");
  }
  if (flags.unusual) fields.add("unusualReason");
  return fields;
}

export const missingUifFields = (required: Set<UifField>, form: UifForm) =>
  [...required].filter((field) => !form[field].trim());
