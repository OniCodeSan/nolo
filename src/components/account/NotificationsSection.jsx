import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../icons.jsx';
import { Badge, Button, H, Txt } from '../ui.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { listMyNotifications, markAllNotificationsRead, markOneRead } from '../../services/notifications.js';

const KIND_STYLE = {
  booking_confirmed: { icon: 'check', tone: 'success',  labelKey: 'notifications.kind_confirmed' },
  booking_declined:  { icon: 'x',     tone: 'alert',    labelKey: 'notifications.kind_declined' },
  booking_completed: { icon: 'check', tone: 'neutral',  labelKey: 'notifications.kind_completed' },
  booking_request:   { icon: 'bell',  tone: 'accent',   labelKey: 'notifications.kind_request' },
  new_message:       { icon: 'chat',  tone: 'accent',   labelKey: 'notifications.kind_message' },
  system:            { icon: 'sparkle', tone: 'neutral', labelKey: 'notifications.kind_system' },
};

function timeAgo(iso, t, locale) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return t('time.now');
  if (m < 60) return t('time.min_ago', { count: m });
  const h = Math.round(m / 60);
  if (h < 24) return t('time.h_ago', { count: h });
  const d = Math.round(h / 24);
  if (d < 7) return t('time.d_ago', { count: d });
  return new Date(iso).toLocaleDateString(locale);
}

export function NotificationsSection({ T, isDesktop }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [marking, setMarking] = useState(false);

  const load = async () => {
    try {
      setItems(await listMyNotifications({ limit: 100 }));
    } catch (err) {
      toast.error(err.message || t('notifications.error'));
      setItems([]);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const onClick = async (n) => {
    if (!n.read_at) {
      await markOneRead(n.id);
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x));
    }
    if (n.link) navigate(n.link);
  };

  const onMarkAll = async () => {
    setMarking(true);
    try {
      await markAllNotificationsRead();
      toast.success(t('notifications.all_marked'));
      load();
    } catch (err) {
      toast.error(err.message || t('notifications.error'));
    } finally {
      setMarking(false);
    }
  };

  const unreadCount = items?.filter(n => !n.read_at).length || 0;

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '18px 18px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <H T={T} size="h2">{t('notifications.title')}</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
            {t('notifications.subtitle')}
          </Txt>
        </div>
        {unreadCount > 0 && (
          <Button T={T} variant="outline" size="sm" onClick={onMarkAll} disabled={marking}>
            {marking ? t('notifications.marking') : t('notifications.mark_all', { count: unreadCount })}
          </Button>
        )}
      </div>

      {items === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>{t('common.loading')}</Txt>
      ) : items.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: T.surface, border: `1px dashed ${T.line}`, borderRadius: 14 }}>
          <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: T.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Icon name="bell" size={24} color={T.ink2} T={T} />
          </span>
          <H T={T} size="h4">{t('notifications.empty_title')}</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>
            {t('notifications.empty_body')}
          </Txt>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(n => {
            const s = KIND_STYLE[n.kind] || KIND_STYLE.system;
            const unread = !n.read_at;
            return (
              <button key={n.id} onClick={() => onClick(n)} style={{
                width: '100%', textAlign: 'left', border: `1px solid ${unread ? T.accent : T.line}`,
                background: unread ? T.accentSoft : T.surface,
                borderRadius: 12, padding: 14, cursor: n.link ? 'pointer' : 'default',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%', flex: 'none',
                  background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${T.line}`,
                }}>
                  <Icon name={s.icon} size={16} color={T.ink1} T={T} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Txt T={T} size={14} weight={unread ? 700 : 600}>{n.title}</Txt>
                    <Badge T={T} tone={s.tone}>{t(s.labelKey)}</Badge>
                    {unread && <span style={{ width: 8, height: 8, borderRadius: 4, background: T.coral }} />}
                  </div>
                  {n.body && (
                    <Txt T={T} size={12} color={T.ink2} style={{ marginTop: 4, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {n.body}
                    </Txt>
                  )}
                  <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 4 }}>{timeAgo(n.created_at, t, i18n.language)}</Txt>
                </div>
                {n.link && <Icon name="chevron" size={14} color={T.ink2} T={T} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
