import { Component } from 'react';
import i18n from '../i18n/index.js';
import { Button, H, Txt } from './ui.jsx';
import { Icon } from './icons.jsx';
import { captureException } from '../lib/sentry.js';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[MoviQ] ErrorBoundary caught', error, info);
    captureException(error, { componentStack: info?.componentStack });
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    const { T, children } = this.props;
    if (!this.state.hasError) return children;

    return (
      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, background: T.bg,
      }}>
        <div style={{ maxWidth: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 64, height: 64, borderRadius: '50%', background: T.coralSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={28} color={T.alert} T={T} />
          </span>
          <H T={T} size="h3">{i18n.t('errors.boundary_title')}</H>
          <Txt T={T} size={13} color={T.ink2} style={{ lineHeight: 1.55 }}>
            {i18n.t('errors.boundary_body')}
          </Txt>
          {this.state.error?.message && (
            <code style={{
              fontFamily: T.fontMono, fontSize: 11, color: T.ink3,
              padding: '6px 10px', background: T.surfaceAlt, borderRadius: T.r.sm,
              maxWidth: '100%', wordBreak: 'break-word',
            }}>{this.state.error.message}</code>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button T={T} variant="outline" size="md" onClick={() => { this.reset(); window.location.href = '/'; }}>{i18n.t('errors.go_home')}</Button>
            <Button T={T} variant="accent" size="md" onClick={() => { this.reset(); window.location.reload(); }}>{i18n.t('errors.reload')}</Button>
          </div>
        </div>
      </div>
    );
  }
}
