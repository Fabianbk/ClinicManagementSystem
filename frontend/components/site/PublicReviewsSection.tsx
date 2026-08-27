import type { ReviewResponseDTO } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquareHeart, User, Calendar, Quote } from "lucide-react";
import { formatThaiDate } from "@/lib/utils";

interface PublicReviewsSectionProps {
  initialReviews: ReviewResponseDTO[];
}

export function PublicReviewsSection({ initialReviews }: PublicReviewsSectionProps) {
  const reviews = initialReviews || [];
  const totalReviews = reviews.length;

  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.ratingClinicScore, 0) / totalReviews).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-8">
      {/* Overview Stats Bar */}
      <div className="bg-white rounded-card border border-clinic-line p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-control bg-amber-50 text-amber-700 flex flex-col items-center justify-center shrink-0 border border-amber-200">
            <span className="font-display font-bold text-xl leading-none text-amber-900">
              {avgRating}
            </span>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-2 h-2 ${
                    star <= Math.round(Number(avgRating))
                      ? "text-amber-400 fill-amber-400"
                      : "text-clinic-line-dark"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-base text-clinic-primary-deep">
              คะแนนความพึงพอใจจากผู้รับบริการ
            </h3>
            <p className="text-xs text-clinic-ink-soft">
              ประเมินจากผู้ป่วยที่เข้ารับการตรวจรักษาจริงที่พิมพ์วิมานคลินิก ({totalReviews} รีวิว)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="terracotta" className="px-3 py-1 font-semibold text-xs">
            คะแนนเฉลี่ย {avgRating} / 5.0 ดาว
          </Badge>
        </div>
      </div>

      {/* Testimonial Cards Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-card border border-clinic-line p-6 space-y-2">
          <MessageSquareHeart className="w-8 h-8 text-clinic-ink-muted mx-auto" />
          <p className="text-sm font-semibold text-clinic-ink">
            ยังไม่มีข้อคิดเห็นจากผู้รับบริการในระบบ
          </p>
          <p className="text-xs text-clinic-ink-soft">
            ข้อคิดเห็นและการประเมินความพึงพอใจจะแสดงที่นี่หลังจากผู้ป่วยเข้ารับการรักษา
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <Card
              key={review.reviewId}
              className="bg-white border-clinic-line hover:border-clinic-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3 border-b border-clinic-line/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-clinic-primary-soft text-clinic-primary flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-clinic-ink">
                      {review.patientFullname}
                    </strong>
                    <span className="text-[10px] text-clinic-ink-soft flex items-center gap-1 font-mono">
                      <Calendar className="w-2.5 h-2.5 opacity-70" />
                      <span>{formatThaiDate(review.reviewDate)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= review.ratingClinicScore
                          ? "text-amber-400 fill-amber-400"
                          : "text-clinic-line-dark"
                      }`}
                    />
                  ))}
                </div>
              </CardHeader>

              <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                <div className="relative">
                  <Quote className="w-5 h-5 text-clinic-terracotta-soft text-opacity-80 -mt-1 mb-1" />
                  <p className="text-xs text-clinic-ink leading-relaxed whitespace-pre-line min-h-[50px]">
                    {review.comment ? (
                      review.comment
                    ) : (
                      <span className="text-clinic-ink-muted italic text-[11px]">
                        (ผู้รับบริการให้คะแนนความพึงพอใจ {review.ratingClinicScore} ดาว โดยไม่มีข้อความเพิ่มเติม)
                      </span>
                    )}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-clinic-line/60 flex items-center justify-between text-[10px] text-clinic-ink-soft">
                  <span>ผู้รับบริการพิมพ์วิมานคลินิก</span>
                  <span className="font-mono text-emerald-700 font-semibold">ยืนยันการรับบริการแล้ว ✓</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
