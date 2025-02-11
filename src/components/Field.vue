<template>
  <div v-if="type === 'card' && decrypted">
    <div class="group flex items-stretch">
      <button
        class="text-start border-s-2 py-3 px-4 border-gray-200 w-full flex justify-between items-center"
        :class="copied === 0 ? 'group-hover:bg-green-100 group-hover:border-green-300 group-focus-visible:bg-green-100 group-focus-visible:border-green-100' : 'group-hover:bg-gray-200 group-hover:border-gray-400 group-focus-visible:bg-gray-200 group-focus-visible:border-gray-400'"
        title="Click to copy"
        @click="copyText(cardNumber, 0, true)"
      >
        <div class="flex w-full flex-col">
          <h5 class="text-sm text-gray-500 flex items-center">
            <cb-unlocked class="text-xs me-1 -ms-0.5 text-orange-500" />
            {{ name }}
          </h5>
          <div class="font-code">{{ cardNumber !== '' ? getCardNum(cardNumber) : '---- ---- ---- ----' }}</div>
        </div>
        <cb-checkmark class="text-green-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-if="copied === 0" />
        <cb-copy-file class="text-gray-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-else />
      </button>
    </div>
    <div class="group flex items-stretch" v-show="cardName">
      <button
        class="text-start border-s-2 py-3 px-4 border-gray-200 w-full flex justify-between items-center"
        :class="copied === 1 ? 'group-hover:bg-green-100 group-hover:border-green-300 group-focus-visible:bg-green-100 group-focus-visible:border-green-100' : 'group-hover:bg-gray-200 group-hover:border-gray-400 group-focus-visible:bg-gray-200 group-focus-visible:border-gray-400'"
        title="Click to copy"
        @click="copyText(cardName, 1, true)"
      >
        <div class="flex w-full flex-col">
          <h5 class="text-sm text-gray-500 flex items-center">
            Name on card
          </h5>
          <div class="font-code">{{ cardName }}</div>
        </div>
        <cb-checkmark class="text-green-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-if="copied === 1" />
        <cb-copy-file class="text-gray-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-else />
      </button>
    </div>
    <div class="group flex items-stretch" v-show="cardValid !== '/'">
      <button
        class="text-start border-s-2 py-3 px-4 border-gray-200 w-full flex justify-between items-center"
        :class="copied === 2 ? 'group-hover:bg-green-100 group-hover:border-green-300 group-focus-visible:bg-green-100 group-focus-visible:border-green-100' : 'group-hover:bg-gray-200 group-hover:border-gray-400 group-focus-visible:bg-gray-200 group-focus-visible:border-gray-400'"
        title="Click to copy"
        @click="copyText(cardValid, 2, true)"
      >
        <div class="flex w-full flex-col">
          <h5 class="text-sm text-gray-500 flex items-center">
            Valid until
          </h5>
          <div class="font-code">{{ cardValid }}</div>
        </div>
        <cb-checkmark class="text-green-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-if="copied === 2" />
        <cb-copy-file class="text-gray-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-else />
      </button>
    </div>
    <div class="group flex items-stretch" v-show="cardCVV">
      <button
        class="text-start border-s-2 py-3 px-4 border-gray-200 w-full flex justify-between items-center"
        :class="copied === 3 ? 'group-hover:bg-green-100 group-hover:border-green-300 group-focus-visible:bg-green-100 group-focus-visible:border-green-100' : 'group-hover:bg-gray-200 group-hover:border-gray-400 group-focus-visible:bg-gray-200 group-focus-visible:border-gray-400'"
        title="Click to copy"
        @click="copyText(cardCVV, 3, true)"
      >
        <div class="flex w-full flex-col">
          <h5 class="text-sm text-gray-500 flex items-center">
            CVV
          </h5>
          <div class="font-code">{{ viewingCardCVV ? cardCVV : '•••' }}</div>
        </div>
        <cb-checkmark class="text-green-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-if="copied === 3" />
        <cb-copy-file class="text-gray-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-else />
      </button>
      <button
        class="text-gray-400 px-4"
        :class="copied ? 'group-hover:text-green-600 group-hover:bg-green-200 group-focus-visible:text-green-600 group-focus-visible:bg-green-200' : 'group-hover:text-gray-500 group-hover:bg-gray-300 group-focus-visible:text-gray-500 group-focus-visible:bg-gray-300'"
        @click="toggleViewingCardCVV"
        :title="viewingCardCVV ? 'Hide' : 'Reveal'"
      >
        <cb-view v-if="!viewingCardCVV" />
        <cb-view-off v-else />
      </button>
    </div>
  </div>
  <div class="group flex items-stretch" v-else>
    <button
      class="text-start border-s-2 py-3 px-4 border-gray-200 w-full flex justify-between items-center"
      :class="(copied && (!(type === 'password' || type === 'card') || (type === 'password' || type === 'card') && decrypted)) ? 'group-hover:bg-green-100 group-hover:border-green-300 group-focus-visible:bg-green-100 group-focus-visible:border-green-100' : 'group-hover:bg-gray-200 group-hover:border-gray-400 group-focus-visible:bg-gray-200 group-focus-visible:border-gray-400'"
      :title="((type === 'password' || type === 'card') && !decrypted) ? 'Click to decrypt' : 'Click to copy'"
      @click="((type === 'password' || type === 'card') && !decrypted) ? $emit('view') : copyText(value, true, decrypted)"
    >
      <div class="flex flex-col" v-if="type === 'username'">
        <h5 class="text-sm text-gray-500 flex items-center">
          <cb-user class="text-xs me-1 -ms-0.5" />
          {{ name }}
        </h5>
        <div class="font-code text-wrap break-words">{{ value }}</div>
      </div>
      <div class="flex flex-col" v-else-if="type === 'password'">
        <h5 class="text-sm text-gray-500 flex items-center">
          <cb-unlocked v-if="decrypted" class="text-xs me-1 -ms-0.5 text-orange-500" />
          <cb-locked v-else class="text-xs me-1 -ms-0.5 text-green-600" />
          {{ name }}
        </h5>
        <div class="font-code no-liga text-wrap break-all">
          <Highlight v-if="decrypted && viewing" :value="value" />
          <span v-else>•••••••••••</span>
        </div>
      </div>
      <div class="flex flex-col" v-else-if="type === 'card' && !decrypted">
        <h5 class="text-sm text-gray-500 flex items-center">
          <cb-locked class="text-xs me-1 -ms-0.5 text-green-600" />
          {{ name }}
        </h5>
        <div class="font-code">{{ `•••• •••• •••• ${value[1] || '••••'}` }}</div>
      </div>
      <div class="flex flex-col" v-else>
        <h5 class="text-sm text-gray-500 flex items-center">
          <cb-text-short-paragraph class="text-xs me-1 -ms-0.5" />
          {{ name }}
        </h5>
        <div class="font-code text-wrap break-words">{{ value }}</div>
      </div>
      <cb-unlocked class="text-gray-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" v-if="(type === 'password' || type === 'card') && !decrypted" />
      <cb-checkmark class="text-green-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 ms-1 shrink-0" v-else-if="(copied && (!(type === 'password' || type === 'card') || (type === 'password' || type === 'card') && decrypted))" />
      <cb-copy-file class="text-gray-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 ms-1 shrink-0" v-else />
    </button>
    <button
      class="text-gray-400 px-4"
      :class="copied ? 'group-hover:text-green-600 group-hover:bg-green-200 group-focus-visible:text-green-600 group-focus-visible:bg-green-200' : 'group-hover:text-gray-500 group-hover:bg-gray-300 group-focus-visible:text-gray-500 group-focus-visible:bg-gray-300'"
      v-if="(type === 'password' || type === 'card') && decrypted"
      @click="toggleViewing"
      :title="viewing ? 'Hide' : 'Reveal'"
    >
      <cb-view v-if="!viewing" />
      <cb-view-off v-else />
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import Highlight from './Highlight.vue'

const props = defineProps(['name', 'value', 'type', 'decrypted', 'lock'])
const emit = defineEmits(['reset', 'view'])

const viewing = ref(false)
const viewingCardCVV = ref(false)

const cardNumber = ref('')
const cardName = ref('')
const cardValid = ref('')
const cardCVV = ref('')

const copied = ref(false)
let copiedTimer = null

/**
 * Toggle the viewing flag and emit the reset event so that the lock timer is reset
 */
const toggleViewing = () => {
  viewing.value = !viewing.value
  emit('reset')
}

/**
 * Toggle the viewing card CVV flag and emit the reset event so that the lock timer is reset
 */
const toggleViewingCardCVV = () => {
  viewingCardCVV.value = !viewingCardCVV.value
  emit('reset')
}

/**
 * Get the formatted card number
 * @param {string} num - The card number
 * @returns {string} The formatted card number
 */
const getCardNum = (num) => num.split('').reduce((seed, next, index) => {
  if (index !== 0 && !(index % 4)) seed += ' '
  return seed + next
}, '')

// Watch the lock flag and reset the viewing flag
watch(() => props.lock, () => {
  viewing.value = false
  viewingCardCVV.value = false
})

/**
 * Copy the text to the clipboard and show a tick
 * @param {string} text - The text to copy
 * @param {number} val - The value to set the copied flag to
 * @param {boolean} reset - Whether to reset the copied flag
 */
const copyText = async (text, val, reset) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = val
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => copied.value = false, 400)
    if (reset) emit('reset')
  } catch (err) {
    console.error(err)
  }
}

// Watch the value and decrypted flag and update the card number, name, valid date, and CVV if the value is a card
watch(() => [props.value, props.decrypted], () => {
  if (props.type === 'card' && props.decrypted) {
    const cardData = props.value.split(',')
    cardNumber.value = cardData[0]
    cardName.value = cardData[1]
    cardValid.value = cardData[2]
    cardCVV.value = cardData[3]
  }
})

</script>
