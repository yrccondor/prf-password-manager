# PRF Password Manager

A password management tool as a demonstration and proof of concept of WebAuthn PRF extension and Large Blob extension.

Try it out on [prf.axton.im](https://prf.axton.im/)!

## Features

- Use only passkeys to authenticate and encrypt your passwords. No main passwords to remember.
- Safely store your encrypted passwords with any safe or unsafe storage provider.
- Access to your passwords across all your devices.
- Running entirely in your browser (almost).
- Everything else you can expect from a password manager.

> [!IMPORTANT]
> As this is a demonstration and no further maintenance is planned, this is not a production-ready password manager and should not be used for storing sensitive data. Test use only.

## Usage

For full usage instructions and FAQs, please refer to the help section on [prf.axton.im](https://prf.axton.im/).

## Development

```bash
yarn install
npm run dev
```

and a development version will be available at `localhost:5173`.

For details on usages of the WebAuthn PRF and Large Blob extensions, please refer to [src/passkey.js](https://github.com/yrccondor/prf-password-manager/blob/master/src/passkey.js).

## Deployment

```bash
npm run build
```

and the production version will be available in the `dist` folder.

## License

This project is licensed under the GPLv3 license.

## Thanks

[Matt's Headroom](https://blog.millerti.me/2023/01/22/encrypting-data-in-the-browser-using-webauthn/) and [Levi Schuck](https://levischuck.com/blog/2023-02-prf-webauthn) for the great WebAuthn PRF introductions.

[Peace](https://www.shadertoy.com/view/lX2GDR) and [trinketMage](https://www.shadertoy.com/view/tdG3Rd) for the amazing background shaders.
