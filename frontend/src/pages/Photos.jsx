import { useState, useEffect } from 'react';

const photos = [
  { id: 1,  label: 'Villa exterior',  src: '/carousel/DSC01077.webp' },
  { id: 2,  label: 'Master bedroom',  src: '/carousel/DSC01115.webp' },
  { id: 3,  label: 'Living area',     src: '/carousel/DSC01082.webp' },
  { id: 4,  label: 'Creek view',      src: '/carousel/1.webp'       },
  { id: 5,  label: 'Balcony view',    src: '/carousel/DSC01011.webp' },
  { id: 6,  label: 'Pool area',       src: '/carousel/2.webp'        },
  { id: 7,  label: 'Garden',          src: '/carousel/DSC01097.webp' },
  { id: 8,  label: 'Room interior',   src: '/carousel/DSC01105.webp' },
  { id: 9,  label: 'Forest view',     src: '/carousel/DSC01019.webp' },
  { id: 10, label: 'Bedroom 2',       src: '/carousel/DSC01117.webp' },
  { id: 11, label: 'Terrace',         src: '/carousel/DSC00989.webp' },
  { id: 12, label: 'Morning mist',    src: '/DSC01019.webp'           },
  { id: 13, label: 'Bedroom 3',       src: '/carousel/DSC01117-1.webp' },
  { id: 14, label: 'Bonfire spot',    src: '/carousel/IMG_0969.webp'  },
  { id: 15, label: 'Treetop view',    src: '/carousel/IMG_0972.webp'  },
];

function PhotoCard({ photo, onClick, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 8,
        overflow:     'hidden',
        position:     'relative',
        cursor:       'pointer',
        background:   '#C8DEB8',
        ...style,
      }}
    >
      <img
        src={photo.src}
        alt={photo.label}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div style={{
        position:   'absolute',
        inset:      0,
        background: hovered ? 'rgba(28,58,40,0.35)' : 'rgba(28,58,40,0)',
        transition: 'background 0.25s',
      }} />

    </div>
  );
}

function Lightbox({ photos, current, onClose, onNav }) {
  const photo = photos[current];
  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft')  onNav(-1);
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(14,32,22,0.95)',
        zIndex:         200,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', maxWidth: 840, width: '90%' }}>
        <div
          onClick={onClose}
          style={{
            position:       'absolute',
            top:            -40,
            right:          0,
            background:     'rgba(255,255,255,0.1)',
            border:         '0.5px solid rgba(255,255,255,0.2)',
            color:          '#fff',
            width:          32,
            height:         32,
            borderRadius:   '50%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            cursor:         'pointer',
            fontSize:       16,
          }}
        >
          <i className="ti ti-x" aria-hidden="true" />
        </div>

        <div className="photosLbImg" style={{ borderRadius: 8, overflow: 'hidden', background: '#1C3A28' }}>
          <img
            src={photo.src}
            alt={photo.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <div
            onClick={() => onNav(-1)}
            style={{
              background:     'rgba(255,255,255,0.08)',
              border:         '0.5px solid rgba(255,255,255,0.15)',
              color:          '#fff',
              width:          36,
              height:         36,
              borderRadius:   '50%',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              fontSize:       16,
            }}
          >
            <i className="ti ti-chevron-left" aria-hidden="true" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 300, fontStyle: 'italic', color: '#fff', marginBottom: 3 }}>
              {photo.label}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
              {current + 1} / {photos.length}
            </div>
          </div>
          <div
            onClick={() => onNav(1)}
            style={{
              background:     'rgba(255,255,255,0.08)',
              border:         '0.5px solid rgba(255,255,255,0.15)',
              color:          '#fff',
              width:          36,
              height:         36,
              borderRadius:   '50%',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              fontSize:       16,
            }}
          >
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Photos() {
  const [lbIndex, setLbIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const openLB  = i  => setLbIndex(i);
  const closeLB = () => setLbIndex(null);
  const navLB   = d  => setLbIndex(i => (i + d + photos.length) % photos.length);

  return (
    <div style={{ background: '#F7F4EF', fontFamily: 'DM Sans, sans-serif', minHeight: '100vh' }}>

      <div style={{ background: '#1C3A28', padding: isMobile ? '40px 20px 0' : '48px 40px 0' }}>
        <div style={{
          maxWidth:      1100,
          margin:        '0 auto',
          display:       'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
          alignItems:    'flex-end',
          gap:           24,
          paddingBottom: 32,
          borderBottom:  '0.5px solid rgba(255,255,255,0.1)',
        }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7AB890', marginBottom: 10 }}>
              Gallery
            </p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 300, color: '#fff', lineHeight: 1.15 }}>
              See the villa, <em style={{ fontStyle: 'italic', color: '#A8C8B0' }}>feel the calm</em>
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.7, maxWidth: 400, marginTop: 10 }}>
              Every corner of Creek View Villa is designed to connect you with nature. Browse our gallery and picture yourself here.
            </p>
          </div>
          <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 300, color: 'rgba(255,255,255,0.15)', lineHeight: 1 }}>
              {photos.length}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginTop: 4 }}>
              Photos
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '24px 12px 40px' : '32px 40px 56px', maxWidth: 1100, margin: '0 auto' }}>

        {isMobile ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {photos.map((p, i) => (
              <PhotoCard key={p.id} photo={p} onClick={() => openLB(i)} style={{ aspectRatio: '4/3' }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gridAutoRows:        '64px',
              gap:                 8,
              marginBottom:        8,
            }}>
              <PhotoCard photo={photos[0]} onClick={() => openLB(0)}
                style={{ gridColumn: '1/6', gridRow: '1/7' }} />
              <PhotoCard photo={photos[1]} onClick={() => openLB(1)}
                style={{ gridColumn: '6/10', gridRow: '1/4' }} />
              <PhotoCard photo={photos[2]} onClick={() => openLB(2)}
                style={{ gridColumn: '10/13', gridRow: '1/4' }} />
              <PhotoCard photo={photos[3]} onClick={() => openLB(3)}
                style={{ gridColumn: '6/10', gridRow: '4/7' }} />
              <PhotoCard photo={photos[4]} onClick={() => openLB(4)}
                style={{ gridColumn: '10/13', gridRow: '4/7' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
              {photos.slice(5, 9).map((p, i) => (
                <PhotoCard key={p.id} photo={p} onClick={() => openLB(i + 5)} style={{ height: 180 }} />
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {photos.slice(9).map((p, i) => (
                <PhotoCard key={p.id} photo={p} onClick={() => openLB(i + 9)} style={{ height: 140 }} />
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ background: '#1C3A28', padding: isMobile ? '40px 20px' : '48px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 24 : 28, fontWeight: 300, fontStyle: 'italic', color: '#fff', marginBottom: 8 }}>
          Ready to experience it?
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24, fontWeight: 300 }}>
          Book your stay at Creek View Villa and make these views yours.
        </p>
        <a href="/#booking" style={{
          display:        'inline-block',
          background:     '#fff',
          color:          '#1C3A28',
          padding:        '13px 32px',
          borderRadius:   3,
          fontSize:       12,
          fontWeight:     500,
          letterSpacing:  '0.1em',
          textTransform:  'uppercase',
          textDecoration: 'none',
        }}>
          Book your stay
        </a>
      </div>

      {lbIndex !== null && (
        <Lightbox
          photos={photos}
          current={lbIndex}
          onClose={closeLB}
          onNav={navLB}
        />
      )}
    </div>
  );
}
