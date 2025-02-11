<template>
  <div v-if="type === 'card'">
    <div class="flex items-stretch">
      <div class="w-full">
        <div class="flex items-stretch">
          <div class="text-start border-s-2 py-3 ps-4 pe-2 border-gray-200 w-full flex justify-between items-center">
            <div class="flex w-full flex-col">
              <h5 class="text-sm text-gray-500 flex items-center">
                <cb-unlocked class="text-xs me-1 -ms-0.5 text-orange-500" />
                <input
                  v-model="name"
                  type="text"
                  class="outline-hidden field-sizing-content max-w-[calc(100%-16.5px)] min-w-[12rem] hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
                  placeholder="Card"
                />
              </h5>
              <input
                v-model="editingCardNumber"
                type="tel"
                class="font-code w-[12rem] outline-hidden hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
                inputmode="numeric"
                pattern="[0-9]{13,16}"
                autocomplete="cc-number"
                maxlength="16"
                placeholder="1234123412341234"
              />
            </div>
          </div>
        </div>
        <div class="flex items-stretch">
          <div class="text-start border-s-2 py-3 ps-4 pe-2 border-gray-200 w-full flex justify-between items-center">
            <div class="flex w-full flex-col">
              <h5 class="text-sm text-gray-500 flex items-center italic">
                Name on card
              </h5>
              <input
                v-model="editingCardName"
                type="text"
                class="font-code w-full outline-hidden hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5 inline-block"
                placeholder="Name"
                autocomplete="cc-name"
              />
            </div>
          </div>
        </div>
        <div class="flex items-stretch">
          <div class="text-start border-s-2 py-3 ps-4 pe-2 border-gray-200 w-full flex justify-between items-center">
            <div class="flex w-full flex-col">
              <h5 class="text-sm text-gray-500 flex items-center italic">
                Valid until
              </h5>
              <div>
                <input
                  v-model="editingCardValidM"
                  type="tel"
                  minlength="2"
                  maxlength="2"
                  class="font-code no-liga w-[2rem] outline-hidden hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5 inline-block"
                  placeholder="MM"
                  autocomplete="cc-exp-month"
                  inputmode="numeric"
                  pattern="[0-9]{2}"
                />
                <span class="font-code me-2">/</span>
                <input
                  v-model="editingCardValidY"
                  type="tel"
                  minlength="2"
                  maxlength="2"
                  class="font-code no-liga w-[2rem] outline-hidden hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5 inline-block"
                  placeholder="YY"
                  autocomplete="cc-exp-year"
                  inputmode="numeric"
                  pattern="[0-9]{2}"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-stretch">
          <div class="text-start border-s-2 py-3 ps-4 pe-2 border-gray-200 w-full flex justify-between items-center">
            <div class="flex w-full flex-col">
              <h5 class="text-sm text-gray-500 flex items-center italic">
                CVV
              </h5>
              <input
                v-model="editingCardCVV"
                :type="viewing ? 'tel' : 'password'"
                minlength="3"
                maxlength="4"
                class="font-code no-liga w-[3.5rem] outline-hidden hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
                placeholder="123"
                autocomplete="cc-csc"
                inputmode="numeric"
                pattern="[0-9]{3,4}"
              />
            </div>
          </div>
          <button
            class="text-gray-400 px-2 sm:px-4 hover:text-gray-500 hover:bg-gray-200 focus-visible:text-gray-500 focus-visible:bg-gray-200"
            @click="viewing = !viewing"
            :title="viewing ? 'Hide' : 'Reveal'"
          >
            <cb-view v-if="!viewing" />
            <cb-view-off v-else />
          </button>
        </div>
      </div>
      <Popover v-slot="{ open }" class="relative">
        <PopoverButton
          :class="open ? 'text-red-600 bg-red-100' : ''"
          class="text-gray-400 px-2 sm:px-4 hover:text-red-600 hover:bg-red-100 focus-visible:text-red-600 focus-visible:bg-red-100 h-full flex pt-7"
          :title="open ? 'Cancel' : 'Delete field'"
        >
          <cb-close v-if="open" />
          <cb-trash-can v-else />
        </PopoverButton>
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-x-2 opacity-0"
          enter-to-class="translate-x-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-x-0 opacity-100"
          leave-to-class="translate-x-2 opacity-0"
        >
          <PopoverPanel v-slot="{ close }" class="absolute z-50 w-64 p-4 bg-red-50 right-full top-0 me-2 text-sm border-red-100 border-[1px]">
            <div class="overflow-hidden">
              <span class="opacity-80">Do you want to delete this card? Data will be lost.</span>
              <div class="flex justify-end mt-2">
                <button
                  class="text-red-600 hover:text-red-800 focus-visible:text-red-800 bg-red-100 hover:bg-red-200 focus-visible:bg-red-200 px-3 py-2"
                  @click="emitDelete(close)"
                >
                  Delete
                </button>
              </div>
            </div>
          </PopoverPanel>
        </transition>
      </Popover>
    </div>
  </div>
  <div class="flex items-stretch" v-else>
    <div class="text-start border-s-2 py-3 ps-4 pe-2 border-gray-200 w-full flex justify-between items-center">
      <div class="flex flex-col w-full" v-if="type === 'username'">
        <h5 class="text-sm text-gray-500 flex items-center">
          <cb-user class="text-xs me-1 -ms-0.5" />
          <input
            v-model="name"
            type="text"
            class="outline-hidden field-sizing-content max-w-[calc(100%-16.5px)] min-w-[10rem] hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
            placeholder="Username"
          />
        </h5>
        <input
          v-model="value"
          type="text"
          class="font-code w-full outline-hidden hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
          placeholder="Username"
        />
      </div>
      <div class="flex flex-col w-full" v-else-if="type === 'password'">
        <h5 class="text-sm text-gray-500 flex items-center">
          <cb-unlocked class="text-xs me-1 -ms-0.5 text-orange-500" />
          <input
            v-model="name"
            type="text"
            class="outline-hidden field-sizing-content max-w-[calc(100%-16.5px)] min-w-[10rem] hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
            placeholder="Password"
          />
        </h5>
        <input
          v-model="value"
          :type="viewing ? 'text' : 'password'"
          class="font-code no-liga w-full outline-hidden hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
          placeholder="Password"
        />
      </div>
      <div class="flex flex-col w-full" v-else>
        <h5 class="text-sm text-gray-500 flex items-center">
          <cb-text-short-paragraph class="text-xs me-1 -ms-0.5" />
          <input
            v-model="name"
            type="text"
            class="outline-hidden field-sizing-content max-w-[calc(100%-16.5px)] min-w-[10rem] hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
            placeholder="Field name"
          />
        </h5>
        <input
          v-model="value"
          type="text"
          class="font-code w-full outline-hidden hover:border-dashed border-2 border-transparent hover:border-gray-300 focus:border-dashed focus:border-2 focus:border-gray-400 hover:px-1 focus:px-1 transition-[padding] -ms-0.5"
          placeholder="Field content"
        />
      </div>
    </div>
    <button
      class="text-gray-400 px-2 sm:px-4 hover:text-gray-500 hover:bg-gray-200 focus-visible:text-gray-500 focus-visible:bg-gray-200"
      v-if="type === 'password'"
      @click="viewing = !viewing"
      :title="viewing ? 'Hide' : 'Reveal'"
    >
      <cb-view v-if="!viewing" />
      <cb-view-off v-else />
    </button>
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton
        :class="open ? 'text-gray-500 bg-gray-200' : ''"
        class="text-gray-400 px-2 sm:px-4 hover:text-gray-500 hover:bg-gray-200 focus-visible:text-gray-500 focus-visible:bg-gray-200 h-full"
        :title="open ? 'Close' : 'Password generator'"
        v-if="type === 'password'"
        @click="(e) => open ? false : openPasswordGenerator(e)"
        @keydown.enter.passive="(e) => !open ? false : openPasswordGenerator(e)"
        @keydown.space.passive="(e) => !open ? false : openPasswordGenerator(e)"
      >
        <cb-close v-if="open" />
        <cb-term v-else />
      </PopoverButton>
      <transition
      enter-active-class="transition duration-200 ease-out"
      :enter-from-class="float === 'bottom' ? '-translate-y-2 opacity-0' : 'translate-y-1 opacity-0'"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      :leave-to-class="float === 'bottom' ? '-translate-y-2 opacity-0' : 'translate-y-1 opacity-0'"
      >
        <PopoverPanel v-slot="{ close }" class="absolute z-50 w-72 p-4 bg-gray-50 text-sm right-0 border-gray-200 border-[1px]" :class="float === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'">
          <div class="overflow-hidden">
            <div class="flex items-center">
              Length
              <input type="range" name="volume" min="4" max="40" v-model="pwGenConfig.length" class="w-full mx-4" />
              <span class="font-code inline-block w-5 text-right">{{ pwGenConfig.length }}</span>
            </div>
            <div class="flex items-center mt-3">
              <button
                class="bg-gray-200 text-gray-500 me-1 w-full flex items-center justify-between px-3 py-2"
                :class="pwGenConfig.numbers ? 'bg-emerald-100! text-emerald-500!' : ''"
                @click="togglePasswordGeneratorOptions('numbers')"
              >
                Digits
                <cb-checkmark v-show="pwGenConfig.numbers" />
              </button>
              <button
                class="bg-gray-200 text-gray-500 ms-1 w-full flex items-center justify-between px-3 py-2"
                :class="pwGenConfig.letters ? 'bg-blue-100! text-blue-900!' : ''"
                @click="togglePasswordGeneratorOptions('letters')"
              >
                Letters
                <cb-checkmark v-show="pwGenConfig.letters" />
              </button>
            </div>
            <button
              class="bg-gray-200 text-gray-500 mt-2 w-full flex items-center justify-between px-3 py-2"
              :class="pwGenConfig.special ? 'bg-pink-100! text-pink-500!' : ''"
              @click="pwGenConfig.special = !pwGenConfig.special"
            >
              Special characters
              <cb-checkmark v-show="pwGenConfig.special" />
            </button>
            <div class="font-code no-liga break-all text-wrap p-2 bg-white border-dashed border-2 border-gray-300 h-[60px] my-2">
              <Highlight :value="generatedPassword" />
            </div>
            <div class="flex justify-between mt-3">
              <div>
                <button
                  class="text-gray-600 hover:text-gray-800 focus-visible:text-gray-800 bg-gray-200 hover:bg-gray-300 focus-visible:bg-gray-200 px-3 py-2"
                  :class="generatedPasswordCopied ? 'text-green-600 bg-green-100 hover:text-green-600 focus-visible:text-green-600 hover:bg-green-100 focus-visible:bg-green-100' : ''"
                  :disabled="generatedPasswordCopied"
                  @click="copyGeneratedPassword"
                  title="Copy generated password"
                >
                  <cb-checkmark v-if="generatedPasswordCopied" />
                  <cb-copy-file v-else />
                </button>
                <button
                  class="text-gray-600 hover:text-gray-800 focus-visible:text-gray-800 bg-gray-200 hover:bg-gray-300 focus-visible:bg-gray-200 px-3 py-2 ms-2"
                  @click="generatePassword"
                  title="Generate new password"
                >
                  <cb-renew />
                </button>
              </div>
              <button
                class="text-green-600 hover:text-green-800 focus-visible:text-green-800 bg-green-100 hover:bg-green-200 focus-visible:bg-green-200 px-3 py-2"
                @click="apply(close)"
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
    <Popover v-slot="{ open }" class="relative">
      <PopoverButton
        :class="open ? 'text-red-600 bg-red-100' : ''"
        class="text-gray-400 px-2 sm:px-4 hover:text-red-600 hover:bg-red-100 focus-visible:text-red-600 focus-visible:bg-red-100 h-full"
        :title="open ? 'Cancel' : 'Delete field'"
      >
        <cb-close v-if="open" />
        <cb-trash-can v-else />
      </PopoverButton>
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-x-2 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-2 opacity-0"
      >
        <PopoverPanel v-slot="{ close }" class="absolute z-50 w-64 p-4 bg-red-50 right-full top-0 me-2 text-sm border-red-100 border-[1px]">
          <div class="overflow-hidden">
            <span class="opacity-80">Do you want to delete this field? Data will be lost.</span>
            <div class="flex justify-end mt-2">
              <button
                class="text-red-600 hover:text-red-800 focus-visible:text-red-800 bg-red-100 hover:bg-red-200 focus-visible:bg-red-200 px-3 py-2"
                @click="emitDelete(close)"
              >
                Delete
              </button>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import {
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/vue'

import { checkScreenPos } from '../tools/functions'
import Highlight from './Highlight.vue'

const props = defineProps(['type'])
const emit = defineEmits(['delete'])
const name = defineModel('name')
const value = defineModel('value')

const viewing = ref(false)
const float = ref('bottom')
const generatedPasswordCopied = ref(false)
const generatedPassword = ref('')
const pwGenConfig = ref({
  special: true,
  letters: true,
  numbers: true,
  length: 20
})

const editingCardNumber = ref('')
const editingCardName = ref('')
const editingCardValidM = ref('')
const editingCardValidY = ref('')
const editingCardCVV = ref('')

let copiedTimer = null

/**
 * Emit the delete event and close the popover
 * @param {Function} close - The function to close the popover
 */
const emitDelete = (close) => {
  emit('delete')
  close()
}

/**
 * Copy the generated password and show a tick
 */
const copyGeneratedPassword = async () => {
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
    generatedPasswordCopied.value = true
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => generatedPasswordCopied.value = false, 400)
  } catch (err) {
    console.error(err)
  }
}

/**
 * Toggle the password generator options
 * @param {string} type - The type of the option to toggle
 */
const togglePasswordGeneratorOptions = (type) => {
  if (type === 'letters') {
    if (pwGenConfig.value.letters && pwGenConfig.value.numbers) {
      pwGenConfig.value.letters = false
    } else if (pwGenConfig.value.letters && !pwGenConfig.value.numbers) {
      pwGenConfig.value.letters = false
      pwGenConfig.value.numbers = true
    } else {
      pwGenConfig.value.letters = true
    }
  } else if (type === 'numbers') {
    if (pwGenConfig.value.numbers && pwGenConfig.value.letters) {
      pwGenConfig.value.numbers = false
    } else if (pwGenConfig.value.numbers && !pwGenConfig.value.letters) {
      pwGenConfig.value.numbers = false
      pwGenConfig.value.letters = true
    } else {
      pwGenConfig.value.numbers = true
    }
  }
}

/**
 * Open the password generator and reset the password generator config
 * @param {Event} e - The interaction event
 */
const openPasswordGenerator = (e) => {
  pwGenConfig.value.length = 20
  pwGenConfig.value.special = true
  pwGenConfig.value.letters = true
  pwGenConfig.value.numbers = true
  float.value = checkScreenPos(e)
  generatePassword()
}

/**
 * Generate a password based on the password generator config
 */
const generatePassword = () => {
  const special = pwGenConfig.value.special ? `!@#$%^&*_+-=.<>?~` : ''
  const numbers = pwGenConfig.value.numbers ? '0123456789' : ''
  const letters = pwGenConfig.value.letters ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''
  const all = `${letters}${numbers}${special}`
  let password = ''
  const random = new Uint32Array(pwGenConfig.value.length)
  window.crypto.getRandomValues(random)
  for (let i = 0; i < pwGenConfig.value.length; i++) {
    password += all[random[i] % all.length]
  }
  generatedPassword.value = password
}

// Generate a password when the password generator config changes
watch(pwGenConfig, generatePassword, { deep: true })

/**
 * Apply the generated password and close the popover
 * @param {Function} close - The function to close the popover
 */
const apply = (close) => {
  value.value = generatedPassword.value
  close()
}

onMounted(() => {
  if (props.type === 'card') {
    // Split the value into the card number, name, valid date, and CVV if the value is a card
    const [num, name, valid, cvv] = value.value.split(',')
    editingCardNumber.value = num
    editingCardName.value = name
    editingCardValidM.value = valid.split('/')[0]
    editingCardValidY.value = valid.split('/')[1]
    editingCardCVV.value = cvv

    // Watch the card number, name, valid date, and CVV and update the value if they change
    watch([editingCardNumber, editingCardName, editingCardValidM, editingCardValidY, editingCardCVV], () => {
      value.value = `${editingCardNumber.value},${editingCardName.value},${editingCardValidM.value}/${editingCardValidY.value},${editingCardCVV.value}`
    })
  }
})
</script>
