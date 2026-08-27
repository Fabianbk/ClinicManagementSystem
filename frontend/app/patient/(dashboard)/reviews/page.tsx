import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPatient } from "@/lib/resources/patients";
import { getReviewByPatientId } from "@/lib/resources/reviews";
import { PatientReviewClient } from "@/components/patient/PatientReviewClient";

export default async function PatientReviewsPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  const patient = await getPatient(session.id).catch(() => null);
  if (!patient) {
    return (
      <div className="p-8 bg-white rounded-card border border-clinic-line shadow-xs text-center space-y-2">
        <h2 className="text-xl font-bold text-clinic-danger">ไม่พบข้อมูลผู้รับบริการ</h2>
        <p className="text-clinic-ink-soft text-xs">กรุณาติดต่อเจ้าหน้าที่คลินิกพิมพ์วิมาน</p>
      </div>
    );
  }

  // Fetch existing review if any
  const existingReview = await getReviewByPatientId(session.id).catch(() => null);

  return (
    <PatientReviewClient
      patientId={session.id}
      patientFullname={patient.fullname}
      initialReview={existingReview}
    />
  );
}
