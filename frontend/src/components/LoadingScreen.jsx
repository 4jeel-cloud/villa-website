import { memo } from "react";

export default memo(function LoadingScreen() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#F7F9F7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden'
    }}>
      <div style={{position:'absolute',width:320,height:320,borderRadius:'50%',background:'#E1F0E8',top:-80,right:-80,opacity:0.5}}/>
      <div style={{position:'absolute',width:200,height:200,borderRadius:'50%',background:'#E1F0E8',bottom:-60,left:-40,opacity:0.35}}/>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',zIndex:2}}>
        <div style={{animation:'sway 4s ease-in-out infinite',marginBottom:24}}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path d="M28 8 C28 8 44 16 44 30 C44 40 37 48 28 48 C19 48 12 40 12 30 C12 16 28 8 28 8Z" fill="#C8E6CE" stroke="#5A8A6A" strokeWidth="0.8"/>
            <path d="M28 8 C28 8 32 20 30 34 C29 40 28 48 28 48" stroke="#5A8A6A" strokeWidth="0.8" fill="none"/>
            <path d="M28 22 C22 26 20 30" stroke="#8ABF98" strokeWidth="0.6" fill="none"/>
            <path d="M28 28 C34 32 36 35" stroke="#8ABF98" strokeWidth="0.6" fill="none"/>
          </svg>
        </div>

        <p style={{
          fontFamily:"'Cormorant Garamond', serif",
          fontSize:28, fontWeight:300, fontStyle:'italic',
          color:'#1C3A28', letterSpacing:'0.06em',
          animation:'rise 1s ease both 0.1s', opacity:0
        }}>Creek View Villa</p>

        <p style={{
          fontFamily:"'DM Sans', sans-serif",
          fontSize:11, fontWeight:300, color:'#5A8A6A',
          letterSpacing:'0.2em', textTransform:'uppercase',
          marginTop:6,
          animation:'rise 1s ease both 0.4s', opacity:0
        }}>A place to unwind</p>

        <div style={{
          width:40, height:1, background:'#A8C8B0', margin:'20px auto',
          animation:'widen 1.2s ease both 0.5s', transform:'scaleX(0)',
          transformOrigin:'center'
        }}/>

        <div style={{display:'flex',gap:8,animation:'rise 1s ease both 0.7s',opacity:0}}>
          {[['#7AB890',0],['#5A8A6A',0.25],['#3B6D11',0.5]].map(([c,d],i)=>(
            <div key={i} style={{
              width:5,height:5,background:c,borderRadius:'50%',
              animation:`breathe 1.6s ease-in-out ${d}s infinite`
            }}/>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300&family=DM+Sans:wght@300&display=swap');
        @keyframes sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        @keyframes rise  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes widen { to{transform:scaleX(1)} }
        @keyframes breathe { 0%,100%{opacity:0.3;transform:scale(0.7)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
});
