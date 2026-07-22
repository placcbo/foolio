import { useCallback, useEffect, useRef, useState } from 'react';
import { TEMPLATE_COMPONENTS } from './templates';
import { TEMPLATE_SAMPLES } from '../data/templateSamples';
import { SAMPLE_RESUME } from '../data/sampleResume';
import { IconArrowLeft } from './icons';

// Fallback only — the real card pitch is measured from the DOM, because the
// card width is set in CSS (--slide-n) and shrinks at narrow breakpoints.
const CARD_W_FALLBACK = 340;

// Past this much pointer travel we treat the gesture as a drag, not a click,
// and swallow the click that follows so dragging across a card doesn't
// accidentally open the editor.
const DRAG_THRESHOLD = 6;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function SliderCard({ template, onPick }) {
  const [color, setColor] = useState(template.swatches[0]);
  const Template = TEMPLATE_COMPONENTS[template.layout];
  const sample = TEMPLATE_SAMPLES[template.id] || SAMPLE_RESUME;
  const previewResume = { ...sample, templateId: template.layout, accentColor: color };

  return (
    <div className="home-slide">
      <button
        type="button"
        className="home-slide-btn"
        onClick={() => onPick(template.layout, color, template.preset)}
        aria-label={`Start with the ${template.name} template`}
      >
        <span className="home-slide-preview" aria-hidden="true">
          <span className="home-slide-scale">
            <Template resume={previewResume} accentColor={color} />
          </span>
        </span>
        <span className="home-slide-overlay" aria-hidden="true">
          Use this template
        </span>
      </button>

      <div className="home-slide-foot">
        <span className="home-slide-name">{template.name}</span>
        {/* Recolouring here means the choice carries into the editor — the
            same accent is handed to onPick, so the first render already
            matches what was clicked. */}
        <div className="home-slide-swatches">
          {template.swatches.slice(0, 4).map((sw) => (
            <button
              type="button"
              key={sw}
              className={`home-slide-swatch${sw === color ? ' is-active' : ''}`}
              style={{ background: sw }}
              onClick={() => setColor(sw)}
              aria-label={`Preview ${template.name} in ${sw}`}
              aria-pressed={sw === color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TemplateSlider({ templates, onPick, onSeeAll }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Measured rather than hard-coded: the previous version paged by a fixed
  // 260px while the real card pitch is 250px, so every press landed just off
  // a snap point and the browser visibly yanked it back into place.
  const pitch = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.children.length < 2) return CARD_W_FALLBACK;
    const a = el.children[0].getBoundingClientRect();
    const b = el.children[1].getBoundingClientRect();
    return Math.round(b.left - a.left) || CARD_W_FALLBACK;
  }, []);

  // How many scroll positions are actually reachable. The last few cards can
  // never sit at the left edge — the track runs out of scrollable distance
  // first — so rendering one dot per template produced dots that could never
  // become active no matter what you clicked. This counts the real snap
  // positions instead, and recomputes on resize since it depends on how many
  // cards fit on screen.
  const snapPositions = useCallback(() => {
    const el = trackRef.current;
    if (!el) return [0];
    const max = el.scrollWidth - el.clientWidth;
    const step = pitch();
    if (max <= 1 || step <= 0) return [0];
    const lastAligned = Math.floor(max / step);
    const out = [];
    for (let i = 0; i <= lastAligned; i++) out.push(i * step);
    // The final stretch is usually shorter than a full card; keep it as its
    // own position so the end of the strip is reachable by dot too.
    if (max - lastAligned * step > 1) out.push(max);
    return out;
  }, [pitch]);

  const [snaps, setSnaps] = useState([0]);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const positions = snapPositions();
    setSnaps(positions);
    // Nearest reachable position, so the marker never points at something
    // the scroll container can't actually be in.
    let nearest = 0;
    positions.forEach((posLeft, i) => {
      if (Math.abs(posLeft - el.scrollLeft) < Math.abs(positions[nearest] - el.scrollLeft)) nearest = i;
    });
    setActive(nearest);
    // 1px of slack: fractional scroll positions mean an exact === comparison
    // leaves the arrow enabled-but-dead at the very end.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, [snapPositions]);

  const scrollToIndex = useCallback(
    (i) => {
      const el = trackRef.current;
      if (!el) return;
      const positions = snapPositions();
      el.scrollTo({
        left: positions[Math.min(i, positions.length - 1)],
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [snapPositions]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  // Pages by whole cards, and by however many fit on screen at once, so a
  // press on a wide monitor advances a full row rather than one card.
  const page = useCallback(
    (dir) => {
      const el = trackRef.current;
      if (!el) return;
      const step = pitch();
      const perView = Math.max(1, Math.floor(el.clientWidth / step));
      el.scrollBy({
        left: dir * step * perView,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [pitch]
  );

  // Drag-to-scroll. Pointer events cover mouse and pen; touch already
  // scrolls natively, so those are left alone rather than fighting the
  // browser's own momentum.
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  // Must be state, not just the ref above: the .is-dragging class switches
  // scroll-snap off for the duration of the drag, and a ref mutation never
  // re-renders — leaving mandatory snapping on, which yanks scrollLeft back
  // to the nearest snap point on every frame and the card never moves.
  const [dragging, setDragging] = useState(false);

  function onPointerDown(e) {
    if (e.pointerType === 'touch') return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  }

  function onPointerMove(e) {
    const el = trackRef.current;
    if (!drag.current.active || !el) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      drag.current.moved = true;
      setDragging(true);
      // Only capture once we're sure it's a drag, so a plain click still
      // reaches the card button underneath.
      el.setPointerCapture?.(e.pointerId);
    }
    if (drag.current.moved) el.scrollLeft = drag.current.startScroll - dx;
  }

  function endDrag(e) {
    const el = trackRef.current;
    if (el?.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    drag.current.active = false;
    setDragging(false);
  }

  function onClickCapture(e) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <div className="home-slider">
      <div className="home-slider-head">
        <div>
          <span className="home-eyebrow" id="home-slider-label">Templates</span>
          <h2 className="home-section-title">Pick where you start.</h2>
        </div>
        <div className="home-slider-arrows">
          <button
            type="button"
            className="home-slider-arrow"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="Previous templates"
          >
            <IconArrowLeft size={18} />
          </button>
          <button
            type="button"
            className="home-slider-arrow"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="More templates"
          >
            <IconArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>

      <div
        className={`home-slider-track${dragging ? ' is-dragging' : ''}`}
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-labelledby="home-slider-label"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {templates.map((t) => (
          <SliderCard key={t.id} template={t} onPick={onPick} />
        ))}
        <button type="button" className="home-slide-all" onClick={onSeeAll}>
          <span>See all<br />templates</span>
          <span className="home-slide-all-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>

      {/* Replaces the raw scrollbar. One dot per REACHABLE scroll position —
          not per template — so every dot maps to a place the strip can
          actually stop, and clicking one jumps there. */}
      <div className="home-slider-dots">
        {snaps.map((posLeft, i) => (
          <button
            type="button"
            key={posLeft}
            className={`home-slider-dot${i === active ? ' is-active' : ''}`}
            onClick={() => scrollToIndex(i)}
            aria-label={`Scroll position ${i + 1} of ${snaps.length}`}
            aria-current={i === active}
          />
        ))}
      </div>
    </div>
  );
}

