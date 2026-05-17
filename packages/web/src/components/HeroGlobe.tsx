'use client';

const G = '#00d97e';

export default function HeroGlobe() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 460, margin: '0 auto' }}>
      <style>{`
        @keyframes r1 { to { transform: rotate(360deg); } }
        @keyframes r2 { to { transform: rotate(-360deg); } }
        @keyframes r3 { to { transform: rotate(360deg); } }
        @keyframes np { 0%,100%{opacity:1;r:5} 50%{opacity:0.3;r:10} }
        .g-r1{transform-origin:50% 50%;animation:r1 16s linear infinite;}
        .g-r2{transform-origin:50% 50%;animation:r2 22s linear infinite;}
        .g-r3{transform-origin:50% 50%;animation:r3 30s linear infinite;}
        .g-np{animation:np 2.5s ease-in-out infinite;}
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:380, height:380, borderRadius:'50%',
        background:'radial-gradient(ellipse at center, rgba(0,217,126,0.3) 0%, transparent 65%)',
        pointerEvents:'none', zIndex:0,
      }}/>

      <svg viewBox="0 0 460 460" width="100%" style={{display:'block', position:'relative', zIndex:1}}>
        {/* Outer sphere */}
        <circle cx="230" cy="230" r="200" fill="none" stroke={G} strokeWidth="1" strokeOpacity="0.3"/>

        {/* Ring 1 — equatorial */}
        <g className="g-r1" style={{transformOrigin:'230px 230px', transformBox:'fill-box'}}>
          <ellipse cx="230" cy="230" rx="200" ry="58" fill="none" stroke={G} strokeWidth="1.5" strokeOpacity="0.7"/>
          {[0,60,120,180,240,300].map((d,i)=>{
            const r=d*Math.PI/180;
            return <circle key={i} cx={230+200*Math.cos(r)} cy={230+58*Math.sin(r)} r="5" fill={G} fillOpacity="1"/>;
          })}
        </g>

        {/* Ring 2 — tilted reverse */}
        <g className="g-r2" style={{transformOrigin:'230px 230px', transformBox:'fill-box'}}>
          <ellipse cx="230" cy="230" rx="180" ry="70" fill="none" stroke={G} strokeWidth="1.2" strokeOpacity="0.55"/>
          {[0,72,144,216,288].map((d,i)=>{
            const r=d*Math.PI/180;
            return <circle key={i} cx={230+180*Math.cos(r)} cy={230+70*Math.sin(r)} r="4" fill={G} fillOpacity="0.9"/>;
          })}
        </g>

        {/* Ring 3 — polar */}
        <g className="g-r3" style={{transformOrigin:'230px 230px', transformBox:'fill-box'}}>
          <ellipse cx="230" cy="230" rx="65" ry="200" fill="none" stroke={G} strokeWidth="1" strokeOpacity="0.4"/>
          {[0,90,180,270].map((d,i)=>{
            const r=d*Math.PI/180;
            return <circle key={i} cx={230+65*Math.cos(r)} cy={230+200*Math.sin(r)} r="3.5" fill={G} fillOpacity="0.8"/>;
          })}
        </g>

        {/* Pulsing active nodes */}
        {[
          {cx:230,cy:80,d:0},{cx:370,cy:200,d:0.6},{cx:150,cy:310,d:1.2},
          {cx:310,cy:350,d:0.3},{cx:100,cy:190,d:0.9},{cx:330,cy:130,d:1.5},
        ].map((n,i)=>(
          <g key={i}>
            <circle className="g-np" cx={n.cx} cy={n.cy} r="5" fill={G}
              style={{animationDelay:`${n.d}s`, transformOrigin:`${n.cx}px ${n.cy}px`, transformBox:'fill-box'}}/>
            <circle cx={n.cx} cy={n.cy} r="14" fill="none" stroke={G} strokeWidth="1" strokeOpacity="0.35"
              className="g-np"
              style={{animationDelay:`${n.d+0.1}s`, transformOrigin:`${n.cx}px ${n.cy}px`, transformBox:'fill-box'}}/>
          </g>
        ))}

        {/* Connection lines */}
        {[[230,80,370,200],[370,200,310,350],[150,310,310,350],[230,80,100,190],[100,190,150,310]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={G} strokeWidth="1" strokeOpacity="0.3"/>
        ))}
      </svg>
    </div>
  );
}
