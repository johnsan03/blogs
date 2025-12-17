export function BackgroundFX() {
  // Purely decorative background. Keep it lightweight and respect reduced-motion via CSS.
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      {/* Base */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_15%_-10%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(900px_circle_at_90%_10%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(900px_circle_at_30%_110%,rgba(168,85,247,0.12),transparent_45%)]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-[0.14]" />

      {/* 3D-ish floating orbs */}
      <div className="fx-orb fx-orb-1" />
      <div className="fx-orb fx-orb-2" />
      <div className="fx-orb fx-orb-3" />

      {/* Vignette for readability */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_40%,transparent_35%,rgba(0,0,0,0.35)_100%)] opacity-40 dark:opacity-55" />
    </div>
  );
}


