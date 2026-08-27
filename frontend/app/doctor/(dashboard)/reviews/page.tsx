import Link from "next/link";
import { getAllReviews } from "@/lib/resources/reviews";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ApiError } from "@/lib/api-client";
import type { PageResponse, ReviewResponseDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Star, MessageSquareHeart, ShieldAlert, Calendar, User, TrendingUp } from "lucide-react";

const PAGE_SIZE = 10;

function formatDateThai(dateInput: string | Date | undefined): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DoctorReviewsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page ?? 0);

  let result: PageResponse<ReviewResponseDTO> | null = null;
  let errorMessage: string | null = null;

  try {
    result = await getAllReviews(page, PAGE_SIZE);
  } catch (err) {
    errorMessage = err instanceof ApiError ? err.message : "ไม่สามารถโหลดข้อมูลรีวิวได้";
  }

  const reviews = result?.content || [];
  const totalReviews = result?.totalElements || reviews.length;

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.ratingClinicScore, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6 pb-16 font-body text-clinic-ink">
      <PageHeader
        icon={<MessageSquareHeart className="w-5 h-5 text-clinic-terracotta" />}
        title="รีวิวและความพึงพอใจจากผู้รับบริการ (Reviews)"
        subtitle="ข้อคิดเห็นและคะแนนการประเมินการรักษาจากผู้ป่วยของพิมพ์วิมานคลินิก"
        badge={
          <Badge variant="terracotta" className="text-xs gap-1">
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>คะแนนเฉลี่ย {avgRating} / 5.0</span>
          </Badge>
        }
      />

      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Review Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-clinic-line">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-control bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-clinic-ink-soft font-semibold">คะแนนเฉลี่ยรวม</p>
              <p className="text-2xl font-bold font-display text-clinic-primary-deep mt-0.5">
                {avgRating} <span className="text-xs font-normal text-clinic-ink-soft">/ 5.0</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-clinic-line">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-clinic-ink-soft font-semibold">จำนวนรีวิวทั้งหมด</p>
              <p className="text-2xl font-bold font-display text-clinic-primary-deep mt-0.5">
                {totalReviews} <span className="text-xs font-normal text-clinic-ink-soft">รายการ</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-clinic-line">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-control bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-clinic-ink-soft font-semibold">ระดับความพึงพอใจ</p>
              <p className="text-base font-bold text-emerald-800 mt-1">
                {Number(avgRating) >= 4.5
                  ? "ยอดเยี่ยม (Excellent)"
                  : Number(avgRating) >= 3.5
                  ? "ดีมาก (Good)"
                  : "มาตรฐาน (Standard)"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareHeart className="w-6 h-6 text-clinic-primary" />}
          title="ยังไม่มีรายการรีวิวในระบบ"
          description="เมื่อผู้ป่วยให้ข้อคิดเห็นและความพึงพอใจหลังจากเข้ารับการรักษา ข้อมูลจะแสดงที่นี่"
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <Card
                key={r.reviewId}
                className="hover:border-clinic-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3 border-b border-clinic-line/70 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-clinic-primary-deep flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-clinic-ink-soft" />
                        <span>{r.patientFullname}</span>
                      </span>
                      <span className="text-[11px] text-clinic-ink-soft font-mono">
                        (HN: P-{String(r.patientId).padStart(5, "0")})
                      </span>
                    </div>
                    <p className="text-[11px] text-clinic-ink-soft flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateThai(r.reviewDate)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-xs text-amber-900 font-mono">
                      {r.ratingClinicScore}.0
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs leading-relaxed text-clinic-ink whitespace-pre-line min-h-[40px]">
                    {r.comment ? (
                      `"${r.comment}"`
                    ) : (
                      <span className="text-clinic-ink-muted italic">
                        (ผู้ป่วยไม่ได้ระบุข้อความเพิ่มเติม)
                      </span>
                    )}
                  </p>

                  <div className="pt-3 mt-3 border-t border-clinic-line/60 flex items-center justify-between text-[11px] text-clinic-ink-soft">
                    <span>รหัสรีวิว #{r.reviewId}</span>
                    <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-clinic-primary">
                      <Link href={`/doctor/patients/${r.patientId}`}>
                        ดูประวัติผู้ป่วย →
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {result && result.totalPages > 1 && (
            <PaginationControls
              currentPage={result.pageNumber}
              totalPages={result.totalPages}
              basePath="/doctor/reviews"
            />
          )}
        </div>
      )}
    </div>
  );
}
