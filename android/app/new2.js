import { registerPlugin } from '@capacitor/core';
const QuantumCrypto = registerPlugin('QuantumCrypto');

async function testQuantum() {
    try {
        const keys = await QuantumCrypto.generateKeys();
        console.log("Public Key:", keys.publicKey);
        console.log("Private Key:", keys.privateKey);
    } catch (e) {
        console.error("Plugin Error:", e);
    }
}

testQuantum();