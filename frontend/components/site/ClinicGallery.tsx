"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Leaf,
  Stethoscope,
  Building2,
} from "lucide-react";

export interface GalleryPhoto {
  id: string;
  title: string;
  category: "all" | "atmosphere" | "medicine" | "standards";
  categoryLabel: string;
  description: string;
  src: string;
  aspectRatio: "landscape" | "portrait";
  highlight?: string;
  spanClass: string;
}

const CLINIC_PHOTOS: GalleryPhoto[] = [
  {
    id: "exterior",
    title: "ด้านหน้าและป้ายทางเข้าคลินิก",
    category: "atmosphere",
    categoryLabel: "บรรยากาศคลินิก",
    description: "ป้ายสถานพยาบาลพิมพ์วิมานคลินิกการแพทย์แผนไทย ใบอนุญาตเลขที่ 58108000161 ณ ตลาดวันพุธ อ.ปาย",
    src: "/clinic/exterior.jpg",
    aspectRatio: "landscape",
    highlight: "ใบอนุญาตเลขที่ 58108000161",
    spanClass: "lg:col-span-7 h-[320px] sm:h-[400px]",
  },
  {
    id: "dispensary",
    title: "ตู้ปรุงยาและวัตถุดิบสมุนไพร",
    category: "medicine",
    categoryLabel: "ตำรับยาสมุนไพร",
    description: "คัดสรรตัวยาสมุนไพรไทยแห้งและวัตถุดิบทางเภสัชกรรมไทย จัดเก็บตามมาตรฐานเพื่อปรุงยาเฉพาะบุคคล",
    src: "/clinic/dispensary.jpg",
    aspectRatio: "portrait",
    highlight: "คัดสรรวัตถุดิบมาตรฐาน",
    spanClass: "lg:col-span-5 h-[320px] sm:h-[400px]",
  },
  {
    id: "certificate",
    title: "มุมพักคอยและใบอนุญาตประกอบวิชาชีพ",
    category: "standards",
    categoryLabel: "มาตรฐานวิชาชีพ",
    description: "พื้นที่รับรองผู้รับบริการ พร้อมใบประกอบโรคศิลปะและประกาศนียบัตรรับรองวิชาชีพแพทย์แผนไทย",
    src: "/clinic/certificate.jpg",
    aspectRatio: "landscape",
    highlight: "แพทย์มีใบประกอบวิชาชีพ",
    spanClass: "lg:col-span-6 h-[260px] sm:h-[300px]",
  },
  {
    id: "reception",
    title: "จุดต้อนรับและสอบถามข้อมูล",
    category: "atmosphere",
    categoryLabel: "บรรยากาศคลินิก",
    description: "เคาน์เตอร์ต้อนรับบรรยากาศอบอุ่น ตกแต่งสไตล์สมุนไพรไทย พร้อมให้คำแนะนำและชี้แจงอัตราค่าบริการ",
    src: "/clinic/reception.jpg",
    aspectRatio: "portrait",
    highlight: "ต้อนรับและบริการด้วยใจ",
    spanClass: "lg:col-span-6 h-[260px] sm:h-[300px]",
  },
  {
    id: "consultation",
    title: "ห้องตรวจและโต๊ะซักประวัติคนไข้",
    category: "standards",
    categoryLabel: "การตรวจรักษา",
    description: "พื้นที่ตรวจวินิจฉัย ซักประวัติ จับชีพจร และประเมินสมดุลธาตุเจ้าเรือนกำเนิดโดยแพทย์แผนไทย",
    src: "/clinic/consultation.jpg",
    aspectRatio: "portrait",
    highlight: "ตรวจสมดุลธาตุเจ้าเรือน",
    spanClass: "lg:col-span-4 h-[260px] sm:h-[300px]",
  },
  {
    id: "herb",
    title: "สมุนไพรไทยและรางบดยาไม้โบราณ",
    category: "medicine",
    categoryLabel: "ตำรับยาสมุนไพร",
    description: "เครื่องยาสมุนไพรไทยแท้พร้อมรางบดยาไม้โบราณ สะท้อนภูมิปัญญาการแพทย์แผนไทยดั้งเดิมอย่างแท้จริง",
    src: "/clinic/herb.jpg",
    aspectRatio: "portrait",
    highlight: "ภูมิปัญญาไทยโบราณ",
    spanClass: "lg:col-span-4 h-[260px] sm:h-[300px]",
  },
  {
    id: "papers",
    title: "เวชระเบียนและตู้ยาแผนไทย",
    category: "standards",
    categoryLabel: "มาตรฐานวิชาชีพ",
    description: "ระบบจัดเก็บแฟ้มประวัติคนไข้อย่างเป็นระเบียบ และการชี้แจงค่ารักษาพยาบาลที่โปร่งใส ชัดเจน",
    src: "/clinic/papers.jpg",
    aspectRatio: "portrait",
    highlight: "อัตราค่ารักษาโปร่งใส",
    spanClass: "lg:col-span-4 h-[260px] sm:h-[300px]",
  },
];

const CATEGORIES = [
  { key: "all", label: "ทั้งหมด (7 ภาพ)", icon: Sparkles },
  { key: "atmosphere", label: "บรรยากาศคลินิก", icon: Building2 },
  { key: "medicine", label: "ยาสมุนไพรไทย", icon: Leaf },
  { key: "standards", label: "การตรวจและมาตรฐาน", icon: ShieldCheck },
] as const;

export function ClinicGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos = selectedCategory === "all"
    ? CLINIC_PHOTOS
    : CLINIC_PHOTOS.filter((p) => p.category === selectedCategory);

  const openLightbox = (indexInFiltered: number) => {
    // Find index in original array for smooth global navigation
    const target = filteredPhotos[indexInFiltered];
    const globalIdx = CLINIC_PHOTOS.findIndex((p) => p.id === target.id);
    setLightboxIndex(globalIdx !== -1 ? globalIdx : 0);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % CLINIC_PHOTOS.length));
  }, [lightboxIndex]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + CLINIC_PHOTOS.length) % CLINIC_PHOTOS.length));
  }, [lightboxIndex]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scroll when modal open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex, showNext, showPrev]);

  const currentPhoto = lightboxIndex !== null ? CLINIC_PHOTOS[lightboxIndex] : null;

  return (
    <section id="gallery" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <Badge variant="outline" className="text-xs text-clinic-primary border-clinic-primary/30 gap-1.5 py-1 px-3">
          <Building2 className="w-3.5 h-3.5 text-clinic-primary" />
          <span>ภาพบรรยากาศคลินิก (Clinic Gallery)</span>
        </Badge>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-clinic-primary-deep">
          บรรยากาศและการให้บริการในคลินิก
        </h2>
        <p className="text-xs sm:text-sm text-clinic-ink-soft leading-relaxed">
          ชมบรรยากาศสถานที่จริง ห้องตรวจวินิจฉัย ตู้ปรุงยาสมุนไพร และมาตรฐานสถานพยาบาลการแพทย์แผนไทย
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-clinic-primary text-white shadow-xs"
                  : "bg-white text-clinic-ink-soft border border-clinic-line hover:border-clinic-primary/40 hover:text-clinic-primary hover:bg-clinic-bg"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => openLightbox(index)}
            className={`group relative rounded-card overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300 border border-clinic-line bg-white ${photo.spanClass}`}
          >
            {/* Background Image */}
            <Image
              src={photo.src}
              alt={photo.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Top Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-clinic-primary-deep shadow-xs border border-white/40">
                {photo.categoryLabel}
              </span>
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0 duration-200">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>

            {/* Bottom Content / Caption */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 text-white space-y-1">
              {photo.highlight && (
                <span className="text-[10px] font-mono tracking-wide text-amber-300 font-semibold block uppercase">
                  ✦ {photo.highlight}
                </span>
              )}
              <h3 className="font-display font-bold text-sm sm:text-base text-white drop-shadow-xs leading-snug">
                {photo.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-white/80 line-clamp-2 leading-relaxed">
                {photo.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal Dialog */}
      {currentPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in-0 duration-200"
          onClick={closeLightbox}
        >
          {/* Lightbox Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold border border-white/20">
                {currentPhoto.categoryLabel}
              </span>
              <span className="text-xs text-white/60 font-mono">
                {lightboxIndex + 1} / {CLINIC_PHOTOS.length}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              aria-label="Close photo preview"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Center Area with Image & Prev/Next Arrows */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-2 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            <button
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute left-1 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-transform active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Image */}
            <div className="relative w-full h-[55vh] sm:h-[65vh] max-h-[700px] flex items-center justify-center">
              <Image
                src={currentPhoto.src}
                alt={currentPhoto.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={showNext}
              aria-label="Next photo"
              className="absolute right-1 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-transform active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Info & Thumbnail Strip */}
          <div
            className="w-full max-w-3xl text-center text-white space-y-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="font-display font-bold text-base sm:text-lg text-white">
                {currentPhoto.title}
              </h4>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto mt-0.5">
                {currentPhoto.description}
              </p>
            </div>

            {/* Thumbnails */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
              {CLINIC_PHOTOS.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    idx === lightboxIndex
                      ? "border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/40"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={p.src} alt={p.title} fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
