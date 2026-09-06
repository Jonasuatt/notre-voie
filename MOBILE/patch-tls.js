// Force TLS 1.2 — fix Node.js 22 / Cloudflare incompatibility
// node-fetch@2 uses https.request internally and passes options as object
const https = require('https');
const http  = require('http');

const tlsOpts = { maxVersion: 'TLSv1.2' };

// Override global agents
https.globalAgent = new https.Agent(tlsOpts);

// Wrap https.request to inject TLS options into every call
const _req = https.request.bind(https);
https.request = function(urlOrOptions, optionsOrCb, cb) {
  if (typeof urlOrOptions === 'object' && !Buffer.isBuffer(urlOrOptions)) {
    urlOrOptions = Object.assign({}, urlOrOptions, tlsOpts);
  }
  return _req(urlOrOptions, optionsOrCb, cb);
};
