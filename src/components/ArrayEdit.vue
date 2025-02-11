<template>
  <div class="border text-sm border-2" :class="props.readonly ? 'border-gray-100' : 'border-gray-200 focus-within:border-gray-400'">
    <div class="text-gray-400 font-code p-2 text-xs bg-gray-100" v-if="props.title">{{ props.title }}</div>
    <div class="relative" v-show="mode !== 'txt'">
      <textarea v-model="textVal" @keypress.enter.prevent @blur="blur" class="w-full h-full absolute inset-0 outline-none focus:outline-none resize-none font-code no-liga p-2 text-white/0 caret-black break-all whitespace-break-spaces" v-if="!props.readonly" />
      <div ref="el" class="whitespace-break-spaces font-code no-liga pointer-events-none p-2 user-select-none break-all" :class="{ 'bg-gray-50': props.readonly }">{{ textVal || ' ' }}</div>
    </div>
    <div class="relative" v-show="mode === 'txt'">
      <textarea v-model="textInput" @keypress.enter.prevent @blur="blurText" class="w-full h-full absolute inset-0 outline-none focus:outline-none resize-none font-code no-liga p-2 text-white/0 caret-black whitespace-break-spaces" v-if="!props.readonly" />
      <div class="whitespace-break-spaces font-code no-liga pointer-events-none p-2 user-select-none break-all" :class="{ 'bg-gray-50': props.readonly }" ref="eltext">{{ textInput || ' ' }}</div>
    </div>
    <div class="bg-gray-200 text-gray-500 font-code no-liga w-full text-xs p-1.5 px-2 break-all" v-if="base64.length > 0 && currentlyShown === 'base64'">{{ base64 }}</div>
    <div class="bg-gray-200 text-gray-500 font-code no-liga w-full text-xs p-1.5 px-2 break-all" v-if="asciiEncoded.length > 0 && currentlyShown === 'ascii'">
      <div v-for="(v, i) in asciiEncoded" class="inline-block me-1" :key="i">{{ v }}</div>
    </div>
    <div class="bg-gray-100 text-gray-500 font-code no-liga w-full text-xs break-all flex justify-between">
      <div class="flex">
        <button
          class="p-1 px-2"
          :class="mode === 'hex' ? 'bg-gray-300' : 'hover:bg-gray-200'"
          @click="mode = 'hex'"
          title="View as HEX"
        >
          HEX
        </button>
        <button
          class="p-1 px-2"
          :class="mode === 'dec' ? 'bg-gray-300' : 'hover:bg-gray-200'"
          @click="mode = 'dec'"
          title="View as Decimal"
        >
          DEC
        </button>
        <button
          class="p-1 px-2"
          :class="mode === 'txt' ? 'bg-gray-300' : 'hover:bg-gray-200'"
          @click="mode = 'txt'"
          title="View as Text"
        >
          TXT
        </button>
      </div>
      <div class="flex">
        <div class="p-1 px-2">
          Length {{ val.length }}
        </div>
        <button
          class="p-1 px-3 border-l-2 border-gray-200"
          :class="currentlyShown === 'base64' ? 'bg-gray-300' : 'hover:bg-gray-200'"
          @click="toggleShown('base64')"
          title="Show Base64 Encoded"
          v-if="val.length > 0"
        >
          B
        </button>
        <button
          class="p-1 px-3"
          :class="currentlyShown === 'ascii' ? 'bg-gray-300' : 'hover:bg-gray-200'"
          @click="toggleShown('ascii')"
          title="Show ASCII Encoded"
          v-if="val.length > 0"
        >
          A
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, useTemplateRef, nextTick, onMounted, ref, watch, computed } from 'vue'

const val = defineModel()
const props = defineProps(['readonly', 'update', 'title', 'highlight'])

const textVal = ref('')
const base64 = ref('')
const asciiEncoded = ref([])
const mode = ref('hex')
const currentlyShown = ref('base64')
const textInput = ref('')

let skipUpdate = false

// Element references
const el = useTemplateRef('el')
const eltext = useTemplateRef('eltext')

// Highlight
const ranges = new Set()

const HL_RED = 'highlightSpecial'
const HL_BLUE = 'highlightLetters'
const HL_GRAY = 'highlightIgnored'
const HL_GREEN = 'highlightNumbers'
const HL_PURPLE = 'highlightNotice'
const HL_AMBER = 'highlightOther'

/**
 * Build the ASCII encoded string array
 * @param {number[]} current - The current value
 */
const buildAsciiEncoded = (current) => {
  asciiEncoded.value = current.map((v) => {
    if ((v >= 32 && v <= 126) || (v >= 160 && v <=255)) {
      return String.fromCharCode(v)
    }
    return '.'
  })
}

/**
 * Choose the highlight type for the number
 * @param {number} stage - The stage of the highlight. 0: (project id + token) length, 1-40: token, 41-length: project id, length+1-: salt
 * @returns {string} The highlight type
 */
const chooseNumberHighlight = (stage) => {
  if (!(props.highlight && props.highlight === 'lb' && val.value.length > 40 && val.value[0] > 40 && val.value.length > val.value[0])) {
    return HL_BLUE
  }
  const len = val.value[0]
  if (stage === 0) {
    return HL_GREEN
  } else if (stage > 0 && stage <= 40) {
    return HL_BLUE
  } else if (stage > 40 && stage <= len) {
    return HL_AMBER
  } else if (stage > len) {
    return HL_PURPLE
  }
  return HL_BLUE
}

/**
 * Update the value and highlight
 */
const update = () => {
  skipUpdate = true
  if (mode.value === 'hex') {
    textVal.value = val.value.length === 0 ? '[ ]' : `[ ${val.value.map((v) => v.toString(16).toUpperCase().padStart(2, '0')).join(', ')} ]`
  } else {
    textVal.value = val.value.length === 0 ? '[ ]' : `[ ${val.value.join(', ')} ]`
  }
  base64.value = btoa(String.fromCharCode(...val.value))
  textInput.value = String.fromCharCode(...val.value)
  buildAsciiEncoded(val.value)

  nextTick(() => {
    if (CSS.highlights) {
      if (mode.value === 'hex' || mode.value === 'dec') {
        updateHighlight()
      } else {
        updateHighlightText()
      }
    }
  })
}

// Watch for value update
watch(() => props.update, () => {
  update()
})

// Watch for text value update and update the value and highlight
watch(textVal, (newVal) => {
  nextTick(() => {
    updateHighlight()
  })

  // Skip update if the value is not changed
  if (skipUpdate) {
    skipUpdate = false
    return
  }

  // Parse and validate the value
  let parsed
  let fixedVal = newVal.trim().toUpperCase().replace(/\n$/g, '\n ').replace(/,\s*]$/g, ']')
  if (!fixedVal.includes('[') && !fixedVal.includes(']')) {
    fixedVal = `[ ${fixedVal} ]`
  }
  if (mode.value === 'hex') {
    fixedVal = fixedVal.replace(/[0-9A-F]+/g, (match) => parseInt(match, 16).toString())
  }
  try {
    parsed = JSON.parse(fixedVal)
  } catch (e) {
    return
  }
  if (!Array.isArray(parsed)) {
    return
  }
  if (parsed.some((v) => typeof v === 'number' && (v < 0 || v > 255))) {
    return
  }

  // Make sure the value is an array of numbers between 0 and 255
  const filtered = parsed.flat().filter((v) => typeof v === 'number' && v < 256 && v >= 0)
  val.value = filtered
  base64.value = btoa(String.fromCharCode(...filtered))
  textInput.value = String.fromCharCode(...filtered)
  buildAsciiEncoded(filtered)
})

/**
 * Handle the blur event
 */
const blur = () => {
  if (mode.value === 'hex') {
    const next = val.value.length === 0 ? '[ ]' : `[ ${val.value.map((v) => v.toString(16).toUpperCase().padStart(2, '0')).join(', ')} ]`
    if (next !== textVal.value) {
      // Skip the update if the value is not changed
      textVal.value = next
      skipUpdate = true
    }
  } else {
    const next = val.value.length === 0 ? '[ ]' : `[ ${val.value.join(', ')} ]`
    if (next !== textVal.value) {
      // Skip the update if the value is not changed
      textVal.value = next
      skipUpdate = true
    }
  }
}

/**
 * Handle the blur event for the text input
 */
const blurText = () => {
  const decoded = textInput.value.split('').map((v) => v.charCodeAt(0)).flat().filter((v) => typeof v === 'number' && v < 256 && v >= 0)
  textInput.value = String.fromCharCode(...decoded)
  val.value = decoded
  textVal.value = val.value.length === 0 ? '[ ]' : `[ ${val.value.join(', ')} ]`
  buildAsciiEncoded(decoded)
  nextTick(() => {
    updateHighlightText()
  })
}

/**
 * Toggle the shown type
 * @param {string} type - The type to show
 */
const toggleShown = (type) => {
  if (currentlyShown.value === type) {
    currentlyShown.value = null
  } else {
    currentlyShown.value = type
  }
}

// Watch for mode change and update the value and highlight
watch(mode, () => {
  if (mode.value === 'hex') {
    const decoded = textInput.value.split('').map((v) => v.charCodeAt(0))
    textVal.value = decoded.length === 0 ? '[ ]' : `[ ${decoded.map((v) => v.toString(16).toUpperCase().padStart(2, '0')).join(', ')} ]`
    nextTick(() => {
      updateHighlight()
    })
  } else if (mode.value === 'dec') {
    const decoded = textInput.value.split('').map((v) => v.charCodeAt(0))
    textVal.value = decoded.length === 0 ? '[ ]' : `[ ${decoded.join(', ')} ]`
    nextTick(() => {
      updateHighlight()
    })
  } else if (mode.value === 'txt') {
    nextTick(() => {
      updateHighlightText()
    })
  }
})

// Watch for text input change and update the value and highlight
watch(textInput, (newVal) => {
  const decoded = newVal.split('').map((v) => v.charCodeAt(0))
  base64.value = btoa(String.fromCharCode(...decoded))
  val.value = decoded
  buildAsciiEncoded(decoded)
  nextTick(() => {
    updateHighlightText()
  })
})

/**
 * Update the highlight
 */
const updateHighlight = () => {
  if (CSS.highlights) {
    // Remove all the previous highlights
    for (const [range, type] of ranges) {
      if (type !== 'unknown') {
        window[type].delete(range)
      }
    }
    ranges.clear()

    // Then update highlights
    nextTick(() => {
      const ele = el.value.firstChild
      let idx = 0
      let start = 0
      let currentHighlight = HL_GRAY

      // Flags
      // If a syntax error is found, set this to true
      // All the highlights after this will be red
      let onError = false
      // If we have met the starting bracket, set this to true
      let started = false
      // If we have met the closing bracket, set this to true
      let finished = false
      // Keep track of the current number starting index
      let currentNumber = 0
      // Keep track of the current number as a string
      let currentNumberStr = ''
      // If the current number contains an error, set this to true, so the whole number will be red
      let isNumberError = false
      // If we need to close the current number, set this to true
      // If we meet another number while this is true, this indicates a syntax error
      let needCloseNumber = false
      // Keep track of the large blob highlight count for choosing the highlight type
      let lbHighlightCount = 0

      // Go through each character
      for (const char of textVal.value) {
        let currentCharType = null
        if (onError) {
          // If a syntax error is found, all the highlights after this will be red
          currentCharType = HL_RED
        } else if ((char === '[' || char === ' ' || char === '\n') && !started) {
          // Ignore spaces and new lines before the starting bracket
          currentCharType = HL_GRAY
          started = true
        } else if (char === ',' && started && !finished) {
          // If we meet a comma, we need to close the current number
          currentCharType = HL_GRAY
          needCloseNumber = false
          if (currentNumber !== 0) {
            // Then check if the current number is valid
            try {
              const parsedNumber = parseInt(currentNumberStr, mode.value === 'hex' ? 16 : 10)
              if (parsedNumber < 0 || parsedNumber > 255) {
                onError = true
                currentCharType = HL_RED
                isNumberError = true
              } else {
                currentNumberStr = ''
                currentNumber = 0
                lbHighlightCount++
              }
            } catch (e) {
              onError = true
              currentCharType = HL_RED
              isNumberError = true
            }
          } else {
            // If there is no number before the comma, this indicates a syntax error
            onError = true
            currentCharType = HL_RED
          }
        } else if ((char === ' ' || char === '\n') && started && !finished) {
          // If we meet a space or new line, we need to close the current number
          if (currentNumber !== 0) {
            needCloseNumber = true
          }
        } else if (char === ']' && started && !finished) {
          // If we meet the closing bracket, we need to close the current number
          currentCharType = HL_GRAY
          finished = true
          needCloseNumber = false
          if (currentNumber !== 0) {
            // Again, check if the current number is valid
            try {
              const parsedNumber = parseInt(currentNumberStr, mode.value === 'hex' ? 16 : 10)
              if (parsedNumber < 0 || parsedNumber > 255) {
                onError = true
                currentCharType = HL_RED
                isNumberError = true
              } else {
                currentNumberStr = ''
                currentNumber = 0
                lbHighlightCount++
              }
            } catch (e) {
              onError = true
              currentCharType = HL_RED
              isNumberError = true
            }
          }
        } else if (((mode.value === 'hex' && /[0-9a-fA-F]/.test(char)) || (mode.value === 'dec' && char >= '0' && char <= '9')) && started && !finished) {
          // Handle numbers
          if (needCloseNumber) {
            // We meet another number while we need to close the current number, this indicates a syntax error
            currentCharType = HL_RED
            onError = true
          } else {
            // Choose the highlight type for the number
            currentCharType = chooseNumberHighlight(lbHighlightCount)
            if (currentNumber === 0) {
              currentNumber = idx
            }
            currentNumberStr += char
          }
        } else {
          onError = true
          currentCharType = HL_RED
        }

        // If the highlight type is different from the current highlight, close the current highlight and start a new one
        if (currentCharType !== currentHighlight) {
          if (currentHighlight) {
            const range = new Range()
            range.setStart(ele, isNumberError ? currentNumber : start)
            range.setEnd(ele, idx)
            ranges.add([range, currentHighlight])
            window[currentHighlight].add(range)
          }
          currentHighlight = currentCharType
          start = idx
        }
        idx++
      }

      if (currentNumber !== 0) {
        // If there is a number left, check if it is valid
        try {
          const parsedNumber = parseInt(currentNumberStr, mode.value === 'hex' ? 16 : 10)
          if (parsedNumber < 0 || parsedNumber > 255) {
            onError = true
            currentHighlight = HL_RED
            isNumberError = true
          } else {
            currentNumberStr = ''
            currentNumber = 0
            lbHighlightCount++
          }
        } catch (e) {
          onError = true
          currentHighlight = HL_RED
          isNumberError = true
        }
      }

      // Close the last highlight
      if (currentHighlight) {
        const range = new Range()
        range.setStart(ele, isNumberError ? currentNumber : start)
        range.setEnd(ele, idx)
        ranges.add([range, currentHighlight])
        window[currentHighlight].add(range)
      }
    })
  }
}

/**
 * Update the highlight for the text input in large blob highlight mode
 */
const updateHighlightText = () => {
  if (!(props.highlight && props.highlight === 'lb' && val.value.length > 40 && val.value[0] > 40 && val.value.length > val.value[0])) {
    // Not for large blob highlight
    return HL_BLUE
  }
  if (CSS.highlights) {
    // Remove all the previous highlights
    for (const [range, type] of ranges) {
      if (type !== 'unknown') {
        window[type].delete(range)
      }
    }
    ranges.clear()

    // Then update highlights
    nextTick(() => {
      const ele = eltext.value.firstChild
      let idx = 0
      let start = 0
      let currentHighlight = HL_GREEN
      let lbHighlightCount = 0

      // Go through each character
      // We don't need to check the character, but only highlight the character by its index
      for (const _ of textInput.value) {
        // Choose the highlight type for the character
        let currentCharType = chooseNumberHighlight(lbHighlightCount)
        lbHighlightCount++

        // If the highlight type is different from the current highlight, close the current highlight and start a new one
        if (currentCharType !== currentHighlight) {
          if (currentHighlight) {
            const range = new Range()
            range.setStart(ele, start)
            range.setEnd(ele, idx)
            ranges.add([range, currentHighlight])
            window[currentHighlight].add(range)
          }
          currentHighlight = currentCharType
          start = idx
        }
        idx++
      }

      // Close the last highlight
      if (currentHighlight) {
        const range = new Range()
        range.setStart(ele, start)
        range.setEnd(ele, idx)
        ranges.add([range, currentHighlight])
        window[currentHighlight].add(range)
      }
    })
  }
}

// Remove the highlight when the component is unmounted
if (CSS.highlights) {
  onBeforeUnmount(() => {
    for (const [range, type] of ranges) {
      if (type !== 'unknown') {
        window[type].delete(range)
      }
    }
    ranges.clear()
  })
}

// Update the value and highlight when the component is mounted
onMounted(() => {
  update()
})
</script>
