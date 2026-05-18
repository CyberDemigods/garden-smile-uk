import Script from 'next/script'
import type { MarketingConfig, PurchaseEventData } from '../helpers/index.ts'

interface MarketingScriptsProps {
  config: MarketingConfig
  /**
   * When true, marketing pixels are loaded. When false and
   * config.marketingRequireConsent is also true, scripts are NOT injected.
   * The storefront wires this from its cookie-consent state.
   */
  consentGiven?: boolean
}

/**
 * Server component. Injects GTM, GA4, Google Ads, Meta Pixel, TikTok Pixel
 * scripts into the document head/body based on shop-settings.
 *
 * Use afterInteractive strategy so it does not block first paint.
 */
export function MarketingScripts({ config, consentGiven }: MarketingScriptsProps) {
  const requireConsent = config.marketingRequireConsent ?? true
  if (requireConsent && !consentGiven) return null

  return (
    <>
      {config.gtmContainerId && <GtmScript id={config.gtmContainerId} />}
      {config.ga4MeasurementId && !config.gtmContainerId && (
        <Ga4Script measurementId={config.ga4MeasurementId} />
      )}
      {config.googleAdsConversionId && !config.gtmContainerId && (
        <GoogleAdsScript conversionId={config.googleAdsConversionId} />
      )}
      {config.metaPixelId && <MetaPixelScript pixelId={config.metaPixelId} />}
      {config.tiktokPixelId && <TikTokPixelScript pixelId={config.tiktokPixelId} />}
    </>
  )
}

function GtmScript({ id }: { id: string }) {
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${id}');`}
    </Script>
  )
}

function Ga4Script({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');`}
      </Script>
    </>
  )
}

function GoogleAdsScript({ conversionId }: { conversionId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${conversionId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${conversionId}');`}
      </Script>
    </>
  )
}

function MetaPixelScript({ pixelId }: { pixelId: string }) {
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');`}
    </Script>
  )
}

function TikTokPixelScript({ pixelId }: { pixelId: string }) {
  return (
    <Script id="tiktok-pixel" strategy="afterInteractive">
      {`!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
        var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelId}');
        ttq.page();
        }(window, document, 'ttq');`}
    </Script>
  )
}

interface PurchaseEventProps {
  config: MarketingConfig
  data: PurchaseEventData
  consentGiven?: boolean
}

/**
 * Client-side script that fires the purchase conversion event across all
 * configured channels. Drop on the order confirmation page exactly once.
 */
export function TrackPurchaseEvent({ config, data, consentGiven }: PurchaseEventProps) {
  const requireConsent = config.marketingRequireConsent ?? true
  if (requireConsent && !consentGiven) return null

  const adsConversion =
    config.googleAdsConversionId && config.googleAdsPurchaseLabel
      ? `${config.googleAdsConversionId}/${config.googleAdsPurchaseLabel}`
      : null

  // Encoded JSON kept out of the script string so quotes don't break templating.
  const payload = encodeURIComponent(JSON.stringify(data))

  return (
    <Script id="track-purchase" strategy="afterInteractive">
      {`(function(){
        var data = JSON.parse(decodeURIComponent('${payload}'));
        var items = data.items.map(function(it){
          return {
            item_id: String(it.productId),
            item_name: it.name,
            price: it.price,
            quantity: it.quantity,
          };
        });

        // GA4 / GTM dataLayer purchase event
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'purchase',
          ecommerce: {
            transaction_id: data.orderNumber,
            value: data.totalAmount,
            currency: data.currency,
            items: items,
          },
        });

        ${
          config.ga4MeasurementId && !config.gtmContainerId
            ? `if (typeof gtag === 'function') {
              gtag('event', 'purchase', {
                transaction_id: data.orderNumber,
                value: data.totalAmount,
                currency: data.currency,
                items: items,
              });
            }`
            : ''
        }

        ${
          adsConversion && !config.gtmContainerId
            ? `if (typeof gtag === 'function') {
              gtag('event', 'conversion', {
                send_to: '${adsConversion}',
                value: data.totalAmount,
                currency: data.currency,
                transaction_id: data.orderNumber,
              });
            }`
            : ''
        }

        ${
          config.metaPixelId
            ? `if (typeof fbq === 'function') {
              fbq('track', 'Purchase', {
                value: data.totalAmount,
                currency: data.currency,
                contents: items.map(function(i){return {id: i.item_id, quantity: i.quantity};}),
                content_type: 'product',
              });
            }`
            : ''
        }

        ${
          config.tiktokPixelId
            ? `if (typeof ttq !== 'undefined' && typeof ttq.track === 'function') {
              ttq.track('CompletePayment', {
                value: data.totalAmount,
                currency: data.currency,
                contents: items.map(function(i){return {content_id: i.item_id, quantity: i.quantity, content_name: i.item_name};}),
              });
            }`
            : ''
        }
      })();`}
    </Script>
  )
}

export type { MarketingConfig, PurchaseEventData }
