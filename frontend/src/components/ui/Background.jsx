/** Fixed ambient gradient blobs that give the glass cards something to blur. */
export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-canvas">
      <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] animate-float rounded-full bg-sky-300/50 blur-3xl dark:bg-blue-600/25" />
      <div
        className="absolute -right-32 top-1/4 h-[30rem] w-[30rem] animate-float-slow rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/15"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute -bottom-48 left-1/4 h-[36rem] w-[36rem] animate-float rounded-full bg-fuchsia-200/40 blur-3xl dark:bg-fuchsia-600/20"
        style={{ animationDelay: "-11s" }}
      />
    </div>
  );
}