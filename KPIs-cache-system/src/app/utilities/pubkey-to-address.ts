import pkgElliptic from 'elliptic';
const { ec } = pkgElliptic;

import pkgJSsha3 from 'js-sha3';
const { keccak256 } = pkgJSsha3;

const EC = ec;

function pubkeyToAddress(pubkey: string): string {
  console.log(pubkey);
  const ec = new EC('secp256k1');

  console.log('2');
  // Decode public key
  const key = ec.keyFromPublic(pubkey, 'hex');

  console.log('3');
  // Convert to uncompressed format
  const publicKey = key.getPublic().encode('hex', false).slice(2);

  console.log('4');
  // Now apply keccak
  const address = keccak256(Buffer.from(publicKey, 'hex')).slice(64 - 40);

  console.log(`Public Key: 0x${publicKey}`);
  console.log(`Address: 0x${address.toString()}`);

  return address.toString() ?? '';
}

export default pubkeyToAddress;
