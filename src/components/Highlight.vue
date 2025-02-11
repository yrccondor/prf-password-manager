<template>
  <span ref="val">{{ value }}</span>
</template>

<script setup>
import { onBeforeUnmount, useTemplateRef, nextTick, onMounted, watch } from 'vue'

const props = defineProps(['value'])
const el = useTemplateRef('val')

const ranges = new Set()

/**
 * Update the highlight when the value changes
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
      let currentHighlight = null

      // Go through each character
      for (const char of props.value) {
        let currentCharType = null
        if (`!@#$%^&*_+-=.<>?(){}[]/\\\`'"|:;,~`.includes(char)) {
          // Special characters
          currentCharType = 'highlightSpecial'
        } else {
          const charCode = char.charCodeAt(0)
          if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
            // Letters
            currentCharType = 'highlightLetters'
          } else if (charCode >= 48 && charCode <= 57) {
            // Numbers
            currentCharType = 'highlightNumbers'
          } else {
            // Unknown
            currentCharType = 'unknown'
          }
        }

        // If the character type is different from the current highlight, close the current highlight and start a new one
        if (currentCharType !== currentHighlight) {
          if (currentHighlight && currentHighlight !== 'unknown') {
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

      // Now we reached the end of the string, close and add the last highlight to the set
      if (currentHighlight && currentHighlight !== 'unknown') {
        const range = new Range()
        range.setStart(ele, start)
        range.setEnd(ele, idx)
        ranges.add([range, currentHighlight])
        window[currentHighlight].add(range)
      }
    })
  }
}

// If the CSS highlights are supported, watch the value and update the highlight
// Otherwise, do nothing
if (CSS.highlights) {
  // Watch the value and update the highlight
  watch(() => props.value, () => {
    updateHighlight()
  })

  // Remove all the highlights when the component is destroyed
  onBeforeUnmount(() => {
    for (const [range, type] of ranges) {
      if (type !== 'unknown') {
        window[type].delete(range)
      }
    }
    ranges.clear()
  })

  // Update the highlight when the component is mounted
  onMounted(() => {
    updateHighlight()
  })
}
</script>
