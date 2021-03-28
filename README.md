Wallet Service for Cosmos (ATOM)
=====================================

<URL>

How does this work?
----------------

Wallet service is used in conjunction with Signature service to enable secure signing and transaction related functionality for blockchain. Since different blockchain have nuance differences, this services are application specific.

This service should not be called directly (besides during testing) and should only be called through Wallet Aggregator in production. This is to  prevent errors from sending coins on main net. Safeguards are applied on Wallet Aggregator that always defaults any calls to testnet.

Application Flow
-------

Client UI <-> Wallet Aggregator <-> Wallet Service <-> Signature Service

Blockchain Differences
-------

- delegate
- undelegate
- withdraw rewards

Available End points
-------
- GET /test
- GET /nonce?network=<network>
- GET /nonce/reset?network=<network>
- GET /wallet?network=<network>
- GET /wallet/query?network=<network>&nonce=<nonce>
- POST /send [network, amount, senderAdd, receiverAdd]
- POST /delegate [network, amount, senderAdd]
- POST /undelegate [network, amount, senderAdd]
- POST /withdraw/reward [network, senderAdd]

ENV parameters
-------
Available at ./instructions/env.md


Database Initialisation
-------
Available at ./instructions/db.md

## Instructions

To test application:

```bash
$ npm test
```

Install NPM modules on fresh deployment:

```bash
$ npm install
```

To run in development mode:

```bash
$ node index.js
```

To run in production mode:

```bash
$ pm2 start wallet-svc-atom/index.js --name "wallet-atom"
```
