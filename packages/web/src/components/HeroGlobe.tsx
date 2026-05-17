'use client';

export default function HeroGlobe() {
  return (
    <div style={{ width: 480, height: 480, position: 'relative', flexShrink: 0 }}>
      <style>{`
        @keyframes hg-spin1 { from{transform:rotateX(70deg) rotateZ(0deg)} to{transform:rotateX(70deg) rotateZ(360deg)} }
        @keyframes hg-spin2 { from{transform:rotateX(70deg) rotateZ(0deg)} to{transform:rotateX(70deg) rotateZ(-360deg)} }
        @keyframes hg-spin3 { from{transform:rotateY(75deg) rotateZ(0deg)} to{transform:rotateY(75deg) rotateZ(360deg)} }
        @keyframes hg-spin4 { from{transform:rotateX(40deg) rotateY(20deg) rotateZ(0deg)} to{transform:rotateX(40deg) rotateY(20deg) rotateZ(360deg)} }
        @keyframes hg-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.2;transform:scale(2.8)} }
      `}</style>

      {/* Glow */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:420, height:420, borderRadius:'50%',
        background:'radial-gradient(ellipse at center,rgba(0,217,126,0.25) 0%,transparent 68%)',
        pointerEvents:'none',
      }}/>

      {/* Sphere outline */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:380, height:380, borderRadius:'50%',
        border:'1px solid rgba(0,217,126,0.2)',
      }}/>

      {/* Ring 1 */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        width:370, height:370, marginLeft:-185, marginTop:-185,
        borderRadius:'50%',
        border:'2px solid rgba(0,217,126,0.7)',
        animation:'hg-spin1 16s linear infinite',
      }}/>

      {/* Ring 2 */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        width:330, height:330, marginLeft:-165, marginTop:-165,
        borderRadius:'50%',
        border:'1.5px solid rgba(0,217,126,0.55)',
        animation:'hg-spin2 22s linear infinite',
      }}/>

      {/* Ring 3 */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        width:280, height:280, marginLeft:-140, marginTop:-140,
        borderRadius:'50%',
        border:'1.5px solid rgba(0,217,126,0.4)',
        animation:'hg-spin3 28s linear infinite',
      }}/>

      {/* Ring 4 */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        width:220, height:220, marginLeft:-110, marginTop:-110,
        borderRadius:'50%',
        border:'1px solid rgba(0,217,126,0.3)',
        animation:'hg-spin4 20s linear infinite',
      }}/>

      {/* Nodes */}
      {[
        {top:'8%',  left:'48%', delay:'0s'},
        {top:'22%', left:'88%', delay:'0.5s'},
        {top:'65%', left:'85%', delay:'1s'},
        {top:'82%', left:'46%', delay:'0.3s'},
        {top:'62%', left:'8%',  delay:'0.8s'},
        {top:'22%', left:'10%', delay:'1.3s'},
        {top:'44%', left:'96%', delay:'0.6s'},
        {top:'44%', left:'2%',  delay:'1.6s'},
      ].map((n,i) => (
        <div key={i} style={{
          position:'absolute', top:n.top, left:n.left,
          transform:'translate(-50%,-50%)',
          width:10, height:10, borderRadius:'50%',
          background:'#00d97e',
          boxShadow:'0 0 10px 2px rgba(0,217,126,0.7)',
          animation:`hg-pulse 2.5s ease-in-out ${n.delay} infinite`,
        }}/>
      ))}

      {/* Lines */}
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} viewBox="0 0 480 480">
        <line x1="230" y1="38"  x2="422" y2="106" stroke="#00d97e" strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="422" y1="106" x2="408" y2="312" stroke="#00d97e" strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="408" y1="312" x2="221" y2="394" stroke="#00d97e" strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="221" y1="394" x2="38"  y2="298" stroke="#00d97e" strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="38"  y1="298" x2="48"  y2="106" stroke="#00d97e" strokeWidth="1" strokeOpacity="0.3"/>
        <line x1="48"  y1="106" x2="230" y2="38"  stroke="#00d97e" strokeWidth="1" strokeOpacity="0.3"/>
      </svg>
    </div>
  );
}
