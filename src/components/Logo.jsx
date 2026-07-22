// Draftly wordmark + mark. Pure text set in the app's Archivo face (inherits
// from parent) with a single lime period as the one accent — matching the
// "one loud accent, used rarely" rule in index.css. No image asset, so it
// stays crisp at any size and recolors with CSS.
//
// <Logo />      full wordmark: "draftly."  (header, picker, home)
// <LogoMark />  compact "d." mark          (collapsed nav rail)

export function Logo({ className = '' }) {
  return (
    <span className={`draftly-logo${className ? ` ${className}` : ''}`} aria-label="Draftly">
      draftly<span className="draftly-logo-dot" aria-hidden="true">.</span>
    </span>
  );
}

export function LogoMark({ className = '' }) {
  return (
    <span className={`draftly-logomark${className ? ` ${className}` : ''}`} aria-label="Draftly">
      d<span className="draftly-logo-dot" aria-hidden="true">.</span>
    </span>
  );
}
