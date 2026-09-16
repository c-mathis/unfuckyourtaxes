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
  GA4_ID: '',        // e.g. 'G-XXXXXXXXXX' — MathisLLC Analytics account
  META_PIXEL_ID: '1708599440630382', // dedicated Unfuck Your Taxes dataset
  CLARITY_ID: ''     // optional, e.g. 'y7j0y6q9ri'
};

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
