(function () {
  'use strict';

  function getStyles(attrs) {
    var primary = attrs.primaryColor || '#3b82f6';
    var radius = attrs.borderRadius || '8px';
    var font =
      attrs.fontFamily === 'monospace'
        ? 'monospace'
        : attrs.fontFamily === 'Inter'
          ? '"Inter", sans-serif'
          : attrs.fontFamily === 'Roboto'
            ? '"Roboto", sans-serif'
            : 'system-ui, sans-serif';
    return (
      'box-sizing: border-box; font-family: ' +
      font +
      '; border-radius: ' +
      radius +
      '; background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem 1.25rem; color: #334155; font-size: 14px; line-height: 1.5;'
    );
  }

  function initReferralStatus(host, attrs) {
    var appId = attrs.appId || '';
    var primary = attrs.primaryColor || '#3b82f6';
    host.innerHTML =
      '<div style="' +
      getStyles(attrs) +
      '">' +
      '<div style="font-weight: 700; color: ' +
      primary +
      '; margin-bottom: 0.5rem;">Referral Status</div>' +
      '<p style="margin: 0 0 0.5rem;">App: <code style="font-size: 12px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">' +
      (appId || '—') +
      '</code></p>' +
      '<p style="margin: 0; font-size: 13px; color: #64748b;">To show live referrals and rewards, pass <code style="font-size: 11px;">user-id</code> and use our API to load data into your own UI.</p>' +
      '</div>';
  }

  function initReferralShare(host, attrs) {
    var appId = attrs.appId || '';
    var primary = attrs.primaryColor || '#3b82f6';
    host.innerHTML =
      '<div style="' +
      getStyles(attrs) +
      '">' +
      '<div style="font-weight: 700; color: ' +
      primary +
      '; margin-bottom: 0.5rem;">Referral Share</div>' +
      '<p style="margin: 0 0 0.5rem;">App: <code style="font-size: 12px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">' +
      (appId || '—') +
      '</code></p>' +
      '<p style="margin: 0; font-size: 13px; color: #64748b;">Generate a code via <code style="font-size: 11px;">POST /api/v1/referrals</code>, then display and share it from your app.</p>' +
      '</div>';
  }

  function initReferralLeaderboard(host, attrs) {
    var appId = attrs.appId || '';
    var primary = attrs.primaryColor || '#3b82f6';
    host.innerHTML =
      '<div style="' +
      getStyles(attrs) +
      '">' +
      '<div style="font-weight: 700; color: ' +
      primary +
      '; margin-bottom: 0.5rem;">Leaderboard</div>' +
      '<p style="margin: 0 0 0.5rem;">App: <code style="font-size: 12px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">' +
      (appId || '—') +
      '</code></p>' +
      '<p style="margin: 0; font-size: 13px; color: #64748b;">Build a leaderboard using partner analytics or your backend.</p>' +
      '</div>';
  }

  function readAttrs(el) {
    return {
      appId: el.getAttribute('app-id') || '',
      primaryColor: el.getAttribute('primary-color') || '',
      borderRadius: el.getAttribute('border-radius') || '',
      fontFamily: el.getAttribute('font-family') || '',
    };
  }

  if (typeof customElements !== 'undefined') {
    customElements.define(
      'referral-status',
      class ReferralStatus extends HTMLElement {
        connectedCallback() {
          initReferralStatus(this, readAttrs(this));
        }
      }
    );

    customElements.define(
      'referral-share',
      class ReferralShare extends HTMLElement {
        connectedCallback() {
          initReferralShare(this, readAttrs(this));
        }
      }
    );

    customElements.define(
      'referral-leaderboard',
      class ReferralLeaderboard extends HTMLElement {
        connectedCallback() {
          initReferralLeaderboard(this, readAttrs(this));
        }
      }
    );
  }
})();
