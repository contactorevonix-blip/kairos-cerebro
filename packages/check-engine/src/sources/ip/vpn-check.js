'use strict';

/**
 * CHECK ENGINE — VPN / Proxy / Datacenter Detector
 * Usa ip-api.com (free tier, 45 req/min sem key).
 * Detecta: proxy, hosting, VPN conhecida por ASN.
 */

const http = require('node:http');

// ASNs conhecidos de VPN providers (lista curada)
const VPN_ASNS = new Set([
  // NordVPN, ExpressVPN, Mullvad, ProtonVPN, Surfshark, IPVanish, PIA
  'AS9009','AS202425','AS39351','AS51396','AS62240','AS209854',
  'AS47583','AS197540','AS136787','AS23028','AS395954','AS394562',
]);

// ASNs de cloud/datacenter (AWS, GCP, Azure, DigitalOcean, Linode, Hetzner, OVH)
const DC_ASNS = new Set([
  'AS16509','AS14618', // AWS
  'AS15169',           // Google
  'AS8075',            // Azure
  'AS14061',           // DigitalOcean
  'AS63949',           // Linode/Akamai
  'AS24940',           // Hetzner
  'AS16276',           // OVH
  'AS21003','AS35540', // Contabo
]);

const IP_API_FIELDS = 'status,proxy,hosting,query,org,as,isp,country,countryCode,city';

async function fetchIpApi(ip) {
  return new Promise((resolve) => {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${IP_API_FIELDS}`;
    const req  = http.get(url, { timeout: 3000 }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch { resolve(null); }
      });
    });
    req.on('error',   () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function check(ip) {
  if (!ip) return { is_vpn: false, is_datacenter: false, is_proxy: false, reason: 'no_ip' };

  const data = await fetchIpApi(ip);

  if (!data || data.status !== 'success') {
    return { is_vpn: false, is_datacenter: false, is_proxy: false, reason: 'api_error', ip };
  }

  const asn   = (data.as || '').split(' ')[0];
  const vpnByAsn = VPN_ASNS.has(asn);
  const dcByAsn  = DC_ASNS.has(asn);

  return {
    ip,
    is_vpn:       data.proxy === true || vpnByAsn,
    is_datacenter: data.hosting === true || dcByAsn,
    is_proxy:     data.proxy === true,
    asn,
    org:          data.org || data.isp,
    country:      data.countryCode,
    city:         data.city,
    source:       'ip-api.com',
  };
}

async function score(ip) {
  const result = await check(ip);
  let risk = 0;
  const flags = [];

  if (result.is_proxy)      { risk += 28; flags.push('proxy_detected'); }
  if (result.is_vpn)        { risk += 32; flags.push('vpn_detected'); }
  if (result.is_datacenter) { risk += 22; flags.push('datacenter_ip'); }

  risk = Math.min(risk, 55); // cap — VPN não é crime

  return {
    ...result,
    signal:     'ip_vpn',
    risk_score: risk,
    flags,
    flag:       flags[0] || null,
  };
}

module.exports = { check, score };
