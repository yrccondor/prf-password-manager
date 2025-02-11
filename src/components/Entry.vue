<template>
  <header class="relative">
    <BgAlt class="absolute inset-0 opacity-25 z-10" v-if="decryptedAnimation" />
    <BgEdit class="absolute inset-0 opacity-30 z-10" v-if="decryptedAnimation && editAnimation" />
    <transition
      enter-active-class="duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div class="absolute inset-0 bg-white z-20" v-if="!decrypted" />
    </transition>
    <div class="absolute inset-0 bg-linear-to-t from-white from-0% to-90% z-20" />
    <div class="z-30 relative p-4 sm:p-6">
      <div class="flex justify-between">
        <button
          class="btn btn-transparent"
          @click="emit('close')"
          title="Close"
          :disabled="loading || networkloading"
        >
          <cb-close />
        </button>
        <div class="flex">
          <Popover v-slot="{ open }" class="relative">
            <PopoverButton
              :class="open ? 'bg-red-500/30' : ''"
              class="btn btn-transparent me-2 relative text-red-700 bg-red-500/20 hover:bg-red-500/30 focus-visible:bg-red-500/30"
              :title="open ? 'Cancel' : 'Delete entry'"
              :disabled="loading || networkloading"
              v-if="edit && !adding"
            >
              <cb-close v-if="open" />
              <cb-trash-can v-else />
            </PopoverButton>
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="-translate-y-2 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="-translate-y-2 opacity-0"
            >
              <PopoverPanel v-slot="{ close }" class="absolute z-50 w-56 p-4 bg-red-50 right-0 top-full mt-2 me-2 text-sm border-red-100 border-[1px]">
                <div class="overflow-hidden">
                  <span class="opacity-80">Do you want to delete this whole entry? Data will be lost.</span>
                  <div class="flex justify-end mt-2">
                    <button
                      class="text-red-600 hover:text-red-800 focus-visible:text-red-800 bg-red-100 hover:bg-red-200 focus-visible:bg-red-200 px-3 py-2"
                      @click="deleteEntry(close)"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </PopoverPanel>
            </transition>
          </Popover>
          <button
            class="btn btn-transparent"
            @click.prevent="startEdit"
            title="Edit"
            :disabled="loading || networkloading"
            v-show="!edit"
          >
            <cb-edit />
          </button>
          <button
            class="btn btn-transparent"
            @click.prevent="save"
            title="Save"
            :disabled="loading || networkloading || editing?.name.trim() === ''"
            v-show="edit"
          >
            <cb-save />
          </button>
          <button
            class="btn btn-transparent ms-2"
            @click.prevent="view"
            title="Decrypt passwords"
            v-show="!decrypted"
            v-if="hasPassword"
            :disabled="loading || networkloading"
          >
            <cb-unlocked />
          </button>
          <button
            class="btn btn-transparent ms-2 relative text-green-600 bg-green-600/20 hover:bg-green-600/30 focus-visible:bg-green-600/30"
            @click="lock()"
            title="Lock passwords"
            v-if="hasPassword && decrypted && !edit"
            :disabled="loading || networkloading"
          >
            <cb-locked />
            <div class="absolute bottom-0 left-0 h-[3px] bg-green-600" ref="timerele" />
          </button>
          <Popover v-slot="{ open }" class="relative">
            <PopoverButton
              :class="open ? 'bg-green-600/30' : ''"
              class="btn btn-transparent ms-2 relative text-green-600 bg-green-600/20 hover:bg-green-600/30 focus-visible:bg-green-600/30"
              :title="open ? 'Keep editing' : 'Cancel and lock passwords'"
              :disabled="loading || networkloading"
              v-if="decrypted && edit && !adding"
            >
              <cb-close v-if="open" />
              <cb-locked v-else />
            </PopoverButton>
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="-translate-y-2 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="-translate-y-2 opacity-0"
            >
              <PopoverPanel v-slot="{ close }" class="absolute z-50 w-56 p-4 bg-gray-50 right-0 top-full mt-2 text-sm border-gray-200 border-[1px]">
                <div class="overflow-hidden">
                  <span class="opacity-80">Discard any changes made and lock this entry now.</span>
                  <div class="flex justify-end mt-2">
                    <button
                      class="text-green-600 hover:text-green-800 focus-visible:text-green-800 bg-green-100 hover:bg-green-200 focus-visible:bg-green-200 px-3 py-2"
                      @click="lock(close)"
                    >
                      Lock
                    </button>
                  </div>
                </div>
              </PopoverPanel>
            </transition>
          </Popover>
        </div>
      </div>
      <h3 class="font-display text-4xl sm:text-5xl mt-20 truncate" v-if="!edit">{{ entry.name }}</h3>
      <div class="w-full mt-[4.5rem]" :class="networkloading && edit ? 'animate-pulse' : ''" v-else>
        <input
          type="text"
          class="font-display text-4xl sm:text-5xl outline-dashed outline-2 outline-gray-400 w-[calc(100%-4px)] ms-[2px] px-2 pt-2 bg-transparent focus:bg-gray-500/10"
          :class="loading || networkloading ? 'pointer-events-none opacity-70 select-none' : ''"
          v-model.trim="editing.name"
          ref="titleele"
        >
      </div>
      <div
        v-if="(entry.urls.length > 0 && getHostname(entry.urls[0])) || edit"
        class="flex items-center text-gray-500 mt-1"
        :class="{ 'invisible': edit }"
      >
        <div class="w-5 h-5 rounded-full inline-block overflow-hidden me-2 shrink-0 bg-gray-300">
          <img :src="`https://icon.horse/icon/${getHostname(entry.urls[0])}`">
        </div>
        <span class="truncate">{{ getHostname(entry.urls[0]) || '' }}</span>
      </div>
    </div>
  </header>
  <div class="z-50 relative" :class="networkloading && edit ? 'animate-pulse' : ''">
    <div
      class="mb-3 px-4 sm:px-6 -mt-8 sm:-mt-10"
      :class="loading || networkloading ? 'pointer-events-none opacity-70 select-none' : ''"
      v-if="edit"
    >
      <div v-for="_, i in editing.urls" class="mb-1 flex items-center">
        <cb-wikis class="me-2 text-gray-500" />
        <input
          :key="`url-input-${i}`"
          class="text-sm block p-1.5 outline-hidden border-none w-full bg-gray-200/40 hover:bg-gray-300/50 focus:bg-gray-300/50 text-gray-600 url-input"
          v-model.trim="editing.urls[i]"
          placeholder="https://"
        />
        <button
          class="text-sm block p-1.5 outline-hidden border-none bg-transparent hover:bg-red-200/50 cursor-pointer ms-2 text-gray-500 hover:text-red-600"
          @click.prevent="editing.urls.splice(i, 1)"
          title="Delete URL"
        >
          <cb-trash-can />
        </button>
      </div>
      <div class="mb-1 flex items-center">
        <cb-add class="me-2 text-gray-500" />
        <button
          class="text-sm block p-1.5 outline-hidden border-none w-full bg-transparent hover:bg-gray-200/50 text-gray-600 cursor-pointer text-start"
          @click.prevent="addUrl"
        >Add URL</button>
      </div>
    </div>
  </div>
  <div :class="networkloading && edit ? 'animate-pulse' : ''">
    <div class="p-4 sm:p-6 pt-2!" v-if="!edit">
      <div v-for="field, i in entry.fields" :key="i" class="mb-3">
        <Field
          :name="field.name"
          :value="decrypted ? queryPassword(i) : field.value"
          :type="field.type"
          :decrypted="decrypted"
          :lock="lockTick"
          @reset="resetTimer(30)"
          @view="view"
          v-if="field.type === 'password' || field.type === 'card'"
        />
        <Field
          :name="field.name"
          :value="field.value"
          :type="field.type"
          :decrypted="decrypted"
          :lock="lockTick"
          @reset="resetTimer(30)"
          v-else
        />
      </div>
    </div>
    <div
      class="p-4 sm:p-6 pt-2!"
      :class="loading || networkloading ? 'pointer-events-none opacity-70 select-none' : ''"
      v-else
    >
      <Popover v-slot="{ open }" class="relative">
        <PopoverButton
          :class="open ? 'bg-gray-200' : ''"
          class="text-gray-600 cursor-pointer w-full bg-gray-100 text-start text-sm px-4 py-3 outline-hidden border-none flex items-center justify-between my-2 hover:bg-gray-200 focus-visible:bg-gray-200 hover:pe-5 focus-visible:pe-5 transition-[padding]"
          @click.prevent="checkPos"
        >
          Add a field
          <cb-add />
        </PopoverButton>
        <transition
          enter-active-class="transition duration-200 ease-out"
          :enter-from-class="float === 'bottom' ? '-translate-y-1 opacity-0' : 'translate-y-1 opacity-0'"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          :leave-to-class="float === 'bottom' ? '-translate-y-1 opacity-0' : 'translate-y-1 opacity-0'"
        >
          <PopoverPanel v-slot="{ close }" class="absolute z-50 w-full bg-gray-200 left-0 text-sm" :class="float === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'">
            <div class="overflow-hidden text-gray-700">
              <button class="flex justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('username', i, close)">
                Username
                <cb-user />
              </button>
              <button class="flex justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('password', i, close)">
                Password / PIN / Token
                <cb-locked />
              </button>
              <button class="flex justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('uap', i, close)">
                Username and password
                <cb-user-access-locked />
              </button>
              <button class="flex justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('card', i, close)">
                Bank card
                <cb-purchase />
              </button>
              <button class="flex justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('text', i, close)">
                Note
                <cb-text-short-paragraph />
              </button>
            </div>
          </PopoverPanel>
        </transition>
      </Popover>
      <div v-for="field, i in editing.fields" :key="`field-edit-${i}-${field.type}-${field.key}`">
        <InputField
          v-model:name.trim="field.name"
          v-model:value="field.value"
          :type="field.type"
          @delete="editing.fields.splice(i, 1)"
        />
        <Popover v-slot="{ open }" class="relative">
          <PopoverButton
            :class="open ? 'bg-gray-200' : ''"
            class="text-gray-600 cursor-pointer w-full bg-gray-100 text-start text-sm px-4 py-3 outline-hidden border-none flex items-center justify-between my-2 hover:bg-gray-200 focus-visible:bg-gray-200 hover:pe-5 focus-visible:pe-5 transition-[padding]"
            @click="(e) => open ? false : checkPos(e)"
            @keydown.enter.passive="(e) => !open ? false : checkPos(e)"
            @keydown.space.passive="(e) => !open ? false : checkPos(e)"
          >
            Add a field
            <cb-add />
          </PopoverButton>
          <transition
            enter-active-class="transition duration-200 ease-out"
            :enter-from-class="float === 'bottom' ? '-translate-y-1 opacity-0' : 'translate-y-1 opacity-0'"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            :leave-to-class="float === 'bottom' ? '-translate-y-1 opacity-0' : 'translate-y-1 opacity-0'"
          >
            <PopoverPanel v-slot="{ close }" class="absolute z-50 w-full bg-gray-200 left-0 text-sm" :class="float === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'">
              <div class="overflow-hidden text-gray-700">
                <button class="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('username', i, close)">
                  Username
                  <cb-user />
                </button>
                <button class="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('password', i, close)">
                  Password / PIN / Token
                  <cb-locked />
                </button>
                <button class="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('uap', i, close)">
                  Username and password
                  <cb-user-access-locked />
                </button>
                <button class="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('card', i, close)">
                  Bank card
                  <cb-purchase />
                </button>
                <button class="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="addField('text', i, close)">
                  Note
                  <cb-text-short-paragraph />
                </button>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
      </div>
    </div>
  </div>
  <div class="px-4 py-5 sm:px-6 sm:py-6 pt-0! -mt-3! sm:-mt-4! text-sm opacity-70" v-if="!adding && entry.lastUpdated > 0"> Last updated {{ stringifyDate(entry.lastUpdated || 0) }}</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef, toRaw, nextTick } from 'vue'
import {
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/vue'
import { decompressFromUint8Array } from 'lz-string'
import { parse } from 'zipson'

import { getHostname, verifyFormat, stringifyDate, checkScreenPos } from '../tools/functions'
import passkey from '../passkey'
import Timer from '../tools/timer'

import BgAlt from './bg/BgAlt.vue'
import BgEdit from './bg/BgEdit.vue'
import Field from './Field.vue'
import InputField from './InputField.vue'

const props = defineProps(['id', 'salt', 'raw', 'keyid', 'entry', 'networkloading', 'adding'])
const emit = defineEmits(['close', 'delete', 'update', 'add'])

const decrypted = ref(false)
const decryptedAnimation = ref(false)
const edit = ref(false)
const editAnimation = ref(false)
const loading = ref(false)
const hasPassword = props.entry.fields.filter((field) => field.type === 'password' || field.type === 'card').length > 0
const lockTick = ref(0)

const decryptedPasswords = ref([])

const timerele = useTemplateRef('timerele')
const titleele = useTemplateRef('titleele')

const editing = ref(null)

const float = ref('bottom')

let key = null

// Timer. If the entry is unlock but no interaction has occurred for 30 seconds, lock the entry
let timer = null

/**
 * Decrypt the entry and show the password
 * @returns {Promise<boolean>} Whether the decryption is successful
 */
const view = async () => {
  // Get the password fields
  const passwordList = props.entry.fields.filter((field) => field.type === 'password' || field.type === 'card').map((field) => {
    if (field.type === 'card') {
      return field.value[0]
    }
    return field.value
  })
  if (passwordList.length === 0) {
    return true
  }

  loading.value = true

  // Get the key
  key = await passkey.getKey({
    keyid: props.keyid,
    firstSalt: props.salt
  }).catch((e) => {
    console.error('Error getting key', e)
    return false
  })

  // Handle error
  if (!key) {
    loading.value = false
    return false
  }

  // Decrypt passwords
  const task = props.raw.find((item) => item.id === passwordList[0])
  if (task && verifyFormat(task.description, 'encrypted')) {
    const iv = task.content
    const res = await passkey.decrypt({
      key,
      iv,
      ciphertext: task.description,
      label: props.entry.name
    }).catch((e) => {
      console.error('Error decrypting password', e)
      return false
    })

    if (!res) {
      key = null
      loading.value = false
      return false
    }

    decryptedPasswords.value = parse(decompressFromUint8Array(res))

    // Reset and start the timer
    if (timer) {
      timer.stop()
      timer = null
    }
    timer = new Timer({ sec: 30, type: 'frame', callback: (time, done) => {
      if (timerele.value) {
        timerele.value.style.width = `${100 - time * 100}%`
      }
      if (done) {
        // Lock the entry if the timer is up
        lock()
      }
    } })
  } else {
    loading.value = false
    return false
  }

  loading.value = false
  decrypted.value = true
  decryptedAnimation.value = true
  return true
}

/**
 * Lock the entry
 * @param {Function?} close - The function to close the menu
 */
const lock = (close) => {
  if (!decrypted.value) {
    return
  }
  decryptedPasswords.value = []
  decrypted.value = false
  edit.value = false
  lockTick.value = Date.now().valueOf()

  // Stop the timer
  key = null
  if (timer) {
    timer.stop()
    timer = null
  }

  // Stop the animation
  setTimeout(() => {
    decryptedAnimation.value = decrypted.value
    editAnimation.value = edit.value
  }, 200)

  if (close) {
    close()
  }
}

/**
 * Start editing the entry
 */
const startEdit = async () => {
  if (!props.adding) {
    if (edit.value) {
      return
    }

    if (!decrypted.value) {
      // If the entry is not decrypted, decrypt it
      const res = await view().catch((e) => {
        return false
      })

      if (!res) {
        return
      }
    }

    timer.stop()
    timer = null
  }
  edit.value = true
  editAnimation.value = true

  // Clone the data to avoid mutating the original data
  const clone = structuredClone(toRaw(props.entry))
  clone.fields = clone.fields.map((field, i) => {
    field.key = i
    if (field.type === 'password' || field.type === 'card') {
      field.value = queryPassword(i)
    }
    return field
  })
  editing.value = clone

  if (props.adding) {
    // If this is a new entry being added, set the name to 'New entry' and add the default fields
    editing.value.name = 'New entry'
    editing.value.fields.push({
      name: 'Username',
      value: '',
      type: 'username',
      key: Date.now().valueOf()
    })
    editing.value.fields.push({
      name: 'Password',
      value: '',
      type: 'password',
      key: Date.now().valueOf()
    })
  }
}

/**
 * Save the entry
 */
const save = () => {
  if ((!edit.value || !key || !decrypted.value) && !props.adding) {
    return
  }

  if (editing.value.name.trim() === '') {
    return
  }

  const newUrls = [...editing.value.urls]
  for (let i = 0; i < newUrls.length; i++) {
    // Check if the url is valid
    if (!getHostname(newUrls[i]) || (!newUrls[i].startsWith('http://') && !newUrls[i].startsWith('https://'))) {
      newUrls[i] = `https://${newUrls[i]}`
    }
  }

  // Add new entry
  if (props.adding) {
    const newEntry = structuredClone(toRaw(editing.value))
    newEntry.urls = newUrls
    newEntry.fields = newEntry.fields.filter((field) => {
      if (field.type === 'card') {
        return field.value !== ',,/,'
      }
      return field.value !== ''
    }).map((field) => {
      if (field.name.trim() === '') {
        if (field.type === 'password') {
          field.name = 'Password'
        } else if (field.type === 'username') {
          field.name = 'Username'
        } else if (field.type === 'card') {
          field.name = 'Card'
        } else {
          field.name = 'Note'
        }
      }
      return field
    })
    emit('add', newEntry)
    return
  }

  // Compute the diff flags
  let diffFlags = {
    pwds: false,
    body: false,
    name: false
  }

  // Diff passwords fields
  const newPwds = editing.value.fields.filter((field) => field.type === 'password' || field.type === 'card').filter((field) => {
    if (field.type === 'card') {
      return field.value !== ',,/,'
    }
    return field.value !== ''
  }).map((item) => item.value)
  if (newPwds.length !== decryptedPasswords.value.length) {
    diffFlags.pwds = true
  } else {
    for (let i = 0; i < newPwds.length; i++) {
      if (newPwds[i] !== decryptedPasswords.value[i]) {
        diffFlags.pwds = true
        diffFlags.body = true // So we can update the lastUpdated field
        break
      }
    }
  }

  // Compute the new entry
  const newEntry = structuredClone(toRaw(editing.value))
  newEntry.urls = newUrls
  newEntry.fields = newEntry.fields.filter((field) => {
    if (field.type === 'card') {
      return field.value !== ',,/,'
    }
    return field.value !== ''
  }).map((field) => {
    if (field.name.trim() === '') {
      if (field.type === 'password') {
        field.name = 'Password'
      } else if (field.type === 'username') {
        field.name = 'Username'
      } else if (field.type === 'card') {
        field.name = 'Card'
      } else {
        field.name = 'Note'
      }
    }
    return field
  })

  // Diff body fields
  const newBody = newEntry.fields.map((field) => {
    if (field.type === 'password' || field.type === 'card') {
      return [field.name, null, field.type]
    }
    return [field.name, field.value, field.type]
  })
  const oldBody = props.entry.fields.map((field) => {
    if (field.type === 'password' || field.type === 'card') {
      return [field.name, null, field.type]
    }
    return [field.name, field.value, field.type]
  })
  if (newBody.length !== oldBody.length) {
    diffFlags.body = true
  } else {
    for (let i = 0; i < newBody.length; i++) {
      if (newBody[i][0] !== oldBody[i][0] || newBody[i][1] !== oldBody[i][1] || newBody[i][2] !== oldBody[i][2]) {
        diffFlags.body = true
        break
      }
    }
  }

  // Diff urls
  const oldUrls = props.entry.urls
  if (newUrls.length !== oldUrls.length) {
    diffFlags.body = true
  } else {
    for (let i = 0; i < newUrls.length; i++) {
      if (newUrls[i] !== oldUrls[i]) {
        diffFlags.body = true
        break
      }
    }
  }

  // Diff name
  if (editing.value.name !== props.entry.name) {
    diffFlags.name = true
    diffFlags.body = true // So we can update the lastUpdated field
  }

  if (!diffFlags.body && !diffFlags.name && !diffFlags.pwds) {
    lock()
    return
  }

  // Emit the update event
  emit('update', {
    entry: newEntry,
    key,
    diffFlags
  })
}

/**
 * Delete the entry
 * @param {Function?} close - The function to close the popover
 */
const deleteEntry = (close) => {
  if (close) {
    close()
  }

  if (!key || !decrypted.value || !edit.value || props.adding || props.networkloading) {
    return
  }
  emit('delete', key)
}

/**
 * Reset the timer
 * @param {number?} sec - The seconds to set, default is 30
 */
const resetTimer = (sec = 30) => {
  if (timer) {
    timer.set(sec)
  } else {
    timer = new Timer({ sec, type: 'frame', callback: (time, done) => {
      if (timerele.value) {
        timerele.value.style.width = `${100 - time * 100}%`
      }
      if (done) {
        lock()
      }
    } })
  }
}

/**
 * Query decrypted passwords
 * @param {number} i - The index of the password
 * @param {string?} fallback - The fallback value
 * @returns {string} The password
 */
const queryPassword = (i, fallback = '•••••••••••') => {
  const mapped = props.entry.fields.map((field, i) => [field.type, i]).filter(([type, _]) => type === 'password' || type === 'card').map(([_, i]) => i)
  const idx = mapped.findIndex((index) => index === i)
  if (idx === -1) {
    return fallback
  }
  if (decryptedPasswords.value[idx]) {
    return decryptedPasswords.value[idx]
  }
  return fallback
}

/**
 * Add a url input to the UI and focus on it
 */
const addUrl = () => {
  editing.value.urls.push('')
  nextTick(() => {
    document.getElementsByClassName('url-input')[editing.value.urls.length - 1].focus()
  })
}

/**
 * Add a field to the entry
 * @param {string} type - The type of the field
 * @param {number} i - The index of the field
 * @param {Function} close - The function to close the menu
 */
const addField = (type, i, close) => {
  if (!editing.value.fields) {
    editing.value.fields = []
  }
  if (type === 'username') {
    editing.value.fields.splice(i + 1, 0, {
      name: 'Username',
      value: '',
      type,
      key: Date.now().valueOf()
    })
  } else if (type === 'password') {
    editing.value.fields.splice(i + 1, 0, {
      name: 'Password',
      value: '',
      type,
      key: Date.now().valueOf()
    })
  } else if (type === 'text') {
    editing.value.fields.splice(i + 1, 0, {
      name: 'Note',
      value: '',
      type,
      key: Date.now().valueOf()
    })
  } else if (type === 'card') {
    editing.value.fields.splice(i + 1, 0, {
      name: 'Card',
      value: ',,/,',
      type,
      key: Date.now().valueOf()
    })
  } else if (type === 'uap') {
    // Username and password
    editing.value.fields.splice(i + 1, 0, {
      name: 'Username',
      value: '',
      type: 'username',
      key: Date.now().valueOf()
    })
    editing.value.fields.splice(i + 2, 0, {
      name: 'Password',
      value: '',
      type: 'password',
      key: Date.now().valueOf()
    })
  }
  close()
}

/**
 * Check the position of the currently pressed element and adjust the float container position
 * @param {Event} e - The trigger event
 */
const checkPos = (e) => {
  float.value = checkScreenPos(e)
}

onMounted(() => {
  if (props.adding) {
    decryptedPasswords.value = []
    decrypted.value = true
    decryptedAnimation.value = true
    startEdit()
    nextTick(() => {
      titleele.value.select()
    })
  }
})

onBeforeUnmount(() => {
  if (timer) {
    // Stop the timer before unmounting
    timer.stop()
    timer = null
  }
  key = null
})

// Expose the lock function to the parent component
defineExpose({
  lock
})
</script>
