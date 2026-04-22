import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  bookMeta,
  publicationDetails,
  prefaceParagraphs,
  tocEntries,
  storyChunks,
  photoPages,
  sourceFiles
} from './data/bookData.js';

function buildPages() {
  const pages = [];

  pages.push({ id: 'cover', kind: 'cover', title: bookMeta.title, subtitle: bookMeta.subtitle });
  pages.push({
    id: 'title-page',
    kind: 'title',
    title: bookMeta.title,
    author: bookMeta.author,
    presenter: bookMeta.presenter,
    edition: bookMeta.firstEdition
  });
  pages.push({ id: 'publication-page', kind: 'text', heading: 'प्रकाशन माहिती', paragraphs: publicationDetails });
  pages.push({ id: 'preface-page', kind: 'text', heading: 'दोन शब्द', paragraphs: prefaceParagraphs });
  pages.push({ id: 'toc-page', kind: 'toc', heading: 'अनुक्रमणिका', entries: tocEntries });

  storyChunks.forEach((chunk, index) => {
    pages.push({
      id: `story-${index + 1}`,
      kind: 'story',
      heading: index === 0 ? 'मूळ कथन' : `कथन पुढे (${index + 1})`,
      paragraphs: chunk
    });
  });

  pages.push({
    id: 'photo-divider',
    kind: 'divider',
    title: 'छायाचित्र परिशिष्ट',
    subtitle: 'PDF संपादनासाठी सर्व फोटो स्वतंत्र पानांवर दिले आहेत.'
  });

  photoPages.forEach((photo, index) => {
    pages.push({
      id: `photo-${index + 1}`,
      kind: 'photo',
      heading: `छायाचित्र ${index + 1}`,
      photo
    });
  });

  pages.push({
    id: 'sources',
    kind: 'sources',
    heading: 'मूळ स्रोत',
    textFile: sourceFiles.text,
    photoZip: sourceFiles.photosZip
  });

  return pages;
}

function pageMotion(direction) {
  const fromX = direction >= 0 ? 65 : -65;
  const fromRotate = direction >= 0 ? -10 : 10;
  const exitRotate = direction >= 0 ? 10 : -10;

  return {
    initial: { opacity: 0, x: fromX, rotateY: fromRotate, scale: 0.98 },
    animate: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      x: -fromX,
      rotateY: exitRotate,
      scale: 0.98,
      transition: { duration: 0.25, ease: 'easeIn' }
    }
  };
}

function renderParagraph(paragraph, index) {
  const noteLike =
    paragraph.startsWith('(') ||
    paragraph.startsWith('-') ||
    paragraph.includes('पान क्र.') ||
    paragraph.length < 45;

  return (
    <p key={index} className={noteLike ? 'book-paragraph note-paragraph' : 'book-paragraph'}>
      {paragraph}
    </p>
  );
}

function BookPage({ page, pageNumber, totalPages, exportMode = false }) {
  return (
    <article className={`paper ${exportMode ? 'export-paper' : ''}`}>
      <div className="paper-inner">
        <header className="paper-header">
          <div className="eyebrow">{bookMeta.language} · Digital Edition</div>
          <div className="header-row">
            <div>
              <h1 className="paper-title">
                {page.kind === 'cover' || page.kind === 'divider'
                  ? page.title
                  : page.heading || bookMeta.title}
              </h1>
              {page.subtitle ? <p className="paper-subtitle">{page.subtitle}</p> : null}
            </div>
            <div className="folio">{pageNumber} / {totalPages}</div>
          </div>
        </header>

        <section className="paper-body">
          {page.kind === 'cover' ? (
            <div className="cover-layout">
              <div className="cover-copy">
                <div className="cover-kicker">वंशपरंपरा · इतिहास · स्मृती</div>
                <h2 className="cover-heading">{bookMeta.title}</h2>
                <p className="cover-meta">{bookMeta.presenter}</p>
                <p className="cover-meta">{bookMeta.firstEdition}</p>
                <p className="cover-note">{bookMeta.note}</p>
              </div>
              <div className="cover-image-shell">
                <img src={bookMeta.coverImage} alt="Book cover" className="cover-image" />
              </div>
            </div>
          ) : null}

          {page.kind === 'title' ? (
            <div className="title-page-layout">
              <div className="title-copy">
                <h2 className="title-page-heading">{page.title}</h2>
                <p className="title-page-line">{page.presenter}</p>
                <p className="title-page-line">लेखक: {page.author}</p>
                <p className="title-page-line">प्रथमावृत्ति: {page.edition}</p>
              </div>
              <img src={bookMeta.innerCoverImage} alt="Printed book cover" className="inner-cover-image" />
            </div>
          ) : null}

          {(page.kind === 'text' || page.kind === 'story') ? (
            <div className="paragraph-stack">{page.paragraphs.map(renderParagraph)}</div>
          ) : null}

          {page.kind === 'toc' ? (
            <div className="toc-grid">
              {page.entries.map((entry, index) => (
                <div key={index} className="toc-item">
                  <span className="toc-index">{index + 1}</span>
                  <span className="toc-text">{entry}</span>
                </div>
              ))}
            </div>
          ) : null}

          {page.kind === 'divider' ? (
            <div className="divider-layout">
              <div className="divider-line" />
              <p className="divider-text">{page.subtitle}</p>
              <div className="divider-line" />
            </div>
          ) : null}

          {page.kind === 'photo' ? (
            <figure className="photo-plate">
              <img src={page.photo.src} alt={page.photo.caption} className="photo-image" />
              <figcaption className="photo-caption">{page.photo.caption}</figcaption>
            </figure>
          ) : null}

          {page.kind === 'sources' ? (
            <div className="sources-block">
              <p className="book-paragraph">मूळ OCR मजकूर आणि फोटो झिप या प्रकल्पात जतन केले आहेत.</p>
              <div className="source-links">
                <a href={page.textFile} className="source-link">मूळ मजकूर (.txt)</a>
                <a href={page.photoZip} className="source-link">मूळ फोटो (.zip)</a>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </article>
  );
}

export default function App() {
  const pages = useMemo(() => buildPages(), []);
  const totalPages = pages.length;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const exportRef = useRef(null);
  const page = pages[current];

  const goTo = (index) => {
    if (index === current || index < 0 || index >= totalPages) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const nextPage = () => goTo(current + 1);
  const prevPage = () => goTo(current - 1);

  const exportToPdf = async () => {
    const nodes = exportRef.current?.querySelectorAll('.export-page');
    if (!nodes?.length) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5efe2',
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    }

    pdf.save('ashtamkar-book-digital-edition.pdf');
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <aside className="sidebar">
        <div>
          <p className="sidebar-kicker">Book Viewer</p>
          <h2 className="sidebar-title">{bookMeta.title}</h2>
          <p className="sidebar-text">{bookMeta.presenter}</p>
          <p className="sidebar-text muted">{bookMeta.note}</p>
        </div>

        <div className="button-stack">
          <button className="primary-button" onClick={exportToPdf}>Download PDF</button>
          <div className="nav-buttons">
            <button className="secondary-button" onClick={prevPage} disabled={current === 0}>Previous</button>
            <button className="secondary-button" onClick={nextPage} disabled={current === totalPages - 1}>Next</button>
          </div>
        </div>

        <div className="progress-block">
          <div className="progress-meta">
            <span>Progress</span>
            <span>{Math.round(((current + 1) / totalPages) * 100)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((current + 1) / totalPages) * 100}%` }} />
          </div>
        </div>

        <div className="thumb-list">
          {pages.map((item, index) => (
            <button key={item.id} className={`thumb-item ${index === current ? 'active' : ''}`} onClick={() => goTo(index)}>
              <span className="thumb-number">{index + 1}</span>
              <span className="thumb-label">{item.kind === 'cover' ? 'Cover' : item.kind === 'photo' ? item.heading : item.heading || item.title || `Page ${index + 1}`}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="viewer-shell">
        <div className="book-stage">
          <div className="book-shadow" />
          <div className="book-frame">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={page.id} className="page-motion-wrapper" style={{ transformStyle: 'preserve-3d' }} {...pageMotion(direction)}>
                <BookPage page={page} pageNumber={current + 1} totalPages={totalPages} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <div className="export-root" ref={exportRef}>
        {pages.map((item, index) => (
          <div key={item.id} className="export-page">
            <BookPage page={item} pageNumber={index + 1} totalPages={totalPages} exportMode />
          </div>
        ))}
      </div>
    </div>
  );
}
