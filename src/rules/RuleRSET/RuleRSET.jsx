import { useState, useRef, useCallback } from "react";
import Rule from "../Rule";
import imgCentralLawn from "../../img/central lawn.jpeg";
import imgSouvenirsShop from "../../img/souvenirs shop.jpeg";

const imageData = [
  { src: imgCentralLawn, name: "central lawn" },
  { src: imgSouvenirsShop, name: "souvenirs shop" },
];

function ZoomableImage({ src, alt }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(0.5, s - e.deltaY * 0.002)));
  }, []);

  const handlePointerDown = useCallback((e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current) return;
    setPos((p) => ({
      x: p.x + e.clientX - lastPos.current.x,
      y: p.y + e.clientY - lastPos.current.y,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const resetAndClose = () => {
    setOpen(false);
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setOpen(true)}
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          width: "200px",
          height: "130px",
          objectFit: "cover",
          borderRadius: "8px",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          margin: "10px",
          cursor: "zoom-in",
        }}
      />

      {open && (
        <div
          onClick={resetAndClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          {/* Close button */}
          <button
            onClick={resetAndClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              fontSize: "28px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
          >
            ✕
          </button>

          {/* Zoom hint */}
          <span
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.5)",
              fontSize: "13px",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            Scroll to zoom · Drag to pan
          </span>

          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            draggable={false}
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: "12px",
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              cursor: dragging.current ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
              transition: dragging.current ? "none" : "transform 0.1s ease",
            }}
          />
        </div>
      )}
    </>
  );
}

export default class RuleRSET extends Rule {
  constructor() {
    super("Your password must include the name of this location at RSET: ");

    const chosen = imageData[Math.floor(Math.random() * imageData.length)];
    this.placeName = chosen.name;
    this.placeWords = chosen.name.toLowerCase().split(/\s+/);

    this.renderItem = () => (
      <ZoomableImage src={chosen.src.src || chosen.src} alt="RSET Location" />
    );
  }

  check(txt) {
    const lower = txt.toLowerCase();
    // All words in the place name must appear in the password
    return this.placeWords.every((word) => lower.includes(word));
  }
}
