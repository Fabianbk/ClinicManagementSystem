/**
 * ข้อมูลทางการของ พิมพ์วิมาน คลินิกการแพทย์แผนไทย
 * ใช้เป็น Single Source of Truth สำหรับหัวเอกสารการพิมพ์ A4, ใบรับรองแพทย์,
 * บัตร OPD และใบสั่งการรักษา
 */
export const CLINIC_INFO = {
  nameTh: "พิมพ์วิมาน คลินิกการแพทย์แผนไทย",
  nameEn: "Pimvimaan Thai Traditional Medicine Clinic",
  licenseNo: "58108000161",
  addressTh: "304/5 หมู่ 8 (ตลาดวันพุธ) ต.เวียงใต้ อ.ปาย จ.แม่ฮ่องสอน 58130",
  addressEn: "304/5 Moo 8 (Wednesday Market), Wiang Tai, Pai, Mae Hong Son 58130",
  phone: "081-9358026",
  defaultDoctorName: "พท.ว. พิมพ์วิมาน เบ็กเคอร์",
  defaultDoctorLicenseNo: "พท.ว. 20173",
} as const;
