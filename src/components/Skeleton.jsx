function shimmerCss(T) {
  return `
    @keyframes moviq-shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .moviq-skel {
      background: linear-gradient(90deg, ${T.surfaceAlt} 0%, ${T.line} 50%, ${T.surfaceAlt} 100%);
      background-size: 800px 100%;
      animation: moviq-shimmer 1.4s ease-in-out infinite;
      border-radius: ${T.r.sm}px;
    }
  `;
}

export function SkeletonStyles({ T }) {
  return <style>{shimmerCss(T)}</style>;
}

export function SkelLine({ T, w = '100%', h = 12, style = {} }) {
  return <div className="moviq-skel" style={{ width: w, height: h, ...style }} />;
}

export function SkelCircle({ T, size = 40, style = {} }) {
  return <div className="moviq-skel" style={{ width: size, height: size, borderRadius: '50%', ...style }} />;
}

export function CarCardSkeleton({ T, layout = 'card' }) {
  if (layout === 'row') {
    return (
      <div style={{
        background: T.surface, border: `1px solid ${T.line}`,
        borderRadius: T.r.lg, padding: 10, display: 'flex', gap: 10,
        boxShadow: T.sh.soft,
      }}>
        <div className="moviq-skel" style={{ width: 110, aspectRatio: '1.4 / 1', borderRadius: T.r.md, flex: 'none' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
          <SkelLine T={T} w="70%" h={14} />
          <SkelLine T={T} w="50%" h={11} />
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <SkelLine T={T} w={56} h={18} style={{ borderRadius: T.r.pill }} />
            <SkelLine T={T} w={56} h={18} style={{ borderRadius: T.r.pill }} />
          </div>
          <SkelLine T={T} w="40%" h={16} style={{ marginTop: 4 }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, overflow: 'hidden', boxShadow: T.sh.soft,
    }}>
      <div className="moviq-skel" style={{ width: '100%', aspectRatio: '1.5 / 1' }} />
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkelLine T={T} w="80%" h={14} />
        <SkelLine T={T} w="55%" h={12} />
        <div style={{ display: 'flex', gap: 6 }}>
          <SkelLine T={T} w={56} h={20} style={{ borderRadius: T.r.pill }} />
          <SkelLine T={T} w={64} h={20} style={{ borderRadius: T.r.pill }} />
        </div>
        <SkelLine T={T} w="35%" h={18} style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}

export function VehicleSkeleton({ T, isDesktop }) {
  if (isDesktop) {
    return (
      <div style={{ flex: 1, padding: '24px 40px', maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
        <div>
          <div className="moviq-skel" style={{ width: '100%', height: 380, borderRadius: T.r.lg }} />
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkelLine T={T} w="60%" h={36} />
            <SkelLine T={T} w="40%" h={14} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
            {[0,1,2,3].map(i => <div key={i} className="moviq-skel" style={{ height: 80, borderRadius: T.r.md }} />)}
          </div>
          <SkelLine T={T} w="30%" h={22} style={{ marginTop: 30 }} />
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkelLine T={T} h={12} />
            <SkelLine T={T} h={12} />
            <SkelLine T={T} h={12} w="80%" />
          </div>
        </div>
        <div>
          <div className="moviq-skel" style={{ width: '100%', height: 420, borderRadius: T.r.lg }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="moviq-skel" style={{ width: '100%', height: 250 }} />
      <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SkelLine T={T} w="70%" h={28} />
        <SkelLine T={T} w="45%" h={12} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
          {[0,1,2,3].map(i => <div key={i} className="moviq-skel" style={{ height: 60, borderRadius: T.r.md }} />)}
        </div>
        <SkelLine T={T} h={14} w="40%" style={{ marginTop: 12 }} />
        <SkelLine T={T} h={12} />
        <SkelLine T={T} h={12} w="85%" />
      </div>
    </div>
  );
}
