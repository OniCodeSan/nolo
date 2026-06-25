import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Icon, CarRender } from '../icons.jsx';
import { Avatar, Button, H, Txt } from '../ui.jsx';
import { useAuth } from '../../state/AuthContext.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { listMyConversations, listThreadMessages, sendMessage, markThreadRead } from '../../services/messages.js';
import { getCar, getHost } from '../../services/cars.js';

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

function ConversationItem({ T, c, active, otherName, carName, variant, tone, onClick }) {
  const { t, i18n } = useTranslation();
  const fromMe = c.last?.sender_id === c.myId;
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
      padding: 12, background: active ? T.accentSoft : 'transparent',
      borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <div style={{ width: 44, height: 44, flex: 'none', borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.line}` }}>
        <CarRender T={T} variant={variant || 'hatch'} tone={tone || 'neutral'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
          <Txt T={T} size={13} weight={c.unread > 0 ? 700 : 600} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherName}</Txt>
          <Txt T={T} size={11} color={T.ink3} style={{ flex: 'none' }}>{timeAgo(c.last?.created_at, t, i18n.language)}</Txt>
        </div>
        {carName && <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginBottom: 2 }}>{carName}</Txt>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Txt T={T} size={12} color={c.unread > 0 ? T.ink1 : T.ink2}
            weight={c.unread > 0 ? 600 : 400}
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, lineHeight: 1.4 }}>
            {fromMe ? `${t('messages.you')}: ` : ''}{c.last?.body}
          </Txt>
          {c.unread > 0 && (
            <span style={{
              background: T.coral, color: '#fff', fontFamily: T.fontBody, fontSize: 11, fontWeight: 700,
              padding: '1px 7px', borderRadius: 10, flex: 'none',
            }}>{c.unread}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function Bubble({ T, msg, mine }) {
  const { t, i18n } = useTranslation();
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
      <div style={{
        maxWidth: '78%', padding: '8px 12px',
        background: mine ? T.ink1 : T.surface,
        color: mine ? '#fff' : T.ink1,
        border: mine ? 'none' : `1px solid ${T.line}`,
        borderRadius: 14,
        borderBottomRightRadius: mine ? 4 : 14,
        borderBottomLeftRadius: mine ? 14 : 4,
      }}>
        <Txt T={T} size={13} color="currentColor" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{msg.body}</Txt>
        <Txt T={T} size={10} color={mine ? 'rgba(255,255,255,0.6)' : T.ink3} style={{ display: 'block', marginTop: 2, textAlign: 'right' }}>
          {timeAgo(msg.created_at, t, i18n.language)}
        </Txt>
      </div>
    </div>
  );
}

export function MessagesSection({ T, isDesktop }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const initialBookingId = params.get('b');
  const navigate = useNavigate();

  const [conversations, setConversations] = useState(null);
  const [activeId, setActiveId] = useState(initialBookingId || null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [enrichments, setEnrichments] = useState({});  // bookingId → { car, host, otherName }
  const scrollRef = useRef(null);

  const loadConvos = async () => {
    try {
      const list = await listMyConversations();
      const withMe = list.map(c => ({ ...c, myId: user.id }));
      setConversations(withMe);
      // Enrich con dati car/host per ciascuna conversazione
      const enriched = {};
      for (const c of withMe.slice(0, 30)) {
        try {
          // Trovo l'altro user_id dalla last msg
          const otherId = c.last.sender_id === user.id ? c.last.recipient_id : c.last.sender_id;
          enriched[c.booking_id] = { otherId };
        } catch {}
      }
      setEnrichments(prev => ({ ...prev, ...enriched }));
    } catch (err) {
      toast.error(err.message || t('messages.error_load'));
      setConversations([]);
    }
  };

  useEffect(() => {
    loadConvos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  useEffect(() => {
    if (!activeId) { setThread([]); return; }
    let cancelled = false;
    listThreadMessages(activeId)
      .then(msgs => { if (!cancelled) setThread(msgs); })
      .catch(err => toast.error(err.message || t('messages.error_thread')));
    markThreadRead(activeId).then(() => loadConvos());
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread]);

  const send = async () => {
    const body = text.trim();
    if (!body || !activeId) return;
    const conv = conversations?.find(c => c.booking_id === activeId);
    if (!conv) return;
    const recipientId = conv.last.sender_id === user.id ? conv.last.recipient_id : conv.last.sender_id;
    setSending(true);
    try {
      const m = await sendMessage(activeId, recipientId, body);
      setThread(prev => [...prev, m]);
      setText('');
      loadConvos();
    } catch (err) {
      toast.error(err.message || t('messages.error_send'));
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations?.find(c => c.booking_id === activeId);
  const showList = !isDesktop ? !activeId : true;
  const showThread = !isDesktop ? !!activeId : true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
      <div style={{ padding: isDesktop ? '24px 28px 12px' : '16px 18px 12px', borderBottom: `1px solid ${T.line}` }}>
        <H T={T} size="h3">{t('messages.title')}</H>
        <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
          {t('messages.subtitle')}
        </Txt>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isDesktop ? '320px 1fr' : '1fr', minHeight: 0 }}>
        {showList && (
          <div style={{
            borderRight: isDesktop ? `1px solid ${T.line}` : 'none',
            overflow: 'auto', padding: 10,
          }}>
            {conversations === null ? (
              <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 24 }}>{t('common.loading')}</Txt>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <Icon name="chat" size={28} color={T.ink3} T={T} />
                <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 8, lineHeight: 1.5 }}>
                  {t('messages.empty')}
                </Txt>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {conversations.map(c => (
                  <ConversationItem
                    key={c.booking_id}
                    T={T}
                    c={c}
                    active={activeId === c.booking_id}
                    otherName={t('messages.booking_label', { code: c.booking_id.slice(0, 8).toUpperCase() })}
                    carName={null}
                    onClick={() => {
                      setActiveId(c.booking_id);
                      setParams({ b: c.booking_id });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {showThread && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {!activeId ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Txt T={T} size={13} color={T.ink3}>{t('messages.select_hint')}</Txt>
              </div>
            ) : (
              <>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!isDesktop && (
                    <button onClick={() => { setActiveId(null); setParams({}); }} aria-label={t('messages.back_aria')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Icon name="chevronLeft" size={20} color={T.ink1} T={T} />
                    </button>
                  )}
                  <div style={{ flex: 1 }}>
                    <Txt T={T} size={14} weight={600}>{t('messages.conversation')}</Txt>
                    <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>
                      {t('messages.booking_label', { code: activeId.slice(0, 8).toUpperCase() })}
                    </Txt>
                  </div>
                  <Button T={T} variant="ghost" size="sm" iconRight="chevron" onClick={() => navigate(`/prenotazioni/${activeId}`)}>
                    {t('messages.details')}
                  </Button>
                </div>

                <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '16px 18px', background: T.bg }}>
                  {thread.length === 0 ? (
                    <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 16 }}>
                      {t('messages.thread_empty')}
                    </Txt>
                  ) : thread.map(m => (
                    <Bubble key={m.id} T={T} msg={m} mine={m.sender_id === user.id} />
                  ))}
                </div>

                <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.line}`, background: T.bg, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
                    placeholder={t('messages.input_ph')}
                    rows={2}
                    style={{
                      flex: 1, boxSizing: 'border-box', padding: '10px 12px',
                      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12,
                      fontFamily: T.fontBody, fontSize: 13, color: T.ink1, outline: 'none', resize: 'none', minHeight: 44, maxHeight: 120,
                    }}
                  />
                  <Button T={T} variant="accent" size="md" iconRight="arrowRight" onClick={send} disabled={sending || !text.trim()}>
                    {t('messages.send')}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
