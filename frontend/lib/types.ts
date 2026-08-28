export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ---------- Enums ----------

export type AppointmentSlotStatus = "AVAILABLE" | "BOOKED" | "BLOCKED";
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

// ---------- Auth ----------

export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  role: "DOCTOR" | "PATIENT";
  id: number;
  username: string;
  fullname: string;
}

// ---------- Doctor ----------

export interface DoctorRequestDTO {
  username: string;
  password: string;
  fullname: string;
  physicianLicenseNo: string;
}

export interface DoctorUpdateRequestDTO {
  username: string;
  fullname: string;
  physicianLicenseNo: string;
}

export interface DoctorChangePasswordRequestDTO {
  newPassword: string;
}

export interface DoctorResponseDTO {
  doctorId: number;
  username: string;
  fullname: string;
  physicianLicenseNo: string;
}

// ---------- Patient + nested ----------

export interface ContactPersonRequestDTO {
  contactName: string;
  relationship?: string;
  contactAddress?: string;
  mobileNumber?: string;
}

export interface ContactPersonResponseDTO {
  contactId: number;
  contactName: string;
  relationship: string | null;
  contactAddress: string | null;
  mobileNumber: string | null;
}

export interface PrincipleRequestDTO {
  principleDhatu?: string;
  secondaryDhatu?: string;
  elementaryPrinciples?: string;
  seasonalPrinciples?: string;
  agePrinciples?: string;
  timePrinciples?: string;
  geographicPrinciples?: string;
}

export interface PrincipleResponseDTO extends Required<PrincipleRequestDTO> {
  principleId: number;
}

export interface HealthProfileRequestDTO {
  presentHistory?: string;
  underlyingDisease?: string;
  hereditaryDisease?: string;
  drugAllergy?: string;
  foodAllergy?: string;
  accidentHistory?: string;
  personalHistory?: string;
  alcoholConsumption?: string;
  smokingHistory?: string;
  menstruation?: string;
}

export interface HealthProfileResponseDTO extends Required<HealthProfileRequestDTO> {
  healthId: number;
}

export type IdType = "THAI_ID" | "PASSPORT";
export type Gender = "MALE" | "FEMALE";
export type MaritalStatus =
  | "SINGLE"
  | "IN_RELATIONSHIP"
  | "MARRIED"
  | "WIDOWED"
  | "SEPARATED"
  | "DIVORCED"
  | "MONK";
export type BloodGroupAbo = "A" | "B" | "AB" | "O" | "UNKNOWN";
export type BloodGroupRh = "POSITIVE" | "NEGATIVE" | "UNKNOWN";
export type HouseholdStatus = "HEAD_OF_HOUSEHOLD" | "RESIDENT";
export type TreatmentRights =
  | "PAY_DIRECT"
  | "ELDERLY"
  | "MONK"
  | "DISABLED"
  | "OTHER";

export interface PatientRequestDTO {
  fullname: string;
  idType: IdType;
  nationalId?: string;
  passportNo?: string;
  gender: Gender;
  dateOfBirth: string; // ISO date string over the wire
  thaiCalendarBirthDate?: string;
  occupation?: string;
  maritalStatus?: MaritalStatus;
  citizenship?: string;
  ethnicity?: string;
  religion?: string;
  bloodGroupAbo?: BloodGroupAbo;
  bloodGroupRh?: BloodGroupRh;
  treatmentRights?: TreatmentRights;

  // Structured Address
  houseNo?: string;
  moo?: string;
  soi?: string;
  road?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  zipCode?: string;

  // Thai-Specific Master Data
  birthPlace?: string;
  originalDomicile?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  householdStatus?: HouseholdStatus;
  education?: string;

  // Contact
  mobileNumber: string;
  email?: string;

  contactPersons?: ContactPersonRequestDTO[];
  principle?: PrincipleRequestDTO;
  healthProfile?: HealthProfileRequestDTO;
}

export interface PatientResponseDTO {
  patientId: number;
  fullname: string;
  idType: IdType;
  nationalId?: string | null;
  passportNo?: string | null;
  idNumber: string; // Unified display ID

  gender: Gender;
  dateOfBirth: string;
  thaiCalendarBirthDate?: string | null;
  occupation?: string | null;
  maritalStatus?: MaritalStatus | null;
  marital?: string | null; // Backward compatibility alias
  citizenship?: string | null;
  nationality?: string | null; // Backward compatibility alias
  ethnicity?: string | null;
  ethnic?: string | null; // Backward compatibility alias
  religion?: string | null;

  bloodGroupAbo?: BloodGroupAbo | null;
  bloodGroupRh?: BloodGroupRh | null;
  bloodGroup?: string | null; // Unified e.g. "O+" or "A-"

  treatmentRights?: TreatmentRights | null;

  // Structured Address
  houseNo?: string | null;
  moo?: string | null;
  soi?: string | null;
  road?: string | null;
  subDistrict?: string | null;
  district?: string | null;
  province?: string | null;
  zipCode?: string | null;
  address?: string | null; // Full address string

  // Thai-Specific Master Data
  birthPlace?: string | null;
  originalDomicile?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  spouseName?: string | null;
  householdStatus?: HouseholdStatus | null;
  education?: string | null;

  // Contact
  mobileNumber: string;
  email: string | null;

  contactPersons: ContactPersonResponseDTO[] | null;
  principle: PrincipleResponseDTO | null;
  healthProfile: HealthProfileResponseDTO | null;
}

export interface PatientAccountRequestDTO {
  patientId: number;
  username: string;
  password: string;
}

export interface PatientAccountResponseDTO {
  username: string;
  patientId: number;
}

// ---------- Working Schedule / Slots ----------

export interface WorkingScheduleRequestDTO {
  doctorId: number;
  date: string;
  shiftStart: string; // ISO datetime string
  shiftEnd: string;
}

export interface WorkingScheduleResponseDTO {
  scheduleId: number;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  doctorId: number;
  doctorFullname: string;
}

export interface AppointmentSlotRequestDTO {
  scheduleId: number;
  startTime: string;
  endTime: string;
  status: AppointmentSlotStatus;
}

export interface AppointmentSlotResponseDTO {
  slotId: number;
  startTime: string;
  endTime: string;
  status: AppointmentSlotStatus;
  scheduleId: number;
  doctorId: number;
  doctorFullname: string;
}

// ---------- Appointment ----------

export interface AppointmentRequestDTO {
  patientId: number;
  slotId: number;
}

export interface AppointmentResponseDTO {
  appointmentId: number;
  status: AppointmentStatus;
  patientId: number;
  patientFullname: string;
  slotId: number;
  slotStartTime: string;
  slotEndTime: string;
  doctorId: number;
  doctorFullname: string;
}

// ---------- Record Treatment ----------

export interface RecordTreatmentRequestDTO {
  appointmentId?: number;
  patientId?: number;
  doctorId: number;
  recordDate: string;
  symptoms?: string;
  temp?: number;
  pulse?: number;
  respirationRate?: number;
  bp?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  causeOfSymptoms?: string;
  summaryOfSickness?: string;
  diagnosisElements?: string;
  ttmDiagnosis?: string;
  modernDiagnosis?: string;
  treatmentPlan?: string;
  treatmentProgram?: string;
  suggestions?: string;
  followup?: string;
  painScoreBefore?: number;
  painScoreAfter?: number;
  principle?: PrincipleRequestDTO;
  healthProfile?: HealthProfileRequestDTO;
}

export interface RecordTreatmentMedicineRequestDTO {
  recordTreatmentId: number;
  medicineId: number;
  quantity: number;
}

export interface RecordTreatmentMedicineResponseDTO {
  recordTreatmentMedicineId: number;
  quantity: number;
  priceAtTime: number;
  subTotal: number;
  medicineId: number;
  medicineName: string;
}

export interface ReceiptRequestDTO {
  recordTreatmentId: number;
  receiptDate: string;
  paymentStatus: string;
  paymentMethod?: string;
}

export interface ReceiptResponseDTO {
  receiptId: number;
  receiptDate: string;
  paymentStatus: string;
  paymentMethod: string | null;
  totalPrice: number;
  recordTreatmentId: number;
}

export interface RecordTreatmentResponseDTO {
  recordTreatmentId: number;
  recordDate: string;
  symptoms: string | null;
  temp: number | null;
  pulse: number | null;
  respirationRate: number | null;
  bp: string | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  causeOfSymptoms: string | null;
  summaryOfSickness: string | null;
  diagnosisElements: string | null;
  ttmDiagnosis: string | null;
  modernDiagnosis: string | null;
  treatmentPlan: string | null;
  treatmentProgram: string | null;
  suggestions: string | null;
  followup: string | null;
  painScoreBefore: number | null;
  painScoreAfter: number | null;
  doctorId: number;
  doctorFullname: string;
  appointmentId: number;
  patientId: number;
  patientFullname: string;
  recordTreatmentMedicines: RecordTreatmentMedicineResponseDTO[] | null;
  receipt: ReceiptResponseDTO | null;
  healthProfile?: HealthProfileResponseDTO | null;
}

// ---------- Medicine ----------

export interface MedicineRequestDTO {
  medicineName: string;
  medicineCategory?: string;
  unitPrice: number;
  unitType?: string;
  stockRemaining?: number;
  stockBroughtForward?: number;
  stockReceived?: number;
  stockIssued?: number;
  note?: string;
}

export interface MedicineResponseDTO {
  medicineId: number;
  medicineName: string;
  medicineCategory: string | null;
  unitPrice: number;
  unitType: string | null;
  stockRemaining: number | null;
  stockBroughtForward: number | null;
  stockReceived: number | null;
  stockIssued: number | null;
  note: string | null;
}

// ---------- Review ----------

export interface ReviewRequestDTO {
  patientId: number;
  ratingClinicScore: number;
  comment?: string;
  reviewDate: string;
}

export interface ReviewResponseDTO {
  reviewId: number;
  ratingClinicScore: number;
  comment: string | null;
  reviewDate: string;
  patientId: number;
  patientFullname: string;
}

// ---------- Notify Appointment ----------

export interface NotifyAppointmentResponseDTO {
  appointmentId: number;
  status: AppointmentStatus;
  slotStartTime: string;
  slotEndTime: string;
  doctorId: number;
  doctorFullname: string;
  message: string;
}