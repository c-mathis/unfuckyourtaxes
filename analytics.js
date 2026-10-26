/* Unfuck Your Taxes — measurement.
 *
 * One place to set the IDs. Both must be created under the MathisLLC Google
 * account (mathisllc.business@gmail.com). Do NOT reuse unfuckyourweb.com's
 * pixel — mixing two brands' conversion data degrades optimisation for both.
 *
 * Installing GA4 here also unlocks Search Console: GSC can verify ownership
 * from a live Google tag, which is how pluginradar.dev was verified. Set
 * GA4_ID, deploy, then verify in Search Console with no DNS record needed.
 *
 * Privacy floor, inherited from the TRC stack: never send a tax status, a
 * balance, a quiz answer, or any derived outcome to an analytics platform.
 * Events here carry an ID and a surface name, and nothing about the person.
 */
window.UFYT_MEASUREMENT = {
  GA4_ID: 'G-635FZCCJH2', // "Unfuck Your Taxes" property, MathisLLC Analytics account
  META_PIXEL_ID: '1708599440630382', // dedicated Unfuck Your Taxes dataset
  CLARITY_ID: ''     // optional, e.g. 'y7j0y6q9ri'
};

/*
 * Preserve privacy-safe acquisition context before any analytics library
 * loads. The form sends this object only to the private lead Worker. GA and
 * Meta receive the same minimal conversion events they received before.
 *
 * First touch lasts for 90 days in localStorage. Session touch and the page
 * journey live in sessionStorage, so a new browser session gets a new source
 * without erasing the original acquisition source.
 */
(function () {
  'use strict';

  var FIRST_TOUCH_TTL = 90 * 24 * 60 * 60 * 1000;
  var PERSISTENT_KEY = 'ufyt_attribution_v1';
  var SESSION_KEY = 'ufyt_attribution_session_v1';
  var LEGACY_KEY = 'ufyt_tracking';
  var local = getStorage('localStorage');
  var currentSession = getStorage('sessionStorage');
  var persistent = readJson(local, PERSISTENT_KEY) || {};
  var session = readJson(currentSession, SESSION_KEY);

  function getStorage(name) {
    try { return window[name]; } catch (error) { return null; }
  }

  function readJson(storage, key) {
    if (!storage) return null;
    try { return JSON.parse(storage.getItem(key) || 'null'); } catch (error) { return null; }
  }

  function writeJson(storage, key, value) {
    if (!storage) return;
    try { storage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function limit(value, max) {
    if (value == null) return null;
    var text = String(value).trim();
    return text ? text.slice(0, max || 500) : null;
  }

  function pageUrl(value) {
    try {
      var url = new URL(value || window.location.href, window.location.href);
      return limit(url.origin + url.pathname, 500);
    } catch (error) {
      return limit(window.location.pathname, 500);
    }
  }

  function safeReferrer(value) {
    if (!value) return null;
    try {
      var url = new URL(value);
      return limit(url.origin + url.pathname, 500);
    } catch (error) {
      return null;
    }
  }

  function readCookie(name) {
    var prefix = name + '=';
    var parts = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < parts.length; i += 1) {
      var part = parts[i].trim();
      if (part.indexOf(prefix) === 0) return decodeURIComponent(part.slice(prefix.length));
    }
    return null;
  }

  function gaIdentifiers() {
    var clientId = null;
    var sessionId = null;
    var ga = readCookie('_ga');
    if (ga) {
      var gaParts = ga.split('.');
      if (gaParts.length >= 4) clientId = gaParts.slice(-2).join('.');
    }

    var cookies = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < cookies.length && !sessionId; i += 1) {
      var pair = cookies[i].trim().split('=');
      if (pair[0].indexOf('_ga_') !== 0) continue;
      var value = decodeURIComponent(pair.slice(1).join('='));
      var gs2 = value.match(/(?:^|[.$])s(\d+)(?:\$|$)/);
      if (gs2) sessionId = gs2[1];
      else {
        var gs1 = value.split('.');
        if (gs1.length >= 3 && /^\d+$/.test(gs1[2])) sessionId = gs1[2];
      }
    }
    return { ga_client_id: limit(clientId, 100), ga_session_id: limit(sessionId, 100) };
  }

  function searchEngine(hostname) {
    var host = String(hostname || '').replace(/^www\./, '').toLowerCase();
    if (/(^|\.)google\./.test(host)) return 'google';
    if (/(^|\.)bing\.com$/.test(host)) return 'bing';
    if (/(^|\.)search\.yahoo\.com$/.test(host)) return 'yahoo';
    if (/(^|\.)duckduckgo\.com$/.test(host)) return 'duckduckgo';
    if (/(^|\.)search\.brave\.com$/.test(host)) return 'brave';
    if (/(^|\.)ecosia\.org$/.test(host)) return 'ecosia';
    return null;
  }

  function buildTouch() {
    var params = new URLSearchParams(window.location.search);
    var referrer = safeReferrer(document.referrer);
    var source = null;
    var medium = null;
    var referrerHost = null;

    try { referrerHost = referrer ? new URL(referrer).hostname : null; } catch (error) {}

    if (params.get('utm_source')) {
      source = params.get('utm_source');
      medium = params.get('utm_medium') || 'campaign';
    } else if (params.get('gclid')) {
      source = 'google';
      medium = 'paid_search';
    } else if (params.get('fbclid')) {
      source = 'meta';
      medium = 'paid_social';
    } else if (referrerHost && referrerHost !== window.location.hostname) {
      source = searchEngine(referrerHost) || referrerHost.replace(/^www\./, '');
      medium = searchEngine(referrerHost) ? 'organic' : 'referral';
    } else if (persistent.last_touch && referrerHost === window.location.hostname) {
      source = persistent.last_touch.source;
      medium = persistent.last_touch.medium;
    } else {
      source = '(direct)';
      medium = '(none)';
    }

    return {
      source: limit(source, 100),
      medium: limit(medium, 100),
      campaign: limit(params.get('utm_campaign'), 200),
      content: limit(params.get('utm_content'), 200),
      term: limit(params.get('utm_term'), 200),
      landing_page: pageUrl(window.location.href),
      referrer: referrer,
      captured_at: new Date().toISOString(),
      fbclid: limit(params.get('fbclid'), 500),
      gclid: limit(params.get('gclid'), 500)
    };
  }

  function expired(touch) {
    var timestamp = touch && Date.parse(touch.captured_at);
    return !timestamp || Date.now() - timestamp > FIRST_TOUCH_TTL;
  }

  function initialize() {
    var touch;
    if (!session || !session.touch) {
      touch = buildTouch();
      session = {
        started_at: touch.captured_at,
        landing_page: touch.landing_page,
        referrer: touch.referrer,
        touch: touch,
        journey: []
      };
      if (!persistent.first_touch || expired(persistent.first_touch)) persistent.first_touch = touch;
      persistent.last_touch = touch;
    }

    if (!Array.isArray(session.journey)) session.journey = [];
    var currentPath = limit(window.location.pathname || '/', 500);
    var lastPage = session.journey[session.journey.length - 1];
    if (!lastPage || lastPage.path !== currentPath) {
      session.journey.push({ path: currentPath, viewed_at: new Date().toISOString() });
      session.journey = session.journey.slice(-25);
    }

    persistent.expires_at = new Date(Date.now() + FIRST_TOUCH_TTL).toISOString();
    writeJson(local, PERSISTENT_KEY, persistent);
    writeJson(currentSession, SESSION_KEY, session);
  }

  function touchFields(prefix, touch) {
    touch = touch || {};
    var fields = {};
    fields[prefix + '_source'] = touch.source || null;
    fields[prefix + '_medium'] = touch.medium || null;
    fields[prefix + '_campaign'] = touch.campaign || null;
    fields[prefix + '_content'] = touch.content || null;
    fields[prefix + '_term'] = touch.term || null;
    fields[prefix + '_landing_page'] = touch.landing_page || null;
    fields[prefix + '_referrer'] = touch.referrer || null;
    fields[prefix + '_at'] = touch.captured_at || null;
    return fields;
  }

  function getAttribution() {
    initialize();
    var active = session.touch || {};
    var ids = gaIdentifiers();
    var result = Object.assign({
      attribution_version: 1,
      utm_source: active.source === '(direct)' ? null : active.source,
      utm_medium: active.medium === '(none)' ? null : active.medium,
      utm_campaign: active.campaign || null,
      utm_content: active.content || null,
      utm_term: active.term || null,
      fbclid: active.fbclid || null,
      gclid: active.gclid || null,
      fbp: readCookie('_fbp'),
      fbc: readCookie('_fbc') || (active.fbclid ? 'fb.1.' + Date.now() + '.' + active.fbclid : null),
      referrer: session.referrer || null,
      landing_page: session.landing_page || pageUrl(window.location.href),
      session_landing_page: session.landing_page || pageUrl(window.location.href),
      session_referrer: session.referrer || null,
      session_started_at: session.started_at || null,
      current_page: pageUrl(window.location.href),
      page_journey: session.journey.slice(),
      ga_client_id: ids.ga_client_id,
      ga_session_id: ids.ga_session_id
    }, touchFields('first_touch', persistent.first_touch), touchFields('last_touch', persistent.last_touch));

    // Keep the established keys populated for older form code and any visitor
    // who moves between a cached and a newly deployed page.
    writeJson(currentSession, LEGACY_KEY, result);
    writeJson(currentSession, 'tracking_data', result);
    return result;
  }

  initialize();
  window.UFYT_ATTRIBUTION = { get: getAttribution };
})();

(function () {
  'use strict';
  var cfg = window.UFYT_MEASUREMENT;

  if (cfg.GA4_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', cfg.GA4_ID, { anonymize_ip: true });
  }

  if (cfg.META_PIXEL_ID) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    fbq('init', cfg.META_PIXEL_ID);
    fbq('track', 'PageView');
  }

  if (cfg.CLARITY_ID) {
    /* eslint-disable */
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})
    (window,document,"clarity","script",cfg.CLARITY_ID);
    /* eslint-enable */
  }
})();
