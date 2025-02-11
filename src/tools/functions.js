/**
 * Convert an array to a base64 string
 * @param {Uint8Array} a - The array to convert
 * @returns {string} The base64 string
 */
export const arrayToBase64String = (a) => {
  return btoa(String.fromCharCode(...a))
}

/**
 * Get the hostname from a url
 * @param {string} url - The url to get the hostname from
 * @returns {string|false} The hostname or `false` if the url is invalid
 */
export const getHostname = (url) => {
  try {
    return new URL(url).hostname
  } catch (e) {
    return false
  }
}

/**
 * Verify if the format of the data is correct
 *
 * For metadata, it should be `iv|salt|msg`
 *
 * For all other encrypted data, it should be `salt|msg`
 *
 * @param {string} data The data to verify
 * @param {string} type The type of the data
 * @returns {boolean} `true` if the data is valid, otherwise `false`
 */
export const verifyFormat = (data, type) => {
  if (type === 'metadata') {
    const splited = data.split('|')
    if (splited.length !== 3) return false
    const [iv, salt, msg] = splited
    return salt.length > 0 && iv.length > 0 && msg.length > 0
  }
  if (type === 'encrypted') {
    const splited = data.split('|')
    if (splited.length !== 2) return false
    const [salt, msg] = splited
    return salt.length > 0 && msg.length > 0
  }
  return false
}

/**
 * Stringify a date
 * @param {Date} date - The date to stringify
 * @returns {string} The stringified date
 */
export const stringifyDate = (date) => {
  const d = new Date(date)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

/**
 * Check the position of the currently pressed element and adjust the float container position
 * @param {Event} e - The trigger event
 * @returns {string} `top` or `bottom` to adjust the float container position
 */
export const checkScreenPos = (e) => {
  const rect = e.target.getBoundingClientRect()
  const top = rect.top || rect.y
  const bottom = window.innerHeight - top - rect.height
  if (top > bottom) {
    return 'top'
  }
  return 'bottom'
}

/**
 * A `fetch` wrapper that makes fetch simpler
 * @param {string} url url
 * @param {object?} option `fetch` options
 * @param {string?} targetType target content type, use '' to auto detect
 * @returns {Promise<object|string>} response data or response object when error
 */
export const betterFetch = async (url, option = {}, targetType = '') => {
  const response = await fetch(url, option)
  if (response.ok && response.status === 200) {
      if (targetType !== '') {
          return response[targetType]()
      }
      if (response.headers.get('Content-Type').indexOf('/json') !== -1) {
          return response.json()
      }
      if (response.headers.get('Content-Type').indexOf('image/') !== -1) {
          return response.blob()
      }
      return response.text()
  }
  return response
}

/**
 * Generate a new random Uint8Array
 * @returns {Uint8Array}
 */
export const generateRandomUint8Array = (length = 32) => {
  const input = new Uint8Array(length)
  crypto.getRandomValues(input)
  return input
}
