import { registerPlugin } from '@capacitor/core';
const QuantumCrypto = registerPlugin('QuantumCrypto');

// Example call:
const keys = await QuantumCrypto.generateKeys();
console.log(keys.publicKey);