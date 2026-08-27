import { NavBar } from "@/components/site/NavBar";
import Link from "next/link";
import { getAllReviews } from "@/lib/resources/reviews";
import { PublicReviewsSection } from "@/components/site/PublicReviewsSection";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquareHeart, ArrowLeft, ShieldCheck, HeartPulse } from "lucide-react";
import type { ReviewResponseDTO, PageResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 18;

export default async function PublicReviewsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page ?? 0);

  let reviewsData: PageResponse<ReviewResponseDTO> | null = null;
  try {
    reviewsData = await getAllReviews(page, PAGE_SIZE);
  } catch (e) {
    reviewsData = { content: [], totalElements: 0, totalPages: 0, pageNumber: 0, pageSize: PAGE_SIZE, last: true };
  }

  const reviews = reviewsData?.content || [];
  const totalElements = reviewsData?.totalElements || reviews.length;
  const totalPages = reviewsData?.totalPages || 1;

  // Calculate score breakdown
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumScore = 0;
  reviews.forEach((r) => {
    ratingCounts[r.ratingClinicScore] = (ratingCounts[r.ratingClinicScore] || 0) + 1;
    sumScore += r.ratingClinicScore;
  });

  const avgRating = reviews.length > 0 ? (sumScore / reviews.length).toFixed(1) : "5.0";

  return (
    <div className="min-h-screen bg-clinic-bg text-clinic-ink flex flex-col justify-between font-body">
      <NavBar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-10 py-8 sm:py-12">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-4">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-xs text-clinic-ink-soft hover:text-clinic-primary-deep">
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-clinic-line pb-6">
            <div className="space-y-1.5">
              <Badge variant="terracotta" className="px-2.5 py-0.5 text-xs gap-1">
                <MessageSquareHeart className="w-3.5 h-3.5" />
                <span>เสียงตอบรับจากผู้รับบริการจริง</span>
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-clinic-primary-deep">
                รีวิวและความพึงพอใจ (Clinic Reviews)
              </h1>
              <p className="text-xs sm:text-sm text-clinic-ink-soft">
                ข้อคิดเห็น คะแนนความพึงพอใจ และประสบการณ์การรักษาของผู้ป่วยที่พิมพ์วิมานคลินิกการแพทย์แผนไทย
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-card border border-clinic-line shadow-2xs shrink-0">
              <div className="w-12 h-12 rounded-control bg-amber-50 text-amber-700 flex flex-col items-center justify-center border border-amber-200">
                <span className="font-display font-bold text-lg leading-none text-amber-900">
                  {avgRating}
                </span>
                <span className="text-[9px] text-amber-700 font-semibold">/ 5.0</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(Number(avgRating))
                          ? "text-amber-400 fill-amber-400"
                          : "text-clinic-line-dark"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-clinic-ink">
                  คะแนนเฉลี่ยรวม ({totalElements} รีวิว)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <PublicReviewsSection
          initialReviews={reviews}
          maxDisplay={0}
          showViewAllLink={false}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4">
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              basePath="/reviews"
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-clinic-line bg-white py-6 text-center text-xs text-clinic-ink-soft">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} พิมพ์วิมานคลินิกการแพทย์แผนไทย. สงวนลิขสิทธิ์.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-clinic-primary-deep">หน้าหลัก</Link>
            <Link href="/#schedule" className="hover:text-clinic-primary-deep">เวลาทำงานของแพทย์</Link>
            <Link href="/reviews" className="hover:text-clinic-primary-deep font-semibold text-clinic-primary">รีวิวทั้งหมด</Link>
            <Link href="/patient/login" className="hover:text-clinic-primary-deep">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
