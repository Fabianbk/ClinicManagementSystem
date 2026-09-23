import type { PatientResponseDTO } from "@/lib/types";

interface PatientIntakeEnViewProps {
  patient?: PatientResponseDTO | null;
}

export function PatientIntakeEnView({ patient }: PatientIntakeEnViewProps) {
  const isBlank = !patient;

  const age = patient?.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "";

  const formattedDob = patient?.dateOfBirth
    ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const emergency = patient?.contactPersons?.[0];

  return (
    <main className="a4-sheet text-slate-900 text-xs leading-relaxed space-y-4 font-body">
      {/* Clinic Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3">
        <h2 className="text-base font-bold text-slate-900 leading-tight">
          Pimvimaan Thai Traditional Medicine Clinic
        </h2>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Clinic License No. 10108002264 · Tel. (+66) 081-9358026
        </p>
        <h3 className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-wide">
          PATIENT&apos;S PERSONAL DATA (INTAKE FORM)
        </h3>
      </div>

      {/* Top Identifiers */}
      <div className="p-3 border border-slate-400 rounded-xs bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Passport / ID No.:</span>
          <span className="font-mono font-bold text-sm bg-white border border-slate-400 px-2.5 py-0.5 rounded-xs">
            {patient?.passportNo || patient?.nationalId || <span className="text-transparent">............</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Hospital Number (HN):</span>
          <span className="font-mono font-bold text-sm text-emerald-800 bg-white border border-slate-400 px-2.5 py-0.5 rounded-xs">
            {patient ? `P-${String(patient.patientId).padStart(5, "0")}` : "P-.........."}
          </span>
        </div>
      </div>

      {/* Section 1: Personal Information */}
      <div className="border border-slate-400 p-3 rounded-xs space-y-2.5">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs uppercase tracking-wide">
          1. Personal Information
        </h4>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-12 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Full Name (First - Middle - Last):</span>
            <span className="flex-1 font-bold text-slate-900 border-b border-dotted border-slate-400 px-1">
              {patient?.fullname || <span className="text-transparent">.</span>}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Gender:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.gender === "MALE"
                ? "Male"
                : patient?.gender === "FEMALE"
                ? "Female"
                : ""}
            </span>
          </div>
          <div className="col-span-5 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Date of Birth:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {formattedDob}
            </span>
          </div>
          <div className="col-span-3 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Age:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {age ? `${age} years` : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Nationality:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.citizenship || ""}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Race / Ethnicity:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.ethnicity || ""}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Religion:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.religion || ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-7 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Occupation:</span>
            <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
              {patient?.occupation || ""}
            </span>
          </div>
          <div className="col-span-5 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Blood Group:</span>
            <span className="flex-1 font-mono font-bold text-rose-700 border-b border-dotted border-slate-400 px-1">
              {patient?.bloodGroup || patient?.bloodGroupAbo || ""}
              {patient?.bloodGroupRh === "POSITIVE" ? " (Rh+)" : patient?.bloodGroupRh === "NEGATIVE" ? " (Rh-)" : ""}
            </span>
          </div>
        </div>

        {/* Marital Status */}
        <div className="flex items-center gap-4 pt-1">
          <span className="text-slate-600 shrink-0">Marital Status:</span>
          {["Single", "Married", "Widowed", "Divorced"].map((status, i) => {
            const isChecked =
              (status === "Single" && patient?.maritalStatus === "SINGLE") ||
              (status === "Married" && patient?.maritalStatus === "MARRIED") ||
              (status === "Widowed" && patient?.maritalStatus === "WIDOWED") ||
              (status === "Divorced" && patient?.maritalStatus === "DIVORCED");
            return (
              <span key={i} className="flex items-center gap-1 font-normal">
                <span className="inline-block w-3.5 h-3.5 border border-slate-700 text-center leading-3 font-bold">
                  {isChecked ? "✓" : ""}
                </span>
                <span>{status}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Section 2: Contact & Address */}
      <div className="border border-slate-400 p-3 rounded-xs space-y-2.5">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs uppercase tracking-wide">
          2. Contact Details & Address
        </h4>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-6 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Mobile Phone:</span>
            <span className="flex-1 font-mono font-bold border-b border-dotted border-slate-400 px-1">
              {patient?.mobileNumber || ""}
            </span>
          </div>
          <div className="col-span-6 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Email:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {patient?.email || ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-12 flex items-baseline gap-1">
            <span className="shrink-0 text-slate-600">Address in Thailand / Home:</span>
            <span className="flex-1 border-b border-dotted border-slate-400 px-1">
              {[
                patient?.houseNo ? `No. ${patient.houseNo}` : "",
                patient?.road ? `Road ${patient.road}` : "",
                patient?.subDistrict,
                patient?.district,
                patient?.province,
                patient?.zipCode,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-2 border-t border-slate-200 space-y-1.5">
          <span className="font-bold text-slate-800 text-[11px] block">
            Emergency Contact Person:
          </span>
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5 flex items-baseline gap-1">
              <span className="shrink-0 text-slate-600">Name:</span>
              <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
                {emergency?.contactName || ""}
              </span>
            </div>
            <div className="col-span-3 flex items-baseline gap-1">
              <span className="shrink-0 text-slate-600">Relationship:</span>
              <span className="flex-1 border-b border-dotted border-slate-400 px-1">
                {emergency?.relationship || ""}
              </span>
            </div>
            <div className="col-span-4 flex items-baseline gap-1">
              <span className="shrink-0 text-slate-600">Phone:</span>
              <span className="flex-1 font-mono border-b border-dotted border-slate-400 px-1">
                {emergency?.mobileNumber || ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Health History & Allergies */}
      <div className="border border-slate-400 p-3 rounded-xs space-y-2">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 text-xs uppercase tracking-wide">
          3. Medical History & Allergies
        </h4>

        <div className="flex items-baseline gap-1 pt-1">
          <span className="shrink-0 text-rose-800 font-bold">Drug Allergies (Known adverse reactions):</span>
          <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1 text-rose-900">
            {patient?.healthProfile?.drugAllergy || (isBlank ? "" : "No known drug allergies")}
          </span>
        </div>

        <div className="flex items-baseline gap-1 pt-1">
          <span className="shrink-0 text-slate-700 font-bold">Underlying Diseases / Medical Conditions:</span>
          <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
            {patient?.healthProfile?.underlyingDisease || (isBlank ? "" : "None")}
          </span>
        </div>

        <div className="flex items-baseline gap-1 pt-1">
          <span className="shrink-0 text-slate-600">Food / Other Allergies:</span>
          <span className="flex-1 font-medium border-b border-dotted border-slate-400 px-1">
            {patient?.healthProfile?.foodAllergy || (isBlank ? "" : "None")}
          </span>
        </div>
      </div>

      {/* Declaration & Signature */}
      <div className="pt-6 border-t border-slate-300 space-y-4">
        <p className="text-[11px] text-slate-600 text-center italic">
          I hereby certify that the information provided above is true, complete, and accurate to the best of my knowledge.
        </p>
        <div className="grid grid-cols-2 gap-8 pt-4 text-center">
          <div className="space-y-4">
            <p className="text-slate-500">Patient / Informant Signature: ....................................................</p>
            <p className="text-slate-700 font-medium">({patient?.fullname || "...................................................."})</p>
            <p className="text-[11px] text-slate-500">Date: .......... / .......... / ..............</p>
          </div>
          <div className="space-y-4">
            <p className="text-slate-500">Staff / Receptionist Signature: ....................................................</p>
            <p className="text-slate-700 font-medium">(....................................................)</p>
            <p className="text-[11px] text-slate-500">Date: .......... / .......... / ..............</p>
          </div>
        </div>
      </div>
    </main>
  );
}
