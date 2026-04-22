# Ashtamkar Book Viewer

A plain JavaScript React + Vite project that turns the supplied Marathi OCR text into a book-style website with page animations, PDF export, and a photo appendix.

## Included already

- OCR text loaded from the supplied `.txt` file
- All supplied photos copied into `public/images/`
- Book-like reading layout
- Page-turn style animation
- PDF export button
- Photo appendix pages at the end of the book
- Original source files kept in:
  - `public/source-book.txt`
  - `public/source-photos.zip`

## Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Main files

- `src/data/bookData.js`  
  Main content source for title, paragraphs, TOC, story chunks, and photo pages.

- `src/App.jsx`  
  Book UI, navigation, animation, and PDF export.

- `src/styles.css`  
  Book styling.

## Note

The uploaded OCR text is not perfectly clean. Obvious junk such as standalone page-number lines and repeated OCR fragments was removed where possible, but proofreading is still worth doing later.

The photos are placed as a dedicated **photo appendix** so they are all included in the website and in the exported PDF. That is the safest choice when exact image positions are not known yet.
