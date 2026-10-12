import { useState, useRef, useEffect, useCallback } from "react";
import "./ProductImageZoom.css";

function ProductImageZoom({
  src,
  alt = "Product Image",
  badges = null,
  zoomScale = 2.5,
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [lensStyle, setLensStyle] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [zoomBgStyle, setZoomBgStyle] = useState({ posX: 50, posY: 50, sizeW: 0, sizeH: 0 });

  // Mobile & Fullscreen Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const touchStartRef = useRef({ dist: 0, scale: 1, x: 0, y: 0, panX: 0, panY: 0 });
  const lastTapRef = useRef(0);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  // Lock body scroll when mobile lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setLightboxScale(1);
      setLightboxPan({ x: 0, y: 0 });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  // Handle Desktop Mouse Move for Magnifier
  const handleMouseMove = useCallback((e) => {
    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Verify pointer is within the actual image bounds
    if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
      setIsHovering(false);
      return;
    }

    setIsHovering(true);

    // Dynamic lens size based on zoom factor
    const lensW = Math.max(80, Math.min(rect.width / zoomScale, 220));
    const lensH = Math.max(80, Math.min(rect.height / zoomScale, 220));

    // Center lens over cursor
    let lensX = mouseX - lensW / 2;
    let lensY = mouseY - lensH / 2;

    // Clamp within image bounds
    lensX = Math.max(0, Math.min(lensX, rect.width - lensW));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensH));

    setLensStyle({
      left: Math.round(lensX),
      top: Math.round(lensY),
      width: Math.round(lensW),
      height: Math.round(lensH),
    });

    const maxLensX = rect.width - lensW;
    const maxLensY = rect.height - lensH;

    const ratioX = maxLensX > 0 ? (lensX / maxLensX) * 100 : 50;
    const ratioY = maxLensY > 0 ? (lensY / maxLensY) * 100 : 50;

    setZoomBgStyle({
      posX: ratioX,
      posY: ratioY,
      sizeW: Math.round(rect.width * zoomScale),
      sizeH: Math.round(rect.height * zoomScale),
    });
  }, [zoomScale]);

  const handleMouseEnter = () => {
    // Only trigger hover zoom if device supports fine hover (mouse)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMainClick = () => {
    // Open lightbox for deep inspection (especially on mobile/tablets or click on desktop)
    setIsLightboxOpen(true);
  };

  // Mobile Touch Gestures for Lightbox (Pinch-to-zoom & Pan)
  const getTouchDistance = (t1, t2) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleTouchStart = (e) => {
    setIsTouching(true);
    if (e.touches.length === 2) {
      // 2 fingers: pinch gesture
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      touchStartRef.current.dist = dist;
      touchStartRef.current.scale = lightboxScale;
    } else if (e.touches.length === 1) {
      // 1 finger: pan gesture
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
      touchStartRef.current.panX = lightboxPan.x;
      touchStartRef.current.panY = lightboxPan.y;

      // Double tap detector
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap toggles 1x and 2.5x
        if (lightboxScale > 1.2) {
          setLightboxScale(1);
          setLightboxPan({ x: 0, y: 0 });
        } else {
          setLightboxScale(2.5);
        }
      }
      lastTapRef.current = now;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      if (touchStartRef.current.dist > 0) {
        const factor = currentDist / touchStartRef.current.dist;
        const newScale = Math.max(1, Math.min(touchStartRef.current.scale * factor, 4));
        setLightboxScale(newScale);
        if (newScale <= 1) {
          setLightboxPan({ x: 0, y: 0 });
        }
      }
    } else if (e.touches.length === 1 && lightboxScale > 1) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      setLightboxPan({
        x: touchStartRef.current.panX + deltaX,
        y: touchStartRef.current.panY + deltaY,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    touchStartRef.current.dist = 0;
  };

  const handleZoomIn = () => {
    setLightboxScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setLightboxScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setLightboxPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setLightboxScale(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  return (
    <div className="product-zoom-root">
      {/* Main Image Container */}
      <div
        className="product-zoom-container"
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleMainClick}
      >
        {src ? (
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className="product-zoom-main-img"
          />
        ) : (
          <div className="product-zoom-placeholder">Product Image</div>
        )}

        {/* Badges */}
        {badges}

        {/* Magnifier Lens on Main Image */}
        {isHovering && src && (
          <div
            className="product-zoom-lens"
            style={{
              transform: `translate3d(${lensStyle.left}px, ${lensStyle.top}px, 0)`,
              width: `${lensStyle.width}px`,
              height: `${lensStyle.height}px`,
            }}
          />
        )}

        {/* Mobile / Tap Hint Pill */}
        <div className="product-zoom-mobile-hint">
          <span>🔍</span>
          <span>Tap to expand</span>
        </div>

        {/* Desktop Right-Side Magnified Window */}
        {isHovering && src && (
          <div
            className="product-zoom-preview-window"
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: `${zoomBgStyle.posX}% ${zoomBgStyle.posY}%`,
              backgroundSize: `${zoomBgStyle.sizeW}px ${zoomBgStyle.sizeH}px`,
            }}
          >
            <div className="product-zoom-preview-header">
              <span>🔍 Magnified View · {zoomScale}×</span>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Mobile & Touch Lightbox Modal */}
      {isLightboxOpen && src && (
        <div
          className="product-lightbox-modal"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="product-lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="product-lightbox-topbar">
              <div className="product-lightbox-title-group">
                <span className="product-lightbox-brand">YAMUNA STORE · VRINDAVAN</span>
                <h4 className="product-lightbox-title">{alt}</h4>
              </div>

              <div className="product-lightbox-scale-badge">
                {Math.round(lightboxScale * 100)}% Zoom
              </div>

              <button
                type="button"
                className="product-lightbox-close-btn"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Close zoomed view"
              >
                ✕
              </button>
            </div>

            {/* Interactive Viewport */}
            <div
              className="product-lightbox-viewport"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={src}
                alt={alt}
                className="product-lightbox-img"
                style={{
                  transform: `translate3d(${lightboxPan.x}px, ${lightboxPan.y}px, 0) scale(${lightboxScale})`,
                  transition: isTouching ? "none" : "transform 0.22s ease-out",
                }}
                draggable={false}
              />
            </div>

            {/* Bottom Controls Bar */}
            <div className="product-lightbox-footer">
              <div className="product-lightbox-actions">
                <button
                  type="button"
                  className="lightbox-btn"
                  onClick={handleZoomOut}
                  disabled={lightboxScale <= 1}
                  aria-label="Zoom out"
                >
                  － Zoom Out
                </button>

                <button
                  type="button"
                  className="lightbox-btn lightbox-reset"
                  onClick={handleResetZoom}
                  disabled={lightboxScale === 1 && lightboxPan.x === 0 && lightboxPan.y === 0}
                  aria-label="Reset zoom"
                >
                  Reset (100%)
                </button>

                <button
                  type="button"
                  className="lightbox-btn"
                  onClick={handleZoomIn}
                  disabled={lightboxScale >= 4}
                  aria-label="Zoom in"
                >
                  ＋ Zoom In
                </button>
              </div>

              <p className="product-lightbox-gesture-hint">
                💡 On mobile: Pinch with two fingers or double-tap to zoom in · Drag to inspect fabric weave
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductImageZoom;
