const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const forge = require('node-forge');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const key = forge.pki.publicKeyFromPem(publicKey.export({ type: 'spki', format: 'pem' }));
const message = Buffer.from('Ssak certificate verification regression');
for (const algorithm of ['sha256', 'sha384', 'sha512']) {
  const digest = crypto.createHash(algorithm).update(message).digest('latin1');
  const signature = crypto.sign(algorithm, message, privateKey).toString('latin1');
  assert.equal(key.verify(digest, signature), true, `Valid ${algorithm} signature rejected`);
  assert.equal(key.verify(digest.replace(/^./s, c => String.fromCharCode(c.charCodeAt(0) ^ 1)), signature), false);
}
const asn1 = forge.asn1;
const make = (type, constructed, value) => asn1.create(asn1.Class.UNIVERSAL, type, constructed, value);
const digest = crypto.createHash('sha256').update(message).digest('latin1');
const oid = make(asn1.Type.OID, false, asn1.oidToDer(forge.oids.sha256).getBytes());
const nil = make(asn1.Type.NULL, false, '');
const garbage = make(asn1.Type.OCTETSTRING, false, 'unconsumed');
for (const children of [[oid], [oid, nil], [oid, nil, garbage], [oid, garbage]]) {
  const info = make(asn1.Type.SEQUENCE, true, [
    make(asn1.Type.SEQUENCE, true, children), make(asn1.Type.OCTETSTRING, false, digest),
  ]);
  const signature = crypto.privateEncrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(asn1.toDer(info).getBytes(), 'latin1')).toString('latin1');
  if (children.length === 1 || children[1] === nil && children.length === 2) {
    assert.equal(key.verify(digest, signature), true, 'Valid optional NULL encoding rejected');
  } else {
    assert.throws(() => key.verify(digest, signature), /DigestInfo/, 'Nested garbage was accepted');
  }
}
console.log('RSA verification: valid SHA-256/384/512, changed digests, optional NULL, nested garbage checks passed.');
