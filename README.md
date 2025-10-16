# Encrypted Future

A next-generation secure messaging application featuring quantum-resistant cryptography, blockchain verification, tamper detection, and comprehensive audit trails.

## 🔐 Security Features

### 1. Quantum-Safe Encryption
- **AES-256-CBC** encryption for message content
- **Kyber-like algorithm simulation** for quantum-safe key exchange
- **PBKDF2** key derivation with 100,000 iterations
- **HMAC-SHA256** authentication tags for message integrity
- **End-to-end encryption** ensuring only sender and recipient can decrypt

### 2. Blockchain Verification
- **Polygon Mumbai testnet** integration for message metadata storage
- **Immutable audit trail** on blockchain
- **Transaction verification** for message authenticity
- **Wallet integration** with ethers.js
- **Real-time blockchain status** monitoring

### 3. Tamper Detection
- **Cryptographic hash verification** for message integrity
- **Digital signature validation** using HMAC
- **Real-time tampering alerts** with severity levels
- **Timestamp validation** to detect replay attacks
- **Content analysis** for suspicious patterns

### 4. Audit Trail
- **Comprehensive logging** of all security events
- **Immutable log entries** with blockchain verification
- **Security statistics** and monitoring
- **Event filtering** and search capabilities
- **Integrity verification** for audit logs

## 🚀 Features

- **Real-time messaging** with quantum-safe encryption
- **Security dashboard** with live monitoring
- **Blockchain wallet** integration
- **Tamper-proof message verification**
- **Comprehensive audit logging**
- **Modern UI** with dark theme
- **Responsive design** for all devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Cryptography**: CryptoJS, custom quantum-safe implementations
- **Blockchain**: Ethers.js, Polygon Mumbai testnet
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd v0-quantum-safe-messenger-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Blockchain Setup
The application uses Polygon Mumbai testnet by default. To configure:

1. **Get Mumbai testnet MATIC** from [Polygon Faucet](https://faucet.polygon.technology/)
2. **Configure RPC endpoint** in `lib/blockchain.ts`
3. **Update contract address** if deploying custom smart contracts

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_POLYGON_RPC=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

## 🎯 Usage

### Starting a Chat
1. Click **"Start Messaging"** on the landing page
2. The system automatically initializes quantum-safe keys
3. Establish secure channel between users
4. Send encrypted messages with real-time verification

### Security Dashboard
1. Click **"Security Dashboard"** to access monitoring
2. View encryption status and blockchain verification
3. Monitor audit logs and security statistics
4. Check tamper detection alerts

### Message Security
- All messages are **automatically encrypted** with AES-256
- **Digital signatures** verify message authenticity
- **Blockchain metadata** provides immutable proof
- **Tamper detection** alerts on any modifications

## 🔍 Security Architecture

### Encryption Flow
```
1. Generate quantum-safe key pair
2. Perform key agreement between users
3. Derive AES-256 key from shared secret
4. Encrypt message with AES-256-CBC
5. Generate HMAC authentication tag
6. Sign message with sender's private key
7. Store metadata on blockchain
8. Verify integrity on reception
```

### Verification Process
```
1. Verify digital signature
2. Check message hash integrity
3. Validate blockchain metadata
4. Detect tampering attempts
5. Log security events
6. Update audit trail
```

## 🛡️ Security Considerations

### Production Deployment
- **Use real Kyber implementation** instead of simulation
- **Deploy smart contracts** for blockchain verification
- **Implement proper key management** with hardware security modules
- **Add rate limiting** and DDoS protection
- **Use HTTPS** with strong TLS configuration

### Key Management
- **Never store private keys** in plain text
- **Use hardware security modules** for key storage
- **Implement key rotation** policies
- **Secure key exchange** protocols

### Blockchain Security
- **Verify smart contract** code before deployment
- **Use multi-signature wallets** for critical operations
- **Monitor blockchain** for suspicious activity
- **Implement gas optimization** for cost efficiency

## 📊 Monitoring

### Security Metrics
- **Encryption status** - Active/Inactive
- **Blockchain verification** - Verified/Pending
- **Tamper detection** - Clean/Detected
- **Audit trail completeness** - Complete/Incomplete
- **Security score** - 0-100%

### Audit Events
- User initialization
- Secure channel establishment
- Message sending/receiving
- Signature verification
- Blockchain transactions
- Tamper detection alerts

## 🔮 Future Enhancements

- **Real Kyber implementation** for production use
- **Multi-party messaging** with group encryption
- **File sharing** with quantum-safe encryption
- **Voice/video calls** with end-to-end encryption
- **Mobile applications** for iOS and Android
- **Hardware wallet** integration
- **Zero-knowledge proofs** for privacy
- **Decentralized identity** management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration application for educational purposes. The cryptographic implementations are simplified for learning and should not be used in production without proper security audits and real quantum-safe algorithms.

## 🆘 Support

For questions and support:
- Create an issue on GitHub
- Check the documentation
- Review the security considerations

---

**Built with ❤️ for the quantum-safe future**