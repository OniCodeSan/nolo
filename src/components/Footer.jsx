import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Txt } from './ui.jsx';
import { Icon } from './icons.jsx';
import { LanguageSwitcher } from './LanguageSwitcher.jsx';
import { useAuth } from '../state/AuthContext.jsx';

const COLS = [
  {
    title: 'MoviQ',
    links: [
      { k: 'footer.magazine', to: '/blog' },
      { k: 'footer.manifesto', to: '/manifesto' },
      { k: 'footer.how', to: '/come-funziona' },
      { k: 'footer.for_hosts', to: '/per-noleggiatori' },
      { k: 'footer.safety', to: '/sicurezza' },
    ],
  },
  {
    titleKey: 'footer.col_support',
    links: [
      { k: 'footer.help_center', to: '/aiuto' },
      { k: 'footer.contact', to: '/contatti' },
    ],
  },
  {
    titleKey: 'footer.col_legal',
    links: [
      { k: 'footer.privacy', to: '/privacy' },
      { k: 'footer.terms', to: '/termini' },
      { k: 'footer.cookie', to: '/cookie' },
    ],
  },
];

export function Footer({ T, isDesktop }) {
  const { t } = useTranslation();
  const { isAuthed, openAuthModal } = useAuth();
  return (
    <footer style={{
      flex: 'none',
      borderTop: `1px solid ${T.line}`,
      background: T.surfaceAlt,
      padding: isDesktop ? '36px 40px 28px' : '24px 18px 24px',
    }}>
      {!isAuthed && (
        <div style={{
          maxWidth: 1280, margin: '0 auto 28px',
          padding: isDesktop ? '20px 24px' : '16px 18px',
          background: T.ink1, color: '#fff',
          borderRadius: T.r.lg,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Txt T={T} size={13} weight={600} color="#fff" style={{ display: 'block', marginBottom: 4 }}>
              {t('footer.host_cta_title')}
            </Txt>
            <Txt T={T} size={12} color="rgba(255,255,255,0.7)">
              {t('footer.host_cta_body')}
            </Txt>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('host')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: T.accent, color: T.ink1,
              border: 'none', borderRadius: T.r.pill, cursor: 'pointer',
              fontFamily: T.fontBody, fontSize: 13, fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {t('footer.host_cta_button')}
            <Icon name="arrowRight" size={14} color={T.ink1} T={T} />
          </button>
        </div>
      )}
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: isDesktop ? 'grid' : 'flex',
        flexDirection: isDesktop ? undefined : 'column',
        gridTemplateColumns: isDesktop ? '1.4fr 1fr 1fr 1fr' : undefined,
        gap: isDesktop ? 36 : 22,
      }}>
        <div>
          <Logo T={T} size={18} />
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 12, lineHeight: 1.55, maxWidth: 360 }}>
            {t('footer.tagline')}
          </Txt>
        </div>
        {COLS.map(col => (
          <div key={col.titleKey || col.title}>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>{col.titleKey ? t(col.titleKey) : col.title}</Txt>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.links.map(link => (
                <li key={link.k}>
                  <Link to={link.to} style={{ color: T.ink1, textDecoration: 'none', fontFamily: T.fontBody, fontSize: 13 }}>{t(link.k)}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{
        maxWidth: 1280, margin: '24px auto 0',
        paddingTop: 16, borderTop: `1px solid ${T.line}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 12, flexWrap: 'wrap',
      }}>
        <Txt T={T} size={12} color={T.ink3}>© {new Date().getFullYear()} MoviQ</Txt>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <LanguageSwitcher T={T} up />
          <Txt T={T} size={12} color={T.ink3}>{t('footer.made')}</Txt>
        </div>
      </div>
    </footer>
  );
}
