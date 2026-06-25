import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Icon } from '../components/icons.jsx';
import { Button, H, Txt } from '../components/ui.jsx';

function buildSections(t) {
  return [
    {
      id: 'come-funziona',
      title: t('help.sec_how'),
      items: [
        { q: t('help.q_book'), a: t('help.a_book') },
        { q: t('help.q_payment'), a: t('help.a_payment') },
        { q: t('help.q_cancel'), a: t('help.a_cancel') },
      ],
    },
    {
      id: 'sicurezza',
      title: t('help.sec_safety'),
      items: [
        { q: t('help.q_verified'), a: t('help.a_verified') },
        { q: t('help.q_insurance'), a: t('help.a_insurance') },
      ],
    },
    {
      id: 'noleggiatori',
      title: t('help.sec_hosts'),
      items: [
        { q: t('help.q_list_car'), a: t('help.a_list_car') },
      ],
    },
    {
      id: 'contatti',
      title: t('help.sec_contacts'),
      items: [
        { q: t('help.q_email'), a: t('help.a_email') },
        { q: t('help.q_phone'), a: t('help.a_phone') },
      ],
    },
    {
      id: 'privacy',
      title: t('help.sec_privacy'),
      items: [
        { q: t('help.q_data'), a: t('help.a_data') },
      ],
    },
    {
      id: 'termini',
      title: t('help.sec_terms'),
      items: [
        { q: t('help.q_current_version'), a: t('help.a_current_version') },
      ],
    },
    {
      id: 'cookie',
      title: t('help.sec_cookie'),
      items: [
        { q: t('help.q_cookies'), a: t('help.a_cookies') },
      ],
    },
  ];
}

function Section({ T, id, title, items, isOpenInitially }) {
  const [openIdx, setOpenIdx] = useState(isOpenInitially ? 0 : -1);
  return (
    <section id={id} style={{ borderTop: `1px solid ${T.line}`, padding: '20px 0' }}>
      <H T={T} size="h4" style={{ marginBottom: 12 }}>{title}</H>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => {
          const open = openIdx === i;
          return (
            <div key={i} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenIdx(open ? -1 : i)}
                aria-expanded={open}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  padding: '14px 16px', background: 'transparent',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <Txt T={T} size={14} weight={600} style={{ flex: 1 }}>{item.q}</Txt>
                <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} color={T.ink2} T={T} />
              </button>
              {open && (
                <div style={{ padding: '0 16px 14px' }}>
                  <Txt T={T} size={13} color={T.ink1} style={{ lineHeight: 1.6 }}>{item.a}</Txt>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Help({ T }) {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const SECTIONS = buildSections(t);

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    // Aspetta il render
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 'none', padding: '14px 18px 12px', borderBottom: `1px solid ${T.line}` }}>
        <H T={T} size="h3">{t('help.page_title')}</H>
        <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
          {t('help.page_subtitle')}
        </Txt>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 18px 24px', maxWidth: 800, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {SECTIONS.map((sec, i) => (
          <Section key={sec.id} T={T} {...sec} isOpenInitially={i === 0} />
        ))}
        <div style={{ marginTop: 24, padding: 18, background: T.accentSoft, borderRadius: T.r.lg, textAlign: 'center' }}>
          <H T={T} size="h5">{t('help.not_found_title')}</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6, marginBottom: 12 }}>
            {t('help.not_found_body')}
          </Txt>
          <Button T={T} variant="primary" size="md" icon="chat" onClick={() => { window.location.href = 'mailto:hello@moviq.it'; }}>
            {t('help.write_email')}
          </Button>
        </div>
      </div>
    </div>
  );
}
