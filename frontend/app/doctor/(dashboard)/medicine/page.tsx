import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAllMedicines } from "@/lib/resources/medicines";
import { MedicineManagerClient } from "@/components/doctor/MedicineManagerClient";
import type { PageResponse, MedicineResponseDTO } from "@/lib/types";

export default async function DoctorMedicinePage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  let medicinesData: PageResponse<MedicineResponseDTO> | null = null;
  try {
    medicinesData = await getAllMedicines(0, 100);
  } catch (err) {
    console.error("Failed to fetch medicine list:", err);
  }

  return <MedicineManagerClient initialData={medicinesData} />;
}
