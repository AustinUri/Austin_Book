import PageImage from './PageImage.jsx';

function filterImages(images = [], placement) {
  return images.filter((image) => (image.placement || 'inline') === placement);
}

function PageContent({ page }) {
  const fullImages = filterImages(page.images, 'full');
  const topImages = filterImages(page.images, 'top');
  const bottomImages = filterImages(page.images, 'bottom');
  const leftImages = filterImages(page.images, 'left');
  const rightImages = filterImages(page.images, 'right');
  const inlineImages = (page.images || []).filter(
    (image) => !image.placement || image.placement === 'inline'
  );

  const hasSideImages = leftImages.length > 0 || rightImages.length > 0;

  return (
    <div className="page-content">
      {fullImages.map((image, index) => (
        <PageImage key={`full-${page.pageNumber}-${index}`} image={image} />
      ))}

      {topImages.map((image, index) => (
        <PageImage key={`top-${page.pageNumber}-${index}`} image={image} />
      ))}

      {hasSideImages ? (
        <div className="page-content__side-layout">
          <div className="page-content__side-column">
            {leftImages.map((image, index) => (
              <PageImage key={`left-${page.pageNumber}-${index}`} image={image} />
            ))}
          </div>

          <div className="page-content__text">{page.content}</div>

          <div className="page-content__side-column">
            {rightImages.map((image, index) => (
              <PageImage key={`right-${page.pageNumber}-${index}`} image={image} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="page-content__text">{page.content}</div>
          {inlineImages.map((image, index) => (
            <PageImage key={`inline-${page.pageNumber}-${index}`} image={image} />
          ))}
        </>
      )}

      {bottomImages.map((image, index) => (
        <PageImage key={`bottom-${page.pageNumber}-${index}`} image={image} />
      ))}
    </div>
  );
}

export default PageContent;
