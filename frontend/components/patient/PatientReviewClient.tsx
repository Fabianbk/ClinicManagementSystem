"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReviewResponseDTO, ReviewRequestDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MessageSquareHeart,
  CheckCircle2,
  AlertCircle,
  Edit,
  ArrowLeft,
  Calendar,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";

interface PatientReviewClientProps {
  patientId: number;
  patientFullname: string;
  initialReview: ReviewResponseDTO | null;
}

const RATING_LABELS: Record<number, { title: string; desc: string; color: string }> = {
  1: { title: "ควรปรับปรุง (1 ดาว)", desc: "ไม่พึงพอใจในบริการ ต้องการให้ปรับปรุง", color: "text-amber-700" },
  2: { title: "พอใช้ (2 ดาว)", desc: "บริการพอใช้ แต่ยังมีข้อที่ควรพัฒนา", color: "text-amber-600" },
  3: { title: "ปานกลาง (3 ดาว)", desc: "บริการมาตรฐานตามเกณฑ์ทั่วไป", color: "text-emerald-700" },
  4: { title: "ดีมาก (4 ดาว)", desc: "พึงพอใจในบริการและการรักษา", color: "text-emerald-800" },
  5: { title: "ยอดเยี่ยมมาก (5 ดาว)", desc: "ประทับใจมาก ทั้งการรักษาและบริการ", color: "text-clinic-terracotta" },
};

function formatDateThai(dateInput: string | Date | undefined): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PatientReviewClient({
  patientId,
  patientFullname,
  initialReview,
}: PatientReviewClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [review, setReview] = useState<ReviewResponseDTO | null>(initialReview);
  const [isEditing, setIsEditing] = useState<boolean>(!initialReview);

  // Form states
  const [ratingScore, setRatingScore] = useState<number>(initialReview?.ratingClinicScore ?? 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>(initialReview?.comment ?? "");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeRating = hoverRating || ratingScore;

  // Handle Submit (Create or Update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!ratingScore || ratingScore < 1 || ratingScore > 5) {
      setErrorMessage("กรุณาเลือกคะแนนความพึงพอใจ (1 - 5 ดาว)");
      return;
    }

    if (comment.length > 255) {
      setErrorMessage("ความคิดเห็นต้องมีความยาวไม่เกิน 255 ตัวอักษร");
      return;
    }

    const payload: ReviewRequestDTO = {
      patientId,
      ratingClinicScore: ratingScore,
      comment: comment.trim() || undefined,
      reviewDate: new Date().toISOString(),
    };

    try {
      if (review) {
        // Update existing review (UC 3.1.9 Edit Review Clinic)
        const res = await fetch(`/api/reviews/${review.reviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || "ไม่สามารถแก้ไขข้อมูลรีวิวได้");
        }

        const updatedData: ReviewResponseDTO = await res.json();
        setReview(updatedData);
        setIsEditing(false);
        setSuccessMessage("แก้ไขข้อคิดเห็นและรีวิวคลินิกเรียบร้อยแล้ว");
      } else {
        // Create new review (UC 3.1.8 Review Clinic)
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || "ไม่สามารถบันทึกข้อมูลรีวิวได้");
        }

        const createdData: ReviewResponseDTO = await res.json();
        setReview(createdData);
        setIsEditing(false);
        setSuccessMessage("ขอบพระคุณสำหรับข้อคิดเห็นและการประเมินความพึงพอใจ");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  }

  const handleCancelEdit = () => {
    if (review) {
      setRatingScore(review.ratingClinicScore);
      setComment(review.comment || "");
      setIsEditing(false);
      setErrorMessage(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-body text-clinic-ink">
      {/* Top Header */}
      <PageHeader
        icon={<MessageSquareHeart className="w-5 h-5 text-clinic-terracotta" />}
        title="รีวิวและความพึงพอใจ (Clinic Reviews)"
        subtitle="ประเมินความพึงพอใจการให้บริการและการรักษาของพิมพ์วิมานคลินิกการแพทย์แผนไทย"
        actions={
          <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-2xs">
            <Link href="/patient/dashboard">
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </Button>
        }
      />

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-control bg-clinic-success-bg border border-clinic-success/40 text-clinic-success text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-clinic-success/80 hover:text-clinic-success text-xs underline font-semibold"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger/40 text-clinic-danger text-xs font-medium flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Review Card */}
      {!isEditing && review ? (
        /* Display Current Review Mode */
        <Card className="border-clinic-line overflow-hidden shadow-xs">
          <div className="bg-gradient-to-r from-clinic-primary to-clinic-primary-deep p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="terracotta" className="bg-white/15 text-white border-white/20 text-xs gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>รีวิวของคุณที่บันทึกแล้ว</span>
              </Badge>
              <h2 className="font-display text-xl font-bold text-white pt-1">
                คุณ {patientFullname}
              </h2>
              <p className="text-xs text-white/80 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 opacity-80" />
                <span>วันที่บันทึก: {formatDateThai(review.reviewDate)}</span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-white/95 text-clinic-primary-deep hover:bg-white font-semibold gap-1.5 shadow-sm shrink-0"
            >
              <Edit className="w-4 h-4 text-clinic-terracotta" />
              <span>แก้ไขรีวิว</span>
            </Button>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* Rating Stars Highlight */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-clinic-bg/60 rounded-control border border-clinic-line">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 transition-colors ${
                      star <= review.ratingClinicScore
                        ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                        : "text-clinic-line-dark"
                    }`}
                  />
                ))}
              </div>
              <div className="sm:border-l sm:border-clinic-line sm:pl-4">
                <p className="font-bold text-sm text-clinic-primary-deep">
                  {RATING_LABELS[review.ratingClinicScore]?.title || `${review.ratingClinicScore} ดาว`}
                </p>
                <p className="text-xs text-clinic-ink-soft">
                  {RATING_LABELS[review.ratingClinicScore]?.desc}
                </p>
              </div>
            </div>

            {/* Comment Body */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-clinic-ink-soft">
                ข้อคิดเห็นและข้อเสนอแนะ:
              </Label>
              <div className="p-4 bg-white rounded-control border border-clinic-line text-sm leading-relaxed text-clinic-ink min-h-[80px] whitespace-pre-line">
                {review.comment ? (
                  review.comment
                ) : (
                  <span className="text-xs text-clinic-ink-muted italic">
                    (ไม่มีข้อความแสดงความคิดเห็นเพิ่มเติม)
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-clinic-ink-soft border-t border-clinic-line">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                ข้อคิดเห็นของท่านช่วยให้พิมพ์วิมานคลินิกพัฒนาคุณภาพการรักษาและบริการให้ดียิ่งขึ้น
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Form Mode: Create or Edit Review */
        <Card className="border-clinic-line shadow-xs">
          <CardHeader className="pb-4 border-b border-clinic-line">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-clinic-terracotta" />
              <div>
                <CardTitle className="text-base font-bold text-clinic-primary-deep">
                  {review ? "แก้ไขข้อคิดเห็นและรีวิวคลินิก" : "แบบประเมินความพึงพอใจและรีวิวคลินิก"}
                </CardTitle>
                <p className="text-xs text-clinic-ink-soft mt-0.5">
                  ความพึงพอใจของท่านคือสิ่งสำคัญในการยกระดับมาตรฐานการแพทย์แผนไทย
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating Selector */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-clinic-ink" required>
                  ระดับความพึงพอใจ (Rating Score 1 - 5 ดาว)
                </Label>

                <div className="p-5 bg-clinic-bg/50 rounded-control border border-clinic-line flex flex-col items-center justify-center gap-3 text-center">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= activeRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={isPending}
                          onClick={() => setRatingScore(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 rounded-full hover:scale-115 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                          aria-label={`ให้คะแนน ${star} ดาว`}
                        >
                          <Star
                            className={`w-9 h-9 sm:w-10 sm:h-10 transition-all ${
                              isFilled
                                ? "text-amber-400 fill-amber-400 drop-shadow-md"
                                : "text-clinic-line-dark hover:text-amber-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="min-h-[38px] flex flex-col items-center">
                    <span className="font-display font-bold text-sm text-clinic-primary-deep">
                      {RATING_LABELS[activeRating]?.title || `${activeRating} ดาว`}
                    </span>
                    <span className="text-xs text-clinic-ink-soft">
                      {RATING_LABELS[activeRating]?.desc}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="review-comment" className="text-xs font-semibold text-clinic-ink">
                    ข้อคิดเห็นหรือข้อเสนอแนะเพิ่มเติม (Optional)
                  </Label>
                  <span
                    className={`text-[11px] font-mono ${
                      comment.length > 255
                        ? "text-clinic-danger font-bold"
                        : "text-clinic-ink-soft"
                    }`}
                  >
                    {comment.length} / 255 ตัวอักษร
                  </span>
                </div>

                <Textarea
                  id="review-comment"
                  rows={4}
                  maxLength={255}
                  disabled={isPending}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="บอกเล่าความรู้สึก ประสบการณ์ที่ได้รับจากการรักษา หรือข้อเสนอแนะในการพัฒนาบริการ..."
                  className="text-xs leading-relaxed resize-y min-h-[100px]"
                />
                <p className="text-[11px] text-clinic-ink-soft">
                  * ความคิดเห็นของท่านจะนำไปใช้เพื่อการพัฒนาคุณภาพการให้บริการภายในคลินิก
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-clinic-line">
                {review && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={handleCancelEdit}
                  >
                    ยกเลิก
                  </Button>
                )}

                <Button
                  type="submit"
                  variant="terracotta"
                  size="lg"
                  disabled={isPending}
                  className="font-semibold gap-2 shadow-xs min-w-[140px]"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>{isPending ? "กำลังบันทึก..." : review ? "บันทึกการแก้ไข" : "ส่งรีวิว"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
