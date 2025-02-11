/**
 * Timer
 *
 * If the type is 'interval', the timer will run every second. When the timer is done, the callback is called with no arguments
 *
 * If the type is 'frame', the timer will run every frame, and the callback is called every frame with the current timer progress (0 to 1) and a boolean indicating if the timer is done
 *
 * @param {Object} options
 * @param {number} options.sec - The number of seconds to run the timer
 * @param {string} options.type - The type of timer, either 'interval' or 'frame'
 * @param {Function} options.callback - The callback to call when the timer is done
 *
 * @method set(sec) - Set the timer to a new number of seconds
 * @method stop() - Stop the timer, callback is not called
 */
export default class Timer {
  constructor({ sec, type, callback }) {
    this.start = Date.now()
    this.end = this.start + sec * 1000
    this.total = sec * 1000
    this.callback = callback
    if (type === 'interval') {
      // Set the interval timer
      this.interval = setInterval(() => {
        if (Date.now() >= this.end) {
          this.callback()
          clearInterval(this.interval)
        }
      }, 1000)
    } else if (type === 'frame') {
      // Set the frame timer
      this.frame = requestAnimationFrame(this.#update.bind(this))
    }
  }

  /**
   * Set the timer to a new number of seconds from now
   * @param {number} sec - The number of seconds to run the timer
   */
  set(sec) {
    this.start = Date.now()
    this.end = this.start + sec * 1000
    this.total = sec * 1000
  }

  /**
   * Update the frame timer
   */
  #update() {
    const now = Date.now()
    this.callback((now - this.start) / this.total, now >= this.end)
    if (now < this.end) {
      this.frame = requestAnimationFrame(this.#update.bind(this))
    }
  }

  /**
   * Stop the timer, callback is not called
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    if (this.frame) {
      cancelAnimationFrame(this.frame)
    }
  }
}