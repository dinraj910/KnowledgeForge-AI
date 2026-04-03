export function NexusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 6L22 26V6H26V26.5C26 27.3284 25.3284 28 24.5 28C24.1205 28 23.7547 27.8596 23.4735 27.6042L11 16.2727V26H7V5.5C7 4.67157 7.67157 4 8.5 4C8.87955 4 9.24525 4.14041 9.52654 4.39579L22 15.7273V6H10Z" fill="url(#nexus-grad)" />
      <defs>
        <linearGradient id="nexus-grad" x1="7" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#1877f2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function NexusBrand() {
  return (
    <div className="d-flex align-items-center gap-2">
      <NexusIcon />
      <span className="nexus-brand-text">KnowledgeForge AI</span>
    </div>
  );
}
