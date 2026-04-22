function PageImage({ image }) {
  return (
    <div className={`page-image page-image--${image.placement || 'inline'}`}>
      <div className="page-image__frame">
        <img src={image.src} alt={image.alt || 'Page visual'} className="page-image__img" />
      </div>
      {image.caption ? <p className="page-image__caption">{image.caption}</p> : null}
    </div>
  );
}

export default PageImage;
