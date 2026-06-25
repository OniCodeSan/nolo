import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/icons.jsx';
import { Button, H, Txt } from '../components/ui.jsx';
import { useSeo } from '../lib/seo.js';

export function NotFound({ T }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  useSeo({ title: 'Pagina non trovata', noindex: true });
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: T.bg }}>
      <div style={{ textAlign: 'center', maxWidth: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <span style={{
          width: 80, height: 80, borderRadius: '50%', background: T.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="search" size={32} color={T.ink2} T={T} />
        </span>
        <H T={T} size="display" style={{ fontSize: 88, lineHeight: 1 }}>404</H>
        <H T={T} size="h3">{t('errors.page_404_title')}</H>
        <Txt T={T} size={14} color={T.ink2} style={{ lineHeight: 1.55 }}>
          <code style={{ fontFamily: T.fontMono, background: T.surfaceAlt, padding: '2px 6px', borderRadius: 4 }}>{pathname}</code>
          <br />
          {t('errors.page_404_body')}
        </Txt>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button T={T} variant="outline" size="md" onClick={() => navigate(-1)}>{t('common.back')}</Button>
          <Button T={T} variant="accent" size="md" iconRight="arrowRight" onClick={() => navigate('/')}>{t('nav.home')}</Button>
        </div>
        <Txt T={T} size={12} color={T.ink3} style={{ marginTop: 16 }}>
          Se pensi sia un errore, scrivici a <a href="mailto:hello@moviq.it" style={{ color: T.ink1, textDecoration: 'underline' }}>hello@moviq.it</a>
        </Txt>
      </div>
    </div>
  );
}
