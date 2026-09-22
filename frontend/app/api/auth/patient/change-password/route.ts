import { NextResponse } from "next/server";
import { apiPut, ApiError } from "@/lib/api-client";
import type { ChangePasswordRequestDTO } from "@/lib/types";

export async function PUT(request: Request) {
  try {
    const dto = (await request.json()) as ChangePasswordRequestDTO;

    if (!dto.oldPassword || !dto.oldPassword.trim()) {
      return NextResponse.json({ message: "กรุณาระบุรหัสผ่านปัจจุบัน" }, { status: 400 });
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      return NextResponse.json(
        { message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    await apiPut("/api/auth/patient/change-password", dto);

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" }, { status: 500 });
  }
}
