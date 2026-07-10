import { tokens as T } from "./tokens";

const shimmer = {
  background: `linear-gradient(90deg, ${T.surface} 0%, #FFFFFF 50%, ${T.surface} 100%)`,
  backgroundSize: "200% 100%",
  animation: "forme-shimmer 1.6s linear infinite",
};

const styleTag = `@keyframes forme-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`;

function Bar({ w = "100%", h = 12, className = "" }: { w?: string | number; h?: number; className?: string }) {
  return (
    <div
      className={`rounded-full ${className}`}
      style={{ ...shimmer, width: w, height: h }}
    />
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: T.card, border: `1px solid ${T.border}` }}
    >
      <style>{styleTag}</style>
      {children}
    </div>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <Wrap>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full" style={shimmer} />
        <div className="flex-1 space-y-2">
          <Bar w={80} h={8} />
          <Bar w="60%" h={14} />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Bar />
        <Bar w="90%" />
        <Bar w="70%" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Bar w={100} h={14} />
        <div className="h-9 w-20 rounded-full" style={shimmer} />
      </div>
    </Wrap>
  );
}

export function CompatibilityCardSkeleton() {
  return (
    <Wrap>
      <div className="space-y-3">
        <Bar w={140} h={10} />
        <Bar w="70%" h={14} />
      </div>
      <div className="mt-5 space-y-2">
        <Bar w="90%" />
        <Bar w="80%" />
        <Bar w="60%" />
      </div>
    </Wrap>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      <style>{styleTag}</style>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="h-8 w-8 rounded-full" style={shimmer} />
          <div className="flex-1 rounded-2xl p-5" style={{ background: T.card, border: `1px solid ${T.border}` }}>
            <Bar w="50%" h={14} />
            <div className="mt-2"><Bar w="80%" h={10} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <style>{styleTag}</style>
      <div className="h-12 w-12 rounded-full" style={shimmer} />
      <Bar w={200} h={20} />
      <Bar w={160} h={14} />
    </div>
  );
}