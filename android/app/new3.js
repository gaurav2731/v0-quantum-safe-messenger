//1. Generate Keys (Receiver side)
const keys = await QuantumCrypto.generateKeys();

// 2. Encapsulate (Sender side - needs Receiver's Public Key)
const result = await QuantumCrypto.encapsulate({ publicKey: keys.publicKey });
// Result contains: sharedSecret, encapsulation

// 3. Encrypt Message (Sender side)
const encrypted = await QuantumCrypto.encryptAES({ 
    message: "Hello Quantum World!", 
    sharedSecret: result.sharedSecret 
});
// Result contains: encryptedMessage, iv

// 4. Decapsulate (Receiver side - needs Encapsulation and Private Key)
const decaps = await QuantumCrypto.decapsulate({ 
    privateKey: keys.privateKey, 
    encapsulation: result.encapsulation 
});

// 5. Decrypt Message (Receiver side)
const decrypted = await QuantumCrypto.decryptAES({ 
    encryptedMessage: encrypted.encryptedMessage, 
    sharedSecret: decaps.sharedSecret, 
    iv: encrypted.iv 
});

console.log(decrypted.decryptedMessage); // "Hello Quantum World!"