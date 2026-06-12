/** DOS classics via js-dos v8, each in an isolated iframe page so its CSS/JS
    never leak into the desktop. Bundles are self-hosted (CORS). */
export function DosGame({ bundle }: { bundle: string }) {
  return (
    <div className="h-full w-full bg-black">
      <iframe
        src={`/dos.html?bundle=${bundle}`}
        title={bundle}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; gamepad"
      />
    </div>
  );
}
