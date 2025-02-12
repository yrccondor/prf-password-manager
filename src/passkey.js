import { arrayToBase64String, generateRandomUint8Array } from './tools/functions'

export default {
  /**
   * Register a new passkey
   * @param {boolean} test if true, the passkey will be registered for test
   * @returns {Promise<{ prf: boolean, lb: boolean }|{ firstSalt: Uint8Array, publicKey: PublicKeyCredential, blob: boolean }>} prf and large blob support flags if testing, or the first salt, public key and large blob support flag
   */
  reg: async (test = false) => {
    const challenge = generateRandomUint8Array()
    const userid = generateRandomUint8Array()
    const firstSalt = generateRandomUint8Array()
    const userPrefix = crypto.randomUUID().slice(0, 5)

    const res = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'PRF Password Manager',
        },
        user: {
          id: userid,
          name: test ? 'test-user-delete-after-use' : `prf-user-${userPrefix}`,
          displayName: test ? 'Test User - Delete after use' : `PRF Password Manager User ${userPrefix}`,
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7,
          },
          {
            type: 'public-key',
            alg: -257,
          },
        ],
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required',
        },
        timeout: 120000,
        attestation: 'none',
        extensions: {
          prf: {
            eval: {
              first: firstSalt.buffer,
            },
          },
          largeBlob: {
            support: test ? 'preferred' : 'required',
          }
        },
      },
    })

    const extensionResults = res.getClientExtensionResults()
    if (test) {
      return {
        prf: extensionResults?.prf?.enabled === true,
        lb: extensionResults?.largeBlob?.supported === true
      }
    }
    if (extensionResults?.prf?.enabled) {
      return {
        firstSalt,
        publicKey: res,
        blob: extensionResults?.largeBlob?.supported === true
      }
    }

    throw new Error('Passkey PRF extension not supported')
  },
  /**
   * Get a encryption/decryption key from the passkey
   * @param {Object} config
   * @param {Uint8Array?} config.keyid credential ID
   * @param {Uint8Array} config.firstSalt salt for prf extension
   * @param {ArrayBuffer?} config.write the large blob to be written to the passkey if given
   * @returns {Promise<CryptoKey>} the encryption/decryption key
   */
  getKey: async ({ keyid, firstSalt, write }) => {
    const challenge = generateRandomUint8Array()

    const config = {
      publicKey: {
        challenge,
        userVerification: 'required',
        timeout: 120000,
        extensions: {
          prf: {
            eval: {
              first: firstSalt.buffer,
            },
          },
        },
      },
    }

    if (keyid) {
      config.publicKey.allowCredentials = [{
        type: 'public-key',
        id: keyid, // One and only one credential ID must present
      }]
    }

    if (keyid && write) {
      config.publicKey.extensions.largeBlob = { write }
    }

    const res = await navigator.credentials.get(config)

    const extensionResults = res.getClientExtensionResults()
    if (keyid && write && !extensionResults.largeBlob?.written) {
      throw new Error('Cannot write large blob into passkey')
    }

    if (extensionResults.prf?.results?.first) {
      // Import the key material directly into an encryption key
      const prf = new Uint8Array(extensionResults.prf.results.first)
      return await crypto.subtle.importKey(
        'raw', prf, 'HKDF', false, ['deriveKey']
      )
    }

    throw new Error('Passkey PRF extension error')
  },
  /**
   * Read a large blob from the passkey
   * @param {Object} config
   * @param {Uint8Array?} config.firstSalt salt for prf extension if used
   * @param {boolean} config.withResponse if true, the raw response from the authenticator will be returned
   * @param {Uint8Array[]} config.allowed list of allowed credential IDs
   * @returns {{ blob: Uint8Array, response: PublicKeyCredential, id: Uint8Array } | { blob: Uint8Array, key: CryptoKey, id: Uint8Array } | Uint8Array} the large blob (or with the result of prf or the raw response)
   */
  read: async ({ firstSalt, withResponse, allowed}) => {
    // Generate a random challenge
    const challenge = generateRandomUint8Array()

    const config = {
      publicKey: {
        challenge,
        userVerification: 'required',
        timeout: 120000,
        extensions: {
          largeBlob: {
            read: true,
          },
        },
      },
    }

    if (allowed.length > 0) {
      config.publicKey.allowCredentials = allowed.map((id) => ({
        type: 'public-key',
        id,
      }))
    }

    // If we need to use the prf extension, set it up
    if (firstSalt) {
      config.publicKey.extensions.prf = {
        eval: {
          first: firstSalt.buffer,
        },
      }
    }

    const res = await navigator.credentials.get(config)

    // Get the large blob from the extension results
    const extensionResults = res.getClientExtensionResults()
    if (!extensionResults.largeBlob?.blob) {
      throw new Error('Cannot read large blob from passkey')
    }

    if (withResponse) {
      return {
        blob: new Uint8Array(extensionResults.largeBlob.blob),
        response: res,
        id: res.rawId
      }
    }

    // If we need to use the prf extension, import the key material
    if (firstSalt) {
      if (extensionResults.prf?.results?.first) {
        const prf = new Uint8Array(extensionResults.prf.results.first)
        return {
          key: await crypto.subtle.importKey(
            'raw', prf, 'HKDF', false, ['deriveKey']
          ),
          blob: new Uint8Array(extensionResults.largeBlob.blob),
          id: res.rawId
        }
      }

      throw new Error('Passkey PRF extension error')
    }

    return new Uint8Array(extensionResults.largeBlob.blob)
  },
  /**
   * Write a large blob to the passkey
   * @param {Object} config
   * @param {Uint8Array?} config.keyid credential ID
   * @param {ArrayBuffer?} config.write the large blob to be written to the passkey
   * @returns {Promise<boolean>} true if the large blob was written successfully
   */
  write: async ({ keyid, write }) => {
    const challenge = generateRandomUint8Array()

    const config = {
      publicKey: {
        challenge,
        userVerification: 'required',
        timeout: 120000,
        extensions: {},
      },
    }

    if (keyid) {
      config.publicKey.allowCredentials = [{
        type: 'public-key',
        id: keyid, // One and only one credential ID must present
      }]
    }

    if (keyid && write) {
      config.publicKey.extensions.largeBlob = { write }
    }

    const res = await navigator.credentials.get(config)

    const extensionResults = res.getClientExtensionResults()
    if (keyid && write && !extensionResults.largeBlob?.written) {
      throw new Error('Cannot write large blob into passkey')
    }

    return true
  },
  /**
   * Encrypt a plaintext using the provided key
   * @param {Object} config
   * @param {CryptoKey} config.key master key
   * @param {Uint8Array} config.plaintext data to encrypt
   * @param {string} config.label label to use for HKDF
   * @returns {Promise<{ iv: string, ciphertext: string }>} iv and ciphertext
   */
  encrypt: async ({ key, plaintext, label }) => {
    // Encode the label, safely generate a random salt and iv
    const info = new TextEncoder().encode(label)
    const salt = generateRandomUint8Array()
    const iv = generateRandomUint8Array(12)

    // Derive the encryption key from the salt and the master key
    const encryptionKey = await crypto.subtle.deriveKey(
      { name: 'HKDF', info, salt, hash: 'SHA-256' },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )

    // Now preform the encryption
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      plaintext
    )

    // Encode everything into base64
    return {
      iv: arrayToBase64String(iv),
      ciphertext: `${arrayToBase64String(salt)}|${arrayToBase64String(new Uint8Array(ciphertext))}`
    }
  },
  /**
   * Decrypt a ciphertext using the provided key
   * @param {Object} config
   * @param {CryptoKey} config.key master key
   * @param {string} config.iv base64 encoded iv
   * @param {string} config.ciphertext base64 encoded salt and ciphertext
   * @param {string} config.label label to use for HKDF key derivation
   * @returns {Promise<Uint8Array>} decrypted data
   */
  decrypt: async ({ key, iv, ciphertext, label }) => {
    // Split the ciphertext into the salt and the encrypted message
    const [saltEncoded, msgEncrypted] = ciphertext.split('|')

    // Encode the label, decode the salt, iv, and message
    const info = new TextEncoder().encode(label)
    const salt = Uint8Array.from(window.atob(saltEncoded), c => c.charCodeAt(0))
    const ivDecoded = Uint8Array.from(window.atob(iv), c => c.charCodeAt(0))
    const msg = Uint8Array.from(window.atob(msgEncrypted), c => c.charCodeAt(0))

    // Derive the encryption key from the salt and the master key
    const encryptionKey = await crypto.subtle.deriveKey(
      { name: 'HKDF', info, salt, hash: 'SHA-256' },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )

    // Now preform the decryption
    return new Uint8Array(await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivDecoded },
      encryptionKey,
      msg,
    ))
  }
}
