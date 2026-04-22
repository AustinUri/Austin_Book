import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, ChevronLeft, ChevronRight, BookOpen, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Book Viewer Website Template
 *
 * How to use:
 * 1. Replace BOOK.title and BOOK.pages with the real book data.
 * 2. For each page, insert the original Indian-language text into `content`.
 * 3. Add image URLs or uploaded asset paths into `images`.
 * 4. Use `caption` if needed.
 *
 * Image placement options per image object:
 * - "full"
 * - "top"
 * - "bottom"
 * - "left"
 * - "right"
 * - "inline"
 */

const BOOK = {
  title: "Dad's Book",
  subtitle: "Digital reading edition",
  languageNote: "Supports Indian-language text. Replace placeholder content with the original text.",
  pages: [
    {
      pageNumber: 1,
      title: "Page 1",
      content:
        "Paste the original source text here. This layout is ready for Hindi, Marathi, Bengali, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi, Urdu, and other Indian-language text. Keep the text exactly as in the source if accuracy matters.",
      images: [],
    },
    {
      pageNumber: 2,
      title: "Page 2",
      content:
        "Paste the second page here. If a picture should appear on this page, add it in the images array below with the correct placement.",
      images: [
        // Example:
        // {
        //   src: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop",
        //   alt: "Example image",
        //   placement: "bottom",
        //   caption: "Optional caption"
        // }
      ],
    },
    {
      pageNumber: 3,
      title: "Page 3",
      content:
        "Paste the third page here. Continue the same structure until all 20 pages are included.",
      images: [],
    },
  ],
};

function mergeClassNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function PageImage({ image }) {
  const wrapperClass = {
    full: "w-full",
    top: "w-full mb-5",
    bottom: "w-full mt-5",
    left: "md:w-2/5 w-full",
    right: "md:w-2/5 w-full",
    inline: "w-full my-4",
  }[image.placement || "inline"];

  return (
    <div className={wrapperClass}>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <img
          src={image.src}
          alt={image.alt || "Page visual"}
          className="h-auto w-full object-cover"
        />
      </div>
      {image.caption ? (
        <p className="mt-2 text-sm text-slate-500">{image.caption}</p>
      ) : null}
    </div>
  );
}

function PageContent({ page }) {
  const topImages = page.images?.filter((img) => img.placement === "top") || [];
  const bottomImages = page.images?.filter((img) => img.placement === "bottom") || [];
  const fullImages = page.images?.filter((img) => img.placement === "full") || [];
  const leftImages = page.images?.filter((img) => img.placement === "left") || [];
  const rightImages = page.images?.filter((img) => img.placement === "right") || [];
  const inlineImages = page.images?.filter(
    (img) => !img.placement || img.placement === "inline"
  ) || [];

  return (
    <div className="space-y-5">
      {fullImages.map((image, index) => (
        <PageImage key={`full-${index}`} image={image} />
      ))}

      {topImages.map((image, index) => (
        <PageImage key={`top-${index}`} image={image} />
      ))}

      {(leftImages.length > 0 || rightImages.length > 0) ? (
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="space-y-4 md:w-2/5">
            {leftImages.map((image, index) => (
              <PageImage key={`left-${index}`} image={image} />
            ))}
          </div>

          <div className="min-w-0 flex-1 whitespace-pre-wrap break-words text-lg leading-8 text-slate-700">
            {page.content}
          </div>

          <div className="space-y-4 md:w-2/5">
            {rightImages.map((image, index) => (
              <PageImage key={`right-${index}`} image={image} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="whitespace-pre-wrap break-words text-lg leading-8 text-slate-700">
            {page.content}
          </div>

          {inlineImages.map((image, index) => (
            <PageImage key={`inline-${index}`} image={image} />
          ))}
        </>
      )}

      {bottomImages.map((image, index) => (
        <PageImage key={`bottom-${index}`} image={image} />
      ))}
    </div>
  );
}

export default function BookViewerWebsite() {
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef(null);

  const totalPages = BOOK.pages.length;
  const current = BOOK.pages[currentPage];

  const progress = useMemo(() => {
    if (!totalPages) return 0;
    return Math.round(((currentPage + 1) / totalPages) * 100);
  }, [currentPage, totalPages]);

  const goPrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  const exportToPdf = async () => {
    const pages = Array.from(document.querySelectorAll(".pdf-page"));
    if (!pages.length) return;

    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < pages.length; i += 1) {
      const page = pages[i];
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210;
      const pdfHeight = 297;
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pdfWidth - imgWidth) / 2;
      const y = 10;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, undefined, "FAST");
    }

    pdf.save(`${BOOK.title.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[280px_1fr] md:p-6">
        <Card className="h-fit rounded-3xl border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">{BOOK.title}</h1>
                <p className="mt-1 text-sm text-slate-500">{BOOK.subtitle}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">{BOOK.languageNote}</p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                <span>Reading progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button onClick={goPrev} disabled={currentPage === 0} className="flex-1 rounded-2xl">
                <ChevronLeft className="mr-1 h-4 w-4" /> Prev
              </Button>
              <Button
                onClick={goNext}
                disabled={currentPage === totalPages - 1}
                variant="secondary"
                className="flex-1 rounded-2xl"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <Button onClick={exportToPdf} className="mt-3 w-full rounded-2xl">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>

            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Pages
              </h2>
              <div className="grid gap-2">
                {BOOK.pages.map((page, index) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => setCurrentPage(index)}
                    className={mergeClassNames(
                      "rounded-2xl border px-3 py-3 text-left transition",
                      currentPage === index
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">Page {page.pageNumber}</div>
                        <div className="text-xs opacity-80">{page.title}</div>
                      </div>
                      <div className="rounded-xl p-2 opacity-80">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <motion.div
            key={current.pageNumber}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6 md:p-10">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Digital Book</p>
                    <h2 className="mt-2 text-3xl font-bold">{current.title}</h2>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                    Page {current.pageNumber} / {totalPages}
                  </div>
                </div>

                <PageContent page={current} />
              </CardContent>
            </Card>
          </motion.div>

          <div ref={bookRef} className="space-y-6">
            {BOOK.pages.map((page) => (
              <div key={`pdf-${page.pageNumber}`} className="pdf-page bg-white p-10 shadow-sm">
                <div className="mx-auto min-h-[1122px] max-w-[794px]">
                  <div className="mb-6 border-b pb-4">
                    <div className="text-sm uppercase tracking-[0.25em] text-slate-400">{BOOK.title}</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <h3 className="text-3xl font-bold text-slate-900">{page.title}</h3>
                      <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                        Page {page.pageNumber}
                      </div>
                    </div>
                  </div>
                  <PageContent page={page} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
