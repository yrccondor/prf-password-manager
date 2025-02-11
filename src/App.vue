<template>
  <Bg class="fixed top-0 left-0 w-full h-full opacity-15 -z-20 portrait:w-[100vh] portrait:h-[100vw] portrait:rotate-90 portrait:transform-gpu portrait:origin-top-left portrait:translate-x-[100vw]" />
  <footer class="absolute bottom-0 left-0 w-full flex-all text-sm text-gray-400 p-3 py-5 z-30">
    <span>PRF Password Manager. Made with ❤️ © Axton.&nbsp;<a @click="help = true" class="cursor-pointer underline text-black">Help</a></span>
  </footer>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform translate-x-4 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform -translate-x-4 opacity-0"
  >
    <section class="absolute top-0 left-0 flex-all full-screen flex-col -mt-12 z-1" v-if="configStep === 0 && !logedin">
      <div class="flex-all flex-col max-w-[520px] w-10/12">
        <h1 class="leading-tight text-4xl font-display mb-4 sm:text-6xl">Connet you to <em>your</em> Todoist account</h1>
        <div class="input-container font-code no-liga text-xl w-full" :class="{ 'input-disabled': loading }">
          <input type="password" v-model="apiToken" placeholder="Todoist API Token" ref="tokeninput" @keyup.enter.prevent="connect" />
          <cb-api-key />
        </div>
        <button
          class="btn w-full mt-3 btn-next"
          :disabled="!vaildToken || loading || configStep !== 0"
          :class="{ 'btn-loading': loading }"
          @click.prevent="connect"
        >
          Connect
          <cb-arrow-right v-if="!loading" />
          <cb-circle-dash v-else />
        </button>
      </div>
    </section>
  </transition>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform translate-x-4 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform -translate-x-4 opacity-0"
  >
    <section class="absolute top-0 left-0 flex-all full-screen flex-col -mt-12 z-1" v-if="configStep === 1 && !logedin">
      <div class="flex-all flex-col max-w-[520px] w-10/12 relative">
        <h1 class="leading-tight text-4xl font-display mb-4 sm:text-6xl">Now select a <em>dedicated project</em> for storing your data</h1>
      </div>
      <div class="flex-all flex-col max-w-[520px] w-10/12 relative">
        <div class="list-container text-xl w-full" :class="{ 'list-disabled': loading }">
          <Listbox v-model="selectedProject">
            <ListboxButton class="relative list-botton" ref="projectSelect" :disabled="loading">
              <div class="flex items-center">
                <span class="inline-block h-4 w-4 rounded-xl me-3" :style="{ 'background-color': todoistList.find((project) => project.id === selectedProject)?.color || 'white' }"></span>
                {{ todoistList.find((project) => project.id === selectedProject)?.name || 'Select a project' }}
              </div>
              <cb-chevron-down />
            </ListboxButton>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="-translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="-translate-y-1 opacity-0"
            >
              <ListboxOptions class="absolute top-full max-h-60 w-full overflow-auto focus:outline-hidden bg-gray-200 text-lg z-40">
                <ListboxOption
                  v-for="project in todoistList"
                  :key="project.id"
                  :value="project.id"
                  class="px-4 py-2 ui-active:bg-gray-800 ui-active:text-white ui-not-active:text-black flex items-center cursor-pointer"
                >
                  <span class="inline-block h-4 w-4 rounded-xl me-3" :style="{ 'background-color': project.color }"></span>
                  {{ project.name }}
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </Listbox>
        </div>
      </div>
      <div class="flex-all flex-col max-w-[520px] w-10/12 mt-3">
        <button
          class="btn w-full btn-next"
          :disabled="loading"
          :class="{ 'btn-loading': loading }"
          @click.prevent="select"
        >
          Select
          <cb-arrow-right v-if="!loading" />
          <cb-circle-dash v-else />
        </button>
        <hr class="my-6 w-full border-[1px] border-gray-300">
        <p class="w-full text-gray-500 mb-3">…or, create a new empty project with your favorite name</p>
        <div class="input-container text-xl w-full" :class="{ 'input-disabled': loading }">
          <input type="text" v-model="createName" placeholder="Project name" @keyup.enter.prevent="create" />
          <button
            class="btn btn-in-input"
            title="Create"
            :disabled="loading || configStep !== 1"
            :class="{ 'btn-loading': loading }"
            @click.prevent="create"
            v-show="vaildName"
          >
            <cb-arrow-right v-if="!loading" />
            <cb-circle-dash v-else />
          </button>
          <cb-list v-show="!vaildName"/>
        </div>
      </div>
    </section>
  </transition>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform translate-x-4 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform -translate-x-4 opacity-0"
  >
    <section class="absolute top-0 left-0 flex-all full-screen flex-col -mt-12 z-1" v-if="configStep === 2 && !logedin">
      <div class="flex-all flex-col max-w-[520px] w-10/12 relative">
        <h1 class="leading-tight text-4xl font-display mb-4 sm:text-6xl">Now create a <em>dedicated project</em> on Todoist for storing your data</h1>
        <div class="input-container font-code text-xl w-full" :class="{ 'input-disabled': loading }">
          <input type="text" v-model="createName" placeholder="Project name" @keyup.enter.prevent="create" />
          <cb-list />
        </div>
        <button
          class="btn w-full mt-3 btn-next"
          :disabled="loading || configStep !== 2 || !vaildName"
          :class="{ 'btn-loading': loading }"
          @click.prevent="create"
        >
          Create
          <cb-add v-if="!loading" />
          <cb-circle-dash v-else />
        </button>
      </div>
    </section>
  </transition>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform translate-x-4 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform -translate-x-4 opacity-0"
  >
    <section class="absolute top-0 left-0 flex-all full-screen flex-col -mt-12 z-1" v-if="configStep === 3 && !logedin">
      <div class="flex-all flex-col max-w-[520px] w-10/12 relative">
        <h1 class="leading-tight text-4xl font-display mb-4 sm:text-6xl">Great. Create a <em>passkey</em> to get started</h1>
        <button
          class="btn w-full btn-next"
          :disabled="loading || configStep !== 3"
          :class="{ 'btn-loading': loading }"
          @click.prevent="reg"
          ref="step3next"
        >
          Create a passkey
          <PassKeyIcon v-if="!loading" />
          <cb-circle-dash v-else />
        </button>
      </div>
    </section>
  </transition>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform translate-x-4 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform -translate-x-4 opacity-0"
  >
    <section class="absolute top-0 left-0 flex-all full-screen flex-col -mt-12 z-1" v-if="configStep === 4 && !logedin">
      <div class="flex-all flex-col max-w-[520px] w-10/12 relative">
        <h1 class="leading-tight text-4xl font-display mb-4 sm:text-6xl">Ah ha, <em>new</em> device. Use your <em>passkey</em> again to decrypt your data</h1>
        <button
          class="btn w-full btn-next"
          :disabled="loading || configStep !== 4"
          :class="{ 'btn-loading': loading }"
          @click.prevent="handleLogin"
          ref="step4next"
        >
          Use a passkey
          <PassKeyIcon v-if="!loading" />
          <cb-circle-dash v-else />
        </button>
      </div>
    </section>
  </transition>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform -translate-x-4 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform -translate-x-4 opacity-0"
  >
    <section class="absolute top-0 left-0 flex-all full-screen flex-col -mt-12 z-1" v-if="configStep === 5 && !logedin">
      <div class="flex-all flex-col max-w-[520px] w-10/12">
        <h1 class="leading-tight text-4xl font-display mb-4 sm:text-6xl"><em v-if="!newDevice">Welcome</em><span v-else>Welcome</span>{{ newDevice ? '' : ' back' }}. Use your <em>passkey</em> to proceed</h1>
        <div class="w-full flex">
          <button
            class="btn w-full btn-next grow"
            :disabled="loading || configStep !== 5"
            :class="{ 'btn-loading': loading }"
            @click.prevent="login"
          >
            Use a passkey
            <PassKeyIcon v-if="!loading" />
            <cb-circle-dash v-else />
          </button>
          <button
            class="btn btn-second ms-2 shrink-0 w-[52px] flex-all"
            :disabled="loading || configStep !== 5"
            :class="{ 'btn-loading': loading }"
            @click.prevent="purgeLocalStorage"
            title="Purge saved device data"
            v-if="!newDevice"
          >
            <cb-clean />
          </button>
        </div>
        <hr class="my-6 w-full border-[1px] border-gray-300">
        <p class="w-full text-gray-500 mb-3">New user? Set up your vault here</p>
        <div class="flex w-full">
          <button
            class="btn w-full btn-next btn-second grow"
            :disabled="loading"
            :class="{ 'btn-loading': loading }"
            @click.prevent="setUp"
          >
            Set up
            <cb-arrow-right v-if="!loading" />
            <cb-circle-dash v-else />
          </button>
          <button
            class="btn btn-second ms-2 w-[52px] flex-all"
            :disabled="loading"
            :class="{ 'btn-loading': loading }"
            @click="help = true"
            title="Help"
          >
            <cb-help />
          </button>
        </div>
      </div>
    </section>
  </transition>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform translate-x-4 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform -translate-x-4 opacity-0"
  >
    <section class="absolute top-0 left-0 flex-all full-screen flex-col -mt-12 z-1" v-if="configStep === 6 && !logedin">
      <div class="flex-all flex-col max-w-[520px] w-10/12 relative">
        <h1 class="leading-tight text-4xl font-display mb-4 sm:text-6xl">Brilliant. Now use the <em>passkey</em> you created to encrypt data</h1>
        <button
          class="btn w-full btn-next"
          :disabled="loading || configStep !== 6"
          :class="{ 'btn-loading': loading }"
          @click.prevent="initEncrypt"
          ref="step6next"
        >
          Use a passkey
          <PassKeyIcon v-if="!loading" />
          <cb-circle-dash v-else />
        </button>
      </div>
    </section>
  </transition>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform translate-x-4 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100"
    leave-to-class="transform -translate-x-4 opacity-0"
  >
    <section class="absolute top-0 left-0 flex-all full-screen flex-col -mt-12 z-1" v-if="configStep === 7 && !logedin">
      <div class="flex-all flex-col max-w-[520px] w-10/12 relative">
        <h1 class="leading-tight text-4xl font-display mb-4 sm:text-6xl">Hold on, we are <em>encrypting</em> data for the demonstration…</h1>
        <div class="max-w-[520px] w-full h-3 bg-gray-300">
          <div :style="{ width: `${prepareProgress}%` }" class="bg-gray-800 h-full animate-pulse transition-all"></div>
        </div>
      </div>
    </section>
  </transition>
  <transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform translate-y-6 opacity-0"
    enter-to-class="transform translate-x-0 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-6 opacity-0"
  >
    <section class="w-full flex-col z-1" v-if="logedin">
      <div class="absolute inset-0 -z-10 flex flex-col">
        <div class="full-screen bg-linear-to-t from-white from-35% sm:from-40% to-95% shrink-0" />
        <div class="w-full h-full grow bg-white" />
      </div>
      <header class="flex items-center justify-between max-w-7xl w-11/12 mt-[25vh] sm:mt-[30vh] mx-auto">
        <h1 class="text-4xl font-display sm:text-6xl leading-[1.4]!"><em class="font-deco text-5xl sm:text-7xl ms-2">prf</em><br>Password Manager</h1>
      </header>
      <div class="flex items-stretch justify-between max-w-7xl w-11/12 mt-1 mb-3 bg-green-200 text-green-900 mx-auto" v-if="welcome">
        <div class="flex items-start justify-start w-full p-3 pe-2 sm:p-4 sm:pe-2">
          <cb-rocket class="shrink-0 mt-1 me-3" />
          <p>You're all set! Try using your passkey to decrypt the demonstration entries below, or add your own entries.</p>
        </div>
        <button
          @click="welcome = false"
          class="flex items-center justify-between p-3 text-lg box-border sm:p-4 hover:bg-green-300 focus-visible:bg-green-300"
        >
          <cb-close />
        </button>
      </div>
      <div class="flex items-start justify-between max-w-7xl w-11/12 mt-2 mx-auto">
        <div class="flex items-start justify-start w-fit">
          <button
            @click.prevent="openAddNewEntry"
            class="flex-all p-2 text-xl box-border sm:p-3 bg-gray-100 hover:bg-gray-200 focus-visible:bg-gray-200 me-2 w-12 h-12"
            title="Add a new entry"
          >
            <cb-add-large />
          </button>
          <Popover v-slot="{ open }" class="relative">
            <PopoverButton
              :class="open ? 'bg-gray-200' : 'bg-gray-100'"
              class="flex-all p-2 text-xl box-border sm:p-3 hover:bg-gray-200 focus-visible:bg-gray-200 me-2 w-12 h-12"
              title="Debug"
            >
              <cb-debug />
            </PopoverButton>
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="-translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="-translate-y-1 opacity-0"
            >
              <PopoverPanel v-slot="{ close }" class="absolute z-40 mt-1 w-screen max-w-60 sm:max-w-72 bg-gray-200">
                <div class="overflow-hidden">
                  <button class="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="managePasskey(close)">
                    Manage Passkey
                    <PassKeyIcon v-if="!loading" class="!w-6 !h-6 -me-0.5" />
                  </button>
                  <button class="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-300 focus-visible:bg-gray-300 hover:pe-5 focus-visible:pe-5 transition-[padding]" @click="manageStorage(close)">
                    Manage storage
                    <cb-db2-database />
                  </button>
                </div>
              </PopoverPanel>
            </transition>
          </Popover>
          <button
            @click.prevent="logout"
            class="flex-all p-2 text-xl box-border sm:p-3 bg-gray-100 hover:bg-gray-200 focus-visible:bg-gray-200 w-12 h-12"
            title="Lock (Esc)"
          >
            <cb-locked />
          </button>
        </div>
        <div class="flex-all box-border bg-gray-100 hover:bg-gray-200 focus-within:bg-gray-200 h-12 w-full ms-2 max-w-80">
          <input
            type="text"
            v-model="searchText"
            placeholder="Search…"
            class="bg-transparent p-2 text-lg sm:p-3 pe-0 sm:pe-0 h-12 outline-hidden border-none w-full"
            ref="searchinput"
          />
          <div
            class="flex-all p-2 text-xl box-border sm:p-3"
            title="Search"
            v-show="searchText.length === 0"
            @click="$refs.searchinput.focus()"
          >
            <cb-search />
          </div>
          <button
            @click.prevent="clearSearch"
            class="flex-all p-2 text-xl box-border sm:p-3 hover:bg-gray-300 focus-visible:bg-gray-300"
            title="Clear"
            v-show="searchText.length > 0"
          >
            <cb-close />
          </button>
        </div>
      </div>
      <section class="max-w-7xl w-11/12 mt-6 mx-auto grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-16" v-if="filteredEntries.length > 0">
        <button
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="text-start ring-2 ring-gray-200 bg-white h-34 sm:h-40 p-4 pb-3 cursor-pointer transform transition-transform hover:bg-gray-200 hover:-translate-y-1 focus-visible:bg-gray-200 focus-visible:-translate-y-1 flex items-start justify-start flex-col"
          :title="entry.name"
          @click="openEntry(entry.id)"
        >
          <div v-if="entry.urls.length > 0 && getHostname(entry.urls[0])" class="flex items-center text-gray-500 mb-3 sm:mb-4">
            <div class="w-6 h-6 rounded-full inline-block overflow-hidden me-2 shrink-0 bg-gray-300">
              <img :src="`https://icon.horse/icon/${getHostname(entry.urls[0])}`">
            </div>
            <span class="truncate">{{ getHostname(entry.urls[0]) }}</span>
          </div>
          <h3 class="font-display text-2xl sm:text-3xl truncate w-full grow-0" :class="entry.urls.length > 0 && getHostname(entry.urls[0]) ? '' : 'mt-0.5'">{{ entry.name }}</h3>
          <div v-if="findUsername(entry)" class="flex items-center text-gray-500" :class="entry.urls.length > 0 && getHostname(entry.urls[0]) ? 'mt-4 sm:mt-8' : 'mt-10 sm:mt-20'">
            <cb-user class="me-2 shrink-0" />
            <span class="truncate">{{ findUsername(entry) }}</span>
          </div>
        </button>
      </section>
      <section class="max-w-7xl w-11/12 mt-20 mx-auto mb-16 flex items-center justify-center" v-if="filteredEntries.length === 0 && metaList.length > 0">
        <p class="text-gray-500">No result</p>
      </section>
      <section class="max-w-7xl w-11/12 mt-20 mx-auto mb-16 flex items-center justify-center" v-if="filteredEntries.length === 0 && metaList.length === 0">
        <p class="text-gray-500">No entry. Add a new entry to get started.</p>
      </section>
    </section>
  </transition>
  <TransitionGroup
    enter-active-class="transition origin-right duration-100 ease-out"
    enter-from-class="transform translate-x-3 opacity-0 scale-90"
    enter-to-class="transform translate-x-0 opacity-100 scale-100"
    leave-active-class="transition origin-right duration-100 ease-in"
    leave-from-class="transform translate-x-0 opacity-100 scale-100"
    leave-to-class="transform translate-x-3 opacity-0 scale-90"
    tag="ul"
    class="fixed w-96 bottom-0 right-0 z-99"
  >
    <li
      v-for="error in errorList"
      :key="error.id"
      class="m-3 flex items-stretch justify-between border-s-[6px]"
      :class="{
        'bg-red-800': error.type === 'error',
        'border-red-900': error.type === 'error',
        'text-red-50': error.type === 'error',
        'bg-orange-600': error.type === 'warning',
        'border-orange-800': error.type === 'warning',
        'text-orange-50': error.type === 'warning'
      }"
    >
      <div class="p-3 sm:p-4 pe-2 sm:pe-2">
        <h3 class="font-display font-bold text-lg">{{ error.type === 'error' ? 'Error' : 'Warning' }}</h3>
        {{ error.message }}
      </div>
      <button
        @click="errorList = errorList.filter((item) => item.id !== error.id)"
        class="flex items-center justify-between p-3 text-lg box-border sm:p-4"
        :class="{
          'hover:bg-red-900': error.type === 'error',
          'text-red-50': error.type === 'error',
          'hover:bg-orange-700': error.type === 'warning',
          'text-orange-50': error.type === 'warning'
        }"
      >
        <cb-close />
      </button>
    </li>
  </TransitionGroup>
  <TransitionRoot appear :show="help" as="template">
    <Dialog as="div" @close="help = false" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-0 xs:p-4 text-center flex-col">
          <TransitionChild
            as="template"
            enter="transform duration-200 ease-out"
            enter-from="translate-y-3 opacity-0"
            enter-to="translate-y-0 opacity-100"
            leave="transform duration-200 ease-in"
            leave-from="translate-y-0 opacity-100"
            leave-to="translate-y-3 opacity-0"
          >
            <DialogPanel class="flex flex-col justify-between w-full grow transform overflow-hidden bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all xs:max-w-4xl xs:grow-0">
              <div>
                <DialogTitle as="h3" class="text-3xl font-display leading-6 text-gray-900 mt-2">Help</DialogTitle>
                <div class="mt-4 text-sm sm:text-base">
                  <p class="text-gray-700">
                    A password management tool as a demonstration and proof of concept of WebAuthn PRF extension and Large Blob extension.
                  </p>
                  <p class="mt-1 text-gray-700">
                    This application is a personal experimental project and is not created by, affiliated with, or supported by Doist, the company behind Todoist.
                  </p>
                  <div class="text-blue-900 bg-blue-100 p-3 mt-3 flex">
                    <cb-warning class="me-2 shrink-0 mt-0.5"/>
                    <p>Please note this is not a production-ready password manager and should not be used for storing sensitive data. Test use only.</p>
                  </div>
                  <div class="text-gray-900 bg-gray-200 p-3 mt-3 flex flex-col">
                    <div class="flex">
                      <cb-lightning class="me-2 shrink-0 mt-0.5"/>
                      <div class="grow">
                        <p>Test your platform's capabilities by creating a passkey below. Two green checks mean you're good to go. You can delete the passkey created here after testing.</p>
                        <hr class="mt-2 mb-3 w-full border-[1px] border-gray-300">
                        <div class="flex justify-between">
                          <button class="btn btn-small" @click.prevent="test" :disabled="loading" :class="{ 'btn-loading': loading }">Test</button>
                          <div class="flex items-center">
                            <span class="inline-flex items-center">
                              <cb-pending class="me-1 text-gray-500" v-show="prfTest === 'pending'" />
                              <cb-checkmark-outline class="me-1 text-green-600" v-show="prfTest === 'true'" />
                              <cb-close-outline class="me-1 text-red-600" v-show="prfTest === 'false'" />
                              PRF
                            </span>
                            <span class="inline-flex items-center ms-3">
                              <cb-pending class="me-1 text-gray-500" v-show="lbTest === 'pending'" />
                              <cb-checkmark-outline class="me-1 text-green-600" v-show="lbTest === 'true'" />
                              <cb-close-outline class="me-1 text-red-600" v-show="lbTest === 'false'" />
                              Large Blob
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Disclosure v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center w-full text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-6">
                      <h4 class="text-start">What is this?</h4>
                      <cb-chevron-down :class="open ? 'rotate-180 transform' : ''" class="transition duration-200 h-6 w-6 ms-2" />
                    </DisclosureButton>
                    <transition
                      enter-active-class="transition-all duration-300 ease-linear overflow-hidden"
                      enter-from-class="max-h-0 opacity-0"
                      enter-to-class="max-h-[400px] opacity-100"
                      leave-active-class="transition-all duration-300 ease-linear overflow-hidden"
                      leave-from-class="max-h-[400px] opacity-100"
                      leave-to-class="max-h-0 opacity-0"
                    >
                      <DisclosurePanel class="text-gray-700">
                        <p class="mt-2">
                          This is a password management tool created as a demonstration and proof of concept of WebAuthn PRF (Pseudo Random Function) extension and Large Blob extension. You can encrypt your passwords using your authenticator, save them to the cloud, and decrypt them using the same authenticator later. All cryptographic operations run in your browser.
                        </p>
                        <p class="mt-1">
                          WebAuthn PRF extension generates high-entropy bytes from your authenticator, which can be used for encrypting and decrypting data. WebAuthn Large Blob extension allows you to store arbitrary data in your passkey. In this demonstration, this is used to store data for authentication. Combined, these two extensions can be used to create a secure password manager.
                        </p>
                      </DisclosurePanel>
                    </transition>
                  </Disclosure>
                  <Disclosure as="div" class="mt-2" v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center w-full text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-6">
                      <h4 class="text-start">Why should I care?</h4>
                      <cb-chevron-down :class="open ? 'rotate-180 transform' : ''" class="transition duration-200 h-6 w-6 ms-2" />
                    </DisclosureButton>
                    <transition
                      enter-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      enter-from-class="max-h-0 opacity-0"
                      enter-to-class="max-h-[260px] opacity-100"
                      leave-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      leave-from-class="max-h-[260px] opacity-100"
                      leave-to-class="max-h-0 opacity-0"
                    >
                      <DisclosurePanel class="text-gray-700">
                        <p class="mt-2">
                          Moving from passwords to passkeys means stronger security and smoother user experience. Passkeys are generated from your authenticator, they are unique to you and cannot be stolen. The PRF extension and the Large Blob extension enable more opportunities for passkeys.
                        </p>
                        <p class="mt-1">
                          Plus, passkeys are synced across platforms nativly, so you can use they anywhere without remembering them.
                        </p>
                      </DisclosurePanel>
                    </transition>
                  </Disclosure>
                  <Disclosure as="div" class="mt-2" v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center w-full text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-6">
                      <h4 class="text-start">What do I need?</h4>
                      <cb-chevron-down :class="open ? 'rotate-180 transform' : ''" class="transition duration-200 h-6 w-6 ms-2" />
                    </DisclosureButton>
                    <transition
                      enter-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      enter-from-class="max-h-0 opacity-0"
                      enter-to-class="max-h-[370px] opacity-100"
                      leave-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      leave-from-class="max-h-[370px] opacity-100"
                      leave-to-class="max-h-0 opacity-0"
                    >
                      <DisclosurePanel class="text-gray-700">
                        <p class="mt-2">
                          Clearly you need WebAuthn PRF extension support and Large Blob extension support on the platform you are using. These may vary depending on the browser, the operating system, and the authenticator you are using. You also need a Todoist account to store your data, so you need an API token to connect to Todoist.
                        </p>
                        <p class="mt-1">
                          Currently known platforms with out-of-box support are:
                        </p>
                        <ul class="list-disc ps-5 mt-1">
                          <li>Safari on iOS/iPadOS 18</li>
                          <li>Safari on MacOS 15</li>
                          <li>Google Chrome Desktop with Google Password Manager</li>
                          <li>Google Chrome Desktop with Yubikey 5.7+</li>
                        </ul>
                      </DisclosurePanel>
                    </transition>
                  </Disclosure>
                  <Disclosure as="div" class="mt-2" v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center w-full text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-6">
                      <h4 class="text-start">Why do I need a Todoist account?</h4>
                      <cb-chevron-down :class="open ? 'rotate-180 transform' : ''" class="transition duration-200 h-6 w-6 ms-2" />
                    </DisclosureButton>
                    <transition
                      enter-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      enter-from-class="max-h-0 opacity-0"
                      enter-to-class="max-h-[450px] opacity-100"
                      leave-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      leave-from-class="max-h-[450px] opacity-100"
                      leave-to-class="max-h-0 opacity-0"
                    >
                      <DisclosurePanel class="text-gray-700">
                        <p class="mt-2">
                          WebAuthn Large Blob extension usually has very small size limitations (~1KB) so it can only be used to store metadata like API tokens. You need a cloud storage to store your encrypted data. Todoist is used as a cloud storage in this demonstration, but it's not a part of the WebAuthn standard. Don't worry, your data is encrypted by PRF before it is stored in Todoist.
                        </p>
                        <p class="mt-1">
                          Todoist is a task management service. It has been chosen because:
                        </p>
                        <ul class="list-disc ps-5 mt-1">
                          <li>It's free and offers REST APIs</li>
                          <li>It saves storage space on your security key as only one API token is needed</li>
                          <li>As all the data is encrypted, you don't need secure database services</li>
                          <li>This is my personal project and I'm lazy</li>
                        </ul>
                        <p class="mt-1">
                          This application is not created by, affiliated with, or supported by Doist, the company behind Todoist.
                        </p>
                      </DisclosurePanel>
                    </transition>
                  </Disclosure>
                  <Disclosure as="div" class="mt-2" v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center w-full text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-6">
                      <h4 class="text-start">How can I get a Todoist API token?</h4>
                      <cb-chevron-down :class="open ? 'rotate-180 transform' : ''" class="transition duration-200 h-6 w-6 ms-2" />
                    </DisclosureButton>
                    <transition
                      enter-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      enter-from-class="max-h-0 opacity-0"
                      enter-to-class="max-h-[90px] opacity-100"
                      leave-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      leave-from-class="max-h-[90px] opacity-100"
                      leave-to-class="max-h-0 opacity-0"
                    >
                      <DisclosurePanel class="text-gray-700">
                        <p class="mt-2">
                          First you need to <a href="https://app.todoist.com/auth/signup" target="_blank" rel="noopener noreferrer" class="text-sky-600 underline">create a Todoist account</a>. You can generate an API token following <a href="https://todoist.com/help/articles/find-your-api-token-Jpzx9IIlB" target="_blank" rel="noopener noreferrer" class="text-sky-600 underline">this instruction</a>.
                        </p>
                      </DisclosurePanel>
                    </transition>
                  </Disclosure>
                  <Disclosure as="div" class="mt-2" v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center w-full text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-6">
                      <h4 class="text-start">What about privacy?</h4>
                      <cb-chevron-down :class="open ? 'rotate-180 transform' : ''" class="transition duration-200 h-6 w-6 ms-2" />
                    </DisclosureButton>
                    <transition
                      enter-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      enter-from-class="max-h-0 opacity-0"
                      enter-to-class="max-h-[240px] opacity-100"
                      leave-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      leave-from-class="max-h-[240px] opacity-100"
                      leave-to-class="max-h-0 opacity-0"
                    >
                      <DisclosurePanel class="text-gray-700">
                        <p class="mt-2">
                          In fact, Todoist is the only backend service here. All other things happen right in your browser. No data is leaving your device unencrypted. Browser extensions cannot read your encryption keys.
                        </p>
                        <p class="mt-1">
                          However, please note that your passkeys can be used to track you across different devices on the same website. There is no way to track you across websites using passkeys. <a href="https://passkeys.dev/docs/advanced/related-origins/" target="_blank" rel="noopener noreferrer" class="text-sky-600 underline">Learn more</a>.
                        </p>
                      </DisclosurePanel>
                    </transition>
                  </Disclosure>
                  <Disclosure as="div" class="mt-2" v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center w-full text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-6">
                      <h4 class="text-start">How can I get started?</h4>
                      <cb-chevron-down :class="open ? 'rotate-180 transform' : ''" class="transition duration-200 h-6 w-6 ms-2" />
                    </DisclosureButton>
                    <transition
                      enter-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      enter-from-class="max-h-0 opacity-0"
                      enter-to-class="max-h-[390px] opacity-100"
                      leave-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      leave-from-class="max-h-[390px] opacity-100"
                      leave-to-class="max-h-0 opacity-0"
                    >
                      <DisclosurePanel class="text-gray-700">
                        <ol class="text-gray-700 list-decimal ps-5 mt-2">
                          <li>Connect to Todoist using your API token</li>
                          <li>Todoist uses projects to organize tasks. Create a new project or select an empty project to store your data</li>
                          <li>Create a new passkey on your platform</li>
                          <li>Use the created passkey to encrypt your data. The encrypted data will be stored in Todoist, and your Todoist API token will be stored in your passkey</li>
                          <li>Now you are good to go. Every time you want to access or make changes to your data, you need to use the same passkey to decrypt and encrypt it</li>
                        </ol>
                      </DisclosurePanel>
                    </transition>
                  </Disclosure>
                  <Disclosure as="div" class="mt-2" v-slot="{ open }">
                    <DisclosureButton class="flex justify-between items-center w-full text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-6">
                      <h4 class="text-start">How can I access my vault on other devices?</h4>
                      <cb-chevron-down :class="open ? 'rotate-180 transform' : ''" class="transition duration-200 h-6 w-6 ms-2" />
                    </DisclosureButton>
                    <transition
                      enter-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      enter-from-class="max-h-0 opacity-0"
                      enter-to-class="max-h-[330px] opacity-100"
                      leave-active-class="transition-all duration-200 ease-linear overflow-hidden"
                      leave-from-class="max-h-[330px] opacity-100"
                      leave-to-class="max-h-0 opacity-0"
                    >
                      <DisclosurePanel class="text-gray-700">
                        <ol class="text-gray-700 list-decimal ps-5 mt-2">
                          <li>Just use the same passkey you used to create your vault to access your data</li>
                          <li>Since your Todoist API token is stored in your passkey, you don't need to type the token again. However, due to technical limitations, when you log in on a new device for the first, you need to authenticate your passkey twice, one for reading your Todoist API token and one for decrypting your data</li>
                          <li>The device now remembers your settings. From next time, you only need to authenticate once to access your data</li>
                        </ol>
                      </DisclosurePanel>
                    </transition>
                  </Disclosure>
                  <!-- <h4 class="text-xl sm:text-2xl font-display leading-6 text-gray-900 mt-4">Technical details</h4>
                  <p class="text-gray-700">
                    If you are interested in the technologies under the hood, here are some great articles to read.
                  </p> -->
                </div>
              </div>
              <div class="mt-8 flex justify-between">
                <button
                  type="button"
                  class="inline-flex items-center justify-center border border-transparent bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
                  @click.prevent="share"
                >
                  Share
                  <cb-share class="ms-2" />
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center border border-transparent bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
                  @click="help = false"
                  ref="initialFocus"
                >
                  Got it
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
  <TransitionRoot appear :show="managePasskeyDialog" as="template">
    <Dialog as="div" @close="managePasskeyDialog = false" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-0 xs:p-4 text-center flex-col">
          <TransitionChild
            as="template"
            enter="transform duration-200 ease-out"
            enter-from="translate-y-3 opacity-0"
            enter-to="translate-y-0 opacity-100"
            leave="transform duration-200 ease-in"
            leave-from="translate-y-0 opacity-100"
            leave-to="translate-y-3 opacity-0"
          >
            <DialogPanel class="flex flex-col justify-between w-full grow transform overflow-hidden bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all xs:max-w-4xl xs:grow-0">
              <div>
                <DialogTitle as="h3" class="text-3xl font-display leading-6 text-gray-900 mt-2">Manage Passkey</DialogTitle>
                <div class="mt-6 text-sm sm:text-base">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-gray-700 text-base">Read passkey</h4>
                      <p class="text-gray-400 leading-4">Inspect your passkey's ID, large blob storage and PRF support.</p>
                    </div>
                    <button class="btn btn-small px-4 h-9 ms-3 mt-1" @click.prevent="inspectPasskey" :disabled="loading" :class="{ 'btn-loading': loading }">Read</button>
                  </div>
                  <div class="mt-3 text-sm text-gray-700 bg-gray-100 p-3">
                    <div>Passkey saved: <code class="break-all text-gray-400">{{ passkeySaved }}</code></div>
                    <div class="mt-1">Passkey read: <code class="break-all text-gray-400">{{ passkeyRead }}</code></div>
                  </div>
                  <h4 class="text-gray-700 mt-6 text-base">PRF</h4>
                  <p class="text-gray-400 leading-4">See how your passkey's PRF works.</p>
                  <div class="mt-3">
                    <Popover v-slot="{ open }" class="relative inline-flex me-3">
                      <PopoverButton
                        :class="open ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-600'"
                        class="btn btn-second btn-small h-9 inline-flex hover:text-red-800 focus-visible:text-red-800 hover:bg-red-200 focus-visible:bg-red-200"
                        :disabled="loading"
                      >
                        Use current
                      </PopoverButton>
                      <transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="-translate-y-2 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="translate-y-0 opacity-100"
                      leave-to-class="-translate-y-2 opacity-0"
                      >
                        <PopoverPanel v-slot="{ close }" class="absolute z-50 w-82 p-4 bg-red-50 text-sm left-0 border-red-100 border-[1px] top-full mt-2">
                          <div class="overflow-hidden">
                            <span class="opacity-80">When using the PRF salt currently saved with the passkey currently saved, the PRF output will be the raw material used to generate the current encryption key. Displaying it on screen may cause encryption key leakage. For debugging use only.</span>
                            <div class="flex justify-end mt-3">
                              <button
                                class="text-red-600 hover:text-red-800 focus-visible:text-red-800 bg-red-100 hover:bg-red-200 focus-visible:bg-red-200 px-3 py-2"
                                @click="useCurrentPrf(close)"
                              >
                                Use it anyway
                              </button>
                            </div>
                          </div>
                        </PopoverPanel>
                      </transition>
                    </Popover>
                    <button
                      class="btn btn-second btn-small max-w-96 h-9 inline-flex"
                      :disabled="loading"
                      @click.prevent="randomizeInputPrf"
                    >
                      Random
                    </button>
                  </div>
                  <ArrayEdit
                    v-model="passkeyInputPrf"
                    :readonly="false"
                    :update="passkeyInputPrfUpdate"
                    highlight="normal"
                    title="PRF Input Uint8Array"
                    class="mt-3"
                  />
                  <div class="flex justify-center items-center relative h-6">
                    <div class="bg-gray-300 w-0.5 h-full" />
                  </div>
                  <div class="flex justify-center items-center">
                    <button
                      class="btn w-full btn-next grow btn-small max-w-96 h-9"
                      :disabled="loading"
                      :class="{ 'btn-loading': loading }"
                      @click.prevent="inspectPasskeyRunPrf"
                    >
                      Proceed PRF
                      <PassKeyIcon v-if="!loading" />
                      <cb-circle-dash v-else />
                    </button>
                  </div>
                  <div class="flex justify-center items-center relative h-6">
                    <div class="bg-gray-300 w-0.5 h-full" />
                  </div>
                  <ArrayEdit
                    v-model="passkeyReadPrf"
                    :readonly="true"
                    :update="passkeyReadPrfUpdate"
                    highlight="normal"
                    title="PRF Output Uint8Array"
                  />
                  <h4 class="text-gray-700 mt-6 text-base">Large Blob</h4>
                  <p class="text-gray-400 leading-4">See what's inside your passkey's large blob storage.</p>
                  <div class="mt-2 flex text-sm text-gray-500 flex-wrap">
                    <div class="flex items-center gap-2 me-3">
                      <div class="bg-green-400 rounded-full w-2 h-2" /> Project ID Length
                    </div>
                    <div class="flex items-center gap-2 me-3">
                      <div class="bg-blue-800 rounded-full w-2 h-2" /> Todoist API Token
                    </div>
                    <div class="flex items-center gap-2 me-3">
                      <div class="bg-amber-400 rounded-full w-2 h-2" /> Project ID
                    </div>
                    <div class="flex items-center gap-2 me-3">
                      <div class="bg-purple-400 rounded-full w-2 h-2" /> PRF Salt
                    </div>
                  </div>
                  <ArrayEdit
                    v-model="passkeyReadLargeBlob"
                    :readonly="false"
                    :update="passkeyReadLargeBlobUpdate"
                    highlight="lb"
                    title="Uint8Array"
                    class="mt-1"
                  />
                  <div class="mt-3">
                    <Popover v-slot="{ open }" class="relative inline-flex me-3">
                      <PopoverButton
                        :class="open ? 'bg-amber-200 text-amber-800' : 'bg-amber-100 text-amber-600'"
                        class="btn btn-second btn-small h-9 inline-flex hover:text-amber-800 focus-visible:text-amber-800 hover:bg-amber-200 focus-visible:bg-amber-200 disabled:pointer-events-none"
                        :disabled="loading || passkeyReadLargeBlob.length === 0 || passkeyRead === 'Pending'"
                      >
                        Write to passkey
                      </PopoverButton>
                      <transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="translate-y-2 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="translate-y-0 opacity-100"
                      leave-to-class="translate-y-2 opacity-0"
                      >
                        <PopoverPanel v-slot="{ close }" class="absolute z-50 w-82 p-4 bg-amber-50 text-sm left-0 border-amber-100 border-[1px] bottom-full mb-2">
                          <div class="overflow-hidden">
                            <span class="opacity-80">Writing incorrectly formatted content to the passkey may prevent you from decrypting the data using this passkey in the future. For debugging use only.</span>
                            <div class="flex justify-end mt-3">
                              <button
                                class="text-amber-600 hover:text-amber-800 focus-visible:text-amber-800 bg-amber-100 hover:bg-amber-200 focus-visible:bg-amber-200 px-3 py-2"
                                @click="inspectPasskeyWriteLargeBlob(close)"
                              >
                                Write
                              </button>
                            </div>
                          </div>
                        </PopoverPanel>
                      </transition>
                    </Popover>
                    <button
                      class="btn btn-second btn-small h-9 inline-flex"
                      :disabled="loading"
                      @click.prevent="inspectPasskeyReadLargeBlob"
                    >
                      Read from passkey
                    </button>
                  </div>
                </div>
              </div>
              <div class="mt-8 flex flex-row-reverse">
                <button
                  type="button"
                  class="inline-flex justify-center border border-transparent bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
                  @click="managePasskeyDialog = false"
                  ref="initialFocus"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
  <TransitionRoot appear :show="manageStorageDialog" as="template">
    <Dialog as="div" @close="manageStorageDialog = false" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-0 xs:p-4 text-center flex-col">
          <TransitionChild
            as="template"
            enter="transform duration-200 ease-out"
            enter-from="translate-y-3 opacity-0"
            enter-to="translate-y-0 opacity-100"
            leave="transform duration-200 ease-in"
            leave-from="translate-y-0 opacity-100"
            leave-to="translate-y-3 opacity-0"
          >
            <DialogPanel class="flex flex-col justify-between w-full grow transform overflow-hidden bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all xs:max-w-4xl xs:grow-0">
              <div>
                <DialogTitle as="h3" class="text-3xl font-display leading-6 text-gray-900 mt-2">Manage storage</DialogTitle>
                <div class="mt-4 text-sm sm:text-base">
                  <p class="text-gray-700">
                    Manage your local storage and cloud storage. To check your passkey's large blob storage, use “Manage Passkey”.
                  </p>
                  <h4 class="text-gray-700 text-base mt-6">Local Storage</h4>
                  <p class="text-gray-400 leading-4">Inspect your local storage. No changes will be saved until you press “Save”.</p>
                  <div class="mt-3 text-gray-700">
                    <label class="inline-block w-21 me-3" for="prf-salt">PRF Salt</label>
                    <input class="font-code text-sm border-2 border-gray-300 w-58 outline-none p-2 py-0.5 focus:border-gray-400" type="text" id="prf-salt" v-model="storageSalt" />
                  </div>
                  <div class="mt-1 text-gray-700" :class="{ 'opacity-50': !storageKeyidSave }">
                    <label class="inline-block w-21 me-3" for="pk-id">Passkey ID</label>
                    <input class="font-code text-sm border-2 border-gray-300 w-58 outline-none p-2 py-0.5 bg-gray-200" type="text" id="pk-id" readonly disabled v-if="!storageKeyidSave" />
                    <input class="font-code text-sm border-2 border-gray-300 w-58 outline-none p-2 py-0.5 focus:border-gray-400" type="text" id="pk-id" v-model="storageKeyid" v-else />
                  </div>
                  <div class="mt-2 flex items-center text-gray-700">
                    <input class="me-3 appearance-none bg-gray-200 rounded-full border-none cursor-pointer relative w-10 h-6 before:rounded-full before:absolute before:left-1 before:top-1 before:bg-gray-400 before:transition-all before:duration-100 before:ease-out before:h-4 before:w-4 checked:bg-gray-300 checked:before:bg-gray-600 checked:before:left-5 checked:before:shadow-sm" type="checkbox" id="pk-id-save" v-model="storageKeyidSave" />
                    <label for="pk-id-save">Save passkey ID to local storage</label>
                  </div>
                  <div class="mt-3">
                    <button class="btn btn-second btn-small h-9 inline-flex me-3" @click.prevent="storageRefreshLocalStorage">Refresh</button>
                    <button class="btn btn-second btn-small h-9 inline-flex" @click.prevent="storageSaveLocalStorage">Save</button>
                  </div>
                  <div class="text-blue-900 bg-blue-100 p-3 mt-3 flex">
                    <cb-warning class="me-2 shrink-0 mt-0.5"/>
                    <p>Passkey IDs may look different between authenticator manufacturers, models, or software passkey providers. This may give attackers a hint about which passkey is in use. In some cases, storing the passkey ID together with the PRF salt publicly may result in a security risk. On the other hand, remembering the passkey ID can provide a better user experience by skipping the passkey selection step.</p>
                  </div>
                  <h4 class="text-gray-700 mt-6 text-base">Cloud Storage</h4>
                  <p class="text-gray-400 leading-4">Manage your cloud storage on Todoist.</p>
                  <button class="mt-3 btn btn-second btn-small h-9 inline-flex" @click.prevent="storageRefreshTodoist" :disabled="loading">Refresh</button>
                  <div class="mt-3">
                    <div class="flex items-center flex-wrap">
                      <div class="w-21">Status</div><div class="font-code text-gray-500">{{ storageTodoistStatus }}</div>
                    </div>
                    <div class="flex items-center flex-wrap">
                      <div class="w-21">Token</div>
                      <div class="font-code text-gray-500 me-1" v-if="storageTodoistTokenVisible">{{ apiToken }}</div>
                      <div class="font-code text-gray-500 me-1" v-else>•••••••••••</div>
                      <button class="btn btn-second btn-small h-6 inline-flex bg-transparent w-6 p-0 items-center justify-center focus-visible:bg-gray-200 hover:bg-gray-200" @click="storageTodoistTokenVisible = !storageTodoistTokenVisible" :title="storageTodoistTokenVisible ? 'Hide' : 'Show'">
                        <cb-view-off v-if="storageTodoistTokenVisible" />
                        <cb-view v-else />
                      </button>
                    </div>
                    <div class="flex items-center flex-wrap">
                      <div class="w-21">Project</div>
                      <div class="font-code text-gray-500">{{ selectedProject }}</div>
                    </div>
                    <div class="flex items-center flex-wrap">
                      <div class="w-21">Entries</div>
                      <div class="font-code text-gray-500" v-if="storageTodoistStatus === 'Syncing'">Loading</div>
                      <div class="font-code text-gray-500" v-else>{{ storageTodoistEntriesCount }} (Cloud) / {{ rawTaskList.length }} (Local)</div>
                    </div>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-3">
                    <Popover v-slot="{ open }" class="relative inline-flex">
                      <PopoverButton
                        :class="open ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-600'"
                        class="btn btn-second btn-small h-9 inline-flex hover:text-red-800 focus-visible:text-red-800 hover:bg-red-200 focus-visible:bg-red-200 disabled:pointer-events-none"
                        :disabled="loading"
                      >
                        Delete this project
                      </PopoverButton>
                      <transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="translate-y-2 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="translate-y-0 opacity-100"
                      leave-to-class="translate-y-2 opacity-0"
                      >
                        <PopoverPanel v-slot="{ close }" class="absolute z-50 w-82 p-4 bg-red-50 text-sm left-0 border-red-100 border-[1px] bottom-full mb-2">
                          <div class="overflow-hidden">
                            <span class="opacity-80">Delete this whole project from Todoist. You will be logged out immediately and will need to re-setup your vault. This action cannot be undone.</span>
                            <div class="flex justify-end mt-3">
                              <button
                                class="text-red-600 hover:text-red-800 focus-visible:text-red-800 bg-red-100 hover:bg-red-200 focus-visible:bg-red-200 px-3 py-2"
                                @click="storageDeleteProject(close)"
                              >
                                Delete this project
                              </button>
                            </div>
                          </div>
                        </PopoverPanel>
                      </transition>
                    </Popover>
                  </div>
                </div>
              </div>
              <div class="mt-8 flex flex-row-reverse">
                <button
                  type="button"
                  class="inline-flex justify-center border border-transparent bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
                  @click="manageStorageDialog = false"
                  ref="initialFocus"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
  <TransitionRoot appear :show="entryOpened" as="template">
    <Dialog as="div" @close="closeEntry(true)" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-0 xs:p-4 text-center flex-col">
          <TransitionChild
            as="template"
            enter="transform duration-200 ease-out"
            enter-from="translate-y-3 opacity-0 scale-99"
            enter-to="translate-y-0 opacity-100 scale-100"
            leave="transform duration-200 ease-in"
            leave-from="translate-y-0 opacity-100 scale-100"
            leave-to="translate-y-3 opacity-0 scale-99"
          >
            <DialogPanel class="w-full grow transform overflow-hidden bg-white text-left align-middle shadow-xl transition-all xs:max-w-3xl xs:grow-0">
              <Entry
                :id="openedId"
                :entry="openedEntry"
                :salt="firstSalt"
                :raw="rawTaskList"
                :keyid="keyid"
                :networkloading="loading"
                :adding="addingEntry"
                @close="closeEntry"
                @delete="deleteOpenedEntry"
                @update="updateOpenedEntry"
                @add="addNewEntry"
                :key="entryUpdateKey"
                ref="entry"
              />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/vue'
import { compressToUint8Array, decompressFromUint8Array } from 'lz-string'
import { stringify, parse } from 'zipson'
import { useKeypress } from 'vue3-keypress'
import MiniSearch from 'minisearch'

import Bg from './components/bg/Bg.vue'
import Entry from './components/Entry.vue'
import ArrayEdit from './components/ArrayEdit.vue'
import PassKeyIcon from './components/PassKeyIcon.vue'

import passkey from './passkey'
import { arrayToBase64String, betterFetch, generateRandomUint8Array, verifyFormat } from './tools/functions'
import { addEntry, updateEntry, deleteEntry, getAll, deleteAll } from './tools/storageTodoist'

import demoData from './tools/demoData'

// Todoist color list map
const todoistColorList = {
  berry_red: '#b8256f',
  red: '#db4035',
  orange: '#ff9933',
  yellow: '#fad000',
  olive_green: '#afb83b',
  lime_green: '#7ecc49',
  green: '#299438',
  mint_green: '#6accbc',
  teal: '#158fad',
  sky_blue: '#14aaf5',
  light_blue: '#96c3eb',
  blue: '#4073ff',
  grape: '#884dff',
  violet: '#af38eb',
  lavender: '#eb96eb',
  magenta: '#e05194',
  salmon: '#ff8d85',
  charcoal: '#808080',
  grey: '#b8b8b8',
  taupe: '#ccac93'
}

// Initialize Highlight API
if (CSS.highlights) {
  window.highlightLetters = new Highlight()
  window.highlightNumbers = new Highlight()
  window.highlightIgnored = new Highlight()
  window.highlightNotice = new Highlight()
  window.highlightOther = new Highlight()
  window.highlightSpecial = new Highlight()
  CSS.highlights.set('hl-letters', highlightLetters)
  CSS.highlights.set('hl-numbers', highlightNumbers)
  CSS.highlights.set('hl-ignored', highlightIgnored)
  CSS.highlights.set('hl-notice', highlightNotice)
  CSS.highlights.set('hl-other', highlightOther)
  CSS.highlights.set('hl-special', highlightSpecial)
}

// Global states
const firstSalt = ref('')
const keyid = ref('')
const logedin = ref(false)
const loading = ref(false)
const errorList = ref([])
const apiToken = ref('')
const todoistList = ref([])
const selectedProject = ref('')
const metaList = ref([])
const rawTaskList = ref([])
const searchText = ref('')
const builtEntriesList = ref([])

// Config
const configStep = ref(5)
const createName = ref('')
const welcome = ref(false)
const prepareProgress = ref(0)
const newDevice = ref(true)

// Entry
const entryOpened = ref(false)
const openedId = ref('')
const addingEntry = ref(false)
const entryUpdateKey = ref(0)

// Help
const help = ref(false)
const prfTest = ref('pending')
const lbTest = ref('pending')

// Passkey debug tool
const managePasskeyDialog = ref(false)
const passkeyRead = ref('Pending')
const passkeyReadPrf = ref([])
const passkeyInputPrf = ref([])
const passkeyReadLargeBlob = ref([])
const passkeyInputPrfUpdate = ref(0)
const passkeyReadPrfUpdate = ref(0)
const passkeyReadLargeBlobUpdate = ref(0)

// Storage debug tool
const manageStorageDialog = ref(false)
const storageSalt = ref('')
const storageKeyid = ref('')
const storageKeyidSave = ref(false)
const storageTodoistStatus = ref('Syncing')
const storageTodoistTokenVisible = ref(false)
const storageTodoistEntriesCount = ref(0)

// Element references
const tokeninput = useTemplateRef('tokeninput')
const searchinput = useTemplateRef('searchinput')
const step3next = useTemplateRef('step3next')
const step4next = useTemplateRef('step4next')
const step6next = useTemplateRef('step6next')
const entryRef = useTemplateRef('entry')

// Initialize search
let miniSearch = new MiniSearch({
  fields: ['name', '_joined_urls', '_searchable_fields'],
  storeFields: ['id', 'name', 'urls', 'fields'],
  extractField: (document, fieldName) => {
    if (fieldName === '_searchable_fields') {
      return document._searchable_fields.join(' ')
    }
    return document[fieldName]
  },
  searchOptions: {
    boost: { name: 2 },
    fuzzy: 0.2,
    prefix: true
  }
})

// Manage global esc listener
useKeypress({
  keyEvent: 'keydown',
  keyBinds: [
    {
      keyCode: 'esc',
      success: () => {
        if (logedin.value) {
          if (!entryOpened.value && !managePasskeyDialog.value && !manageStorageDialog.value && !help.value) {
            logout()
          }
        }
      },
      preventDefault: false
    },
  ]
})

watch(logedin, (value) => {
  if (value) {
    // Index the entries when logged in
    builtEntriesList.value = metaList.value.map((entry) => ({
      id: entry.id,
      name: entry.name,
      urls: entry.urls,
      fields: entry.fields,
      _joined_urls: entry.urls.join(' '),
      _searchable_fields: entry.fields.filter((i) => i.type !== 'password' && i.type !== 'card').map((i) => i.value)
    }))
    miniSearch.addAll(builtEntriesList.value)
  }
})

// Search the entries
const filteredEntries = computed(() => {
  if (searchText.value.length === 0) return builtEntriesList.value
  return miniSearch.search(searchText.value)
})

// Check if a passkey is saved
const passkeySaved = computed(() => {
  return JSON.parse(localStorage.getItem('prf_config') || '{"id": "N/A"}').id
})

// Check if the token is valid
const vaildToken = computed(() => {
  return /^([a-f]|\d){40}$/i.test(apiToken.value)
})

// Check if the project name is valid and unique
const vaildName = computed(() => {
  return createName.value.length > 0 && createName.value.length <= 100 && todoistList.value.find((item) => item.name === createName.value) === undefined
})

// Compute the opened entry, or a placeholder if it's not found
const openedEntry = computed(() => {
  return metaList.value.find((item) => item.id === openedId.value) || {
    name: '',
    id: '-1',
    urls: [],
    fields: [],
    lastUpdated: 0
  }
})

/**
 * Report an error or a warning on the right bottom of the screen
 * @param {Error} e The error or warning to report
 * @param {('error'|'warning')?} type The type of the error
 */
const reportError = (e, type = 'error') => {
  const id = `${Date.now()}${crypto.randomUUID()}`
  errorList.value.push({
    id,
    message: e.message,
    type
  })

  // Remove the error after 15 seconds
  setTimeout(() => {
    errorList.value = errorList.value.filter((item) => item.id !== id)
  }, 15000)
}

/**
 * Get the hostname from a url
 * @param {string} url The url to get the hostname from
 * @returns {string|false} The hostname or false if the url is invalid
 */
const getHostname = (url) => {
  try {
    return new URL(url).hostname
  } catch (e) {
    return false
  }
}

/**
 * Find the first username field in the entry
 * @param {Object} entry The entry to find the username in
 * @returns {string|false} The username or false if not found
 */
const findUsername = (entry) => {
  return entry.fields.find((item) => item.type === 'username')?.value || false
}

/**
 * Share the current page
 */
const share = () => {
  if (navigator.share) {
    navigator.share({
      title: 'WebAuthn PRF Password Manager Proof of Concept - Created by @AxtonYao',
      text: 'A password management tool as a demonstration and proof of concept of WebAuthn PRF extension and Large Blob extension. Created by @AxtonYao',
      url: window.location.origin
    })
  }
}

/**
 * Clear the search input
 */
const clearSearch = () => {
  searchText.value = ''
  searchinput.value.focus()
}

/**
 * Purge the local storage
 */
const purgeLocalStorage = () => {
  localStorage.removeItem('prf_config')
  newDevice.value = true
}

/**
 * Start the setup process
 * @param {Event} e The interaction event to prevent
 * @param {boolean?} push Whether to push the state
 */
const setUp = (e, push = true) => {
  if (e) {
    e.preventDefault()
  }

  configStep.value = 0
  if (push) {
    history.pushState(null, '', '/setup')
  }
  setTimeout(() => {
    if (tokeninput.value) {
      tokeninput.value.focus()
    }
  }, 100)
}

/**
 * Try to connect to Todoist and get the project list
 */
const connect = async () => {
  if (!vaildToken.value) return

  loading.value = true

  // Get the project list
  const data = await betterFetch('https://api.todoist.com/rest/v2/projects', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiToken.value}`
    }
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    return
  }

  // Connect error
  if (data.status && data.status !== 200) {
    const reason = await data.text()
    reportError(new Error(`${reason ? reason : 'Failed to connect to Todoist.'} (HTTP ${data.status})`))
    loading.value = false
    return
  }

  // Success, filter the project list
  // Remove the inbox project, shared projects and team inbox
  todoistList.value = data.filter((item) => !item.is_inbox_project && !item.shared && !item.is_team_inbox).map((item) => ({
    id: item.id,
    name: item.name,
    color: todoistColorList[item.color]
  }))

  // If there is no project, go to the next step
  if (todoistList.value.length === 0) {
    configStep.value = 2
  } else {
    // Otherwise, let the user select a project
    configStep.value = 1
    selectedProject.value = todoistList.value[0].id
  }

  loading.value = false
}

/**
 * Check if the selected project is empty. If so, go to the next step
 */
const select = async () => {
  loading.value = true

  // Get the task list
  const data = await betterFetch(`https://api.todoist.com/rest/v2/tasks?project_id=${selectedProject.value}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiToken.value}`
    }
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    return
  }

  // Connect error
  if (data.status && data.status !== 200) {
    const reason = await data.text()
    reportError(new Error(`${reason ? reason : 'Failed to read from the project.'} (HTTP ${data.status})`))
    loading.value = false
    return
  }

  if (data.length === 0) {
    // Empty project, go to the next step
    configStep.value = 3
    setTimeout(() => {
      step3next.value.focus()
    }, 100)
  } else {
    // Non-empty project, show the error
    reportError(new Error('The project is not empty. Please select another project or create a new one.'))
  }

  loading.value = false
}

/**
 * Create a new project
 */
const create = async () => {
  if (!vaildName.value) return

  loading.value = true

  // Create a new project
  const data = await betterFetch('https://api.todoist.com/rest/v2/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': crypto.randomUUID(),
      Authorization: `Bearer ${apiToken.value}`,
    },
    body: JSON.stringify({
      name: createName.value
    })
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    return
  }

  // Connect error
  if (data.status && data.status !== 200) {
    const reason = await data.text()
    reportError(new Error(`${reason ? reason : 'Failed to create a project.'} (HTTP ${data.status})`))
    loading.value = false
    return
  }

  selectedProject.value = data.id

  // Success
  configStep.value = 3
  setTimeout(() => {
    step3next.value.focus()
  }, 100);
  loading.value = false
}

/**
 * Ask user to register a new passkey
 */
const reg = async () => {
  loading.value = true

  // We can perform PRF during registrations, but not for writing large blob
  // So we need to ask for user interaction twice anyway
  // We do only registration here, then perform PRF and write large blob later in the initEncrypt function
  const res = await passkey.reg().catch((e) => {
    reportError(e)
    return false
  })

  if (!res) {
    loading.value = false
    return
  }

  loading.value = false

  if (res) {
    // All good, go to the next step
    keyid.value = res.publicKey.rawId
    firstSalt.value = res.firstSalt
    configStep.value = 6
    setTimeout(() => {
      step6next.value.focus()
    }, 100)
  }
}

/**
 * Inital encryption process
 */
const initEncrypt = async () => {
  loading.value = true

  const tokenEncoded = new TextEncoder().encode(`${apiToken.value}${selectedProject.value}`)

  // Prepare data to be stored into the passkey
  // To save space, we simply put everything into one string
  // token.project_id.firstSalt
  // And append the length of (token + project_id) to the beginning (1 byte)
  // As token has a fixed length of 40, we can calculate lengthes of rest parts and extract them
  let key = await passkey.getKey({
    keyid: keyid.value,
    firstSalt: firstSalt.value,
    write: await (new Blob([new Uint8Array([tokenEncoded.length]), tokenEncoded, firstSalt.value])).arrayBuffer(),
  }).catch((e) => {
    reportError(e)
    return false
  })

  // Handle error
  if (!key) {
    loading.value = false
    return
  }

  // Go to the progress bar page
  configStep.value = 7
  const totalSteps = demoData.length * 2 + 1
  prepareProgress.value = 0

  // This is the matadata list to be stored in Todoist
  // Simple format here: [entry name, Todoist task id for the entry body]
  // The idea here is, we can get the entry list first, then find the entry body task by id
  // Passwords are encrypted using separate keys, so we store them in separate tasks
  // Then replace password fileds with task ids
  // So to find a password, we have to go from entry list -> entry body -> password
  const builtMetaList = []

  // After the initialisation, we bring the user to the main page
  // So we need to build the metadata list for the UI
  // We build this list together with the initialisation process
  // So that we won't need to decrypt the metadata list again
  const curentMetaList = []

  for (const entry of demoData) {
    // We process passwords (also cards) first as they are on the bottom of the finding chain
    const passwords = entry.fields.filter((item) => item.type === 'password' || item.type === 'card').map((item) => item.value)

    // Encrypt passwords
    const res = await passkey.encrypt({
      key,
      plaintext: compressToUint8Array(stringify(passwords)),
      label: entry.name // Use entry name as label, so every password has a unique key (plus salt)
    }).catch((e) => {
      reportError(e)
      return false
    })

    // Handle error
    if (!res) {
      loading.value = false
      return
    }

    // Put the encrypted passwords into Todoist so we can get the id
    loading.value = false
    const data = await add({
      content: res.iv,
      description: res.ciphertext
    }).catch((e) => {
      reportError(e)
      return false
    })
    loading.value = true

    // Handle error
    if (!data) {
      loading.value = false
      return
    }

    // Update the progress bar
    prepareProgress.value += 100 / totalSteps

    // This array stores the entry body (only fields actually)
    const fields = []

    for (const item of entry.fields) {
      if (item.type === 'password') {
        // Replace password with task id
        item.value = data.id
      } else if (item.type === 'card') {
        // Replace card with task id and last 4 digits of the card number so we can display it before decrypting
        item.value = [data.id, item.value.split(',')[0].slice(-4)]
      }
      fields.push(item)
    }

    const lastUpdated = Date.now().valueOf()

    // Encrypt the entry body
    const resFields = await passkey.encrypt({
      key,
      plaintext: compressToUint8Array(stringify({
        urls: entry.urls,
        fields,
        lastUpdated
      })),
      label: 'prf-list' // This label is shared across all encrypted data except passwords
    }).catch((e) => {
      reportError(e)
      return false
    })

    // Handle error
    if (!resFields) {
      loading.value = false
      return
    }

    // Put the encrypted entry body into Todoist so we can get the id
    loading.value = false
    const dataFields = await add({
      content: resFields.iv,
      description: resFields.ciphertext
    }).catch((e) => {
      reportError(e)
      return false
    })
    loading.value = true

    // Handle error
    if (!dataFields) {
      loading.value = false
      return
    }

    curentMetaList.push({
      id: dataFields.id,
      name: entry.name,
      urls: entry.urls,
      fields,
      lastUpdated
    })

    // Update the progress bar
    prepareProgress.value += 100 / totalSteps

    // Add the entry to the metadata list
    builtMetaList.push([entry.name, dataFields.id])
  }

  // Now let's encrypt the metadata list
  const cipher = await passkey.encrypt({
    key,
    plaintext: compressToUint8Array(stringify(builtMetaList)),
    label: 'prf-list'
  }).catch((e) => {
    reportError(e)
    return false
  })

  // Delete the key from memory
  key = undefined

  // Handle error
  if (!cipher) {
    loading.value = false
    return
  }

  // Update the progress bar
  prepareProgress.value += 100 / totalSteps

  // Put the encrypted metadata list into Todoist
  loading.value = false
  const dataCipher = await add({
    content: 'PRF Metadata',
    description: `${cipher.iv}|${cipher.ciphertext}`
  }).catch((e) => {
    reportError(e)
    return false
  })
  loading.value = true

  // Handle error
  if (!dataCipher) {
    loading.value = false
    return
  }

  // Now get the raw data list from Todoist
  const rawData = await getAll({
    token: apiToken.value,
    projectId: selectedProject.value
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!rawData) {
    loading.value = false
    return
  }

  rawTaskList.value = rawData

  // Update local storage
  localStorage.setItem('prf_config', JSON.stringify({
    salt: arrayToBase64String(firstSalt.value),
    id: arrayToBase64String(new Uint8Array(keyid.value), true)
  }))

  //Before going to the main page, we need to set the metaList for the UI
  metaList.value = curentMetaList

  // Okay, we are done
  loading.value = false

  // Bring the user to the main page with a welcome message
  welcome.value = true
  logedin.value = true

  history.replaceState(null, '', '/')
}

/**
 * Read login data and do the login process
 */
const login = async () => {
  // If there is no login data saved, we need to read it from the passkey
  if (!localStorage.getItem('prf_config')) {
    loading.value = true

    // This pass we only read the large blob
    // As we need firstSalt on the next pass to get the decryption key
    const res = await passkey.read({
      firstSalt: false,
      withResponse: true,
      allowed: []
    }).catch((e) => {
      reportError(e)
      return false
    })

    if (!res) {
      loading.value = false
      return
    }

    const blob = res.blob

    // Decode the large blob and save the login data to the local storage
    const length = blob[0]
    localStorage.setItem('prf_config', JSON.stringify({
      salt: arrayToBase64String(blob.slice(length + 1)),
      id: res.response.id
    }))
    newDevice.value = false
    firstSalt.value = blob.slice(length + 1)
    keyid.value = res.response.rawId

    // Now ask user to interact with the passkey again to get the decryption key
    configStep.value = 4
    setTimeout(() => {
      step4next.value.focus()
    }, 100)
    loading.value = false
    return
  }

  // Read the login data from the local storage
  const config = JSON.parse(localStorage.getItem('prf_config'))
  firstSalt.value = Uint8Array.from(window.atob(config.salt), c => c.charCodeAt(0))
  keyid.value = config.id ? Uint8Array.from(window.atob(config.id.replace(/\-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)) : false

  // Now handle the login process
  handleLogin()
}

/**
 * Handle the login process
 * @param {boolean?} silentCancelledError - Whether to show an error when the login request is cancelled
 */
const handleLogin = async (silentCancelledError = false) => {
  loading.value = true

  // Read from the passkey so we can get the decryption key
  const read = await passkey.read({
    firstSalt: firstSalt.value,
    withResponse: false,
    allowed: keyid.value ? [keyid.value] : []
  }).catch((e) => {
    if (!silentCancelledError) {
      reportError(e)
    }
    return false
  })

  if (!read) {
    loading.value = false
    return
  }

  keyid.value = read.id

  // Also read from the large blob to get the token and project id
  const length = read.blob[0]
  const tokenEncoded = read.blob.slice(1, length + 1)
  const tokenDecoded = new TextDecoder().decode(tokenEncoded)
  apiToken.value = tokenDecoded.slice(0, 40)
  selectedProject.value = tokenDecoded.slice(40)

  // Now get the raw data list from Todoist
  const data = await getAll({
    token: apiToken.value,
    projectId: selectedProject.value
  }).catch((e) => {
    reportError(e)
    delete read.key
    return false
  })

  if (!data) {
    loading.value = false
    delete read.key
    return
  }

  rawTaskList.value = data

  // If the project is not configured for PRF Password Manager, show the error
  if (rawTaskList.value.length === 0) {
    reportError(new Error('The project is not configured for PRF Password Manager.'))
    loading.value = false
    delete read.key
    return
  }

  // Check if metadata exist and the format is correct
  const metadata = rawTaskList.value.find((item) => item.content === 'PRF Metadata')
  if (metadata && verifyFormat(metadata.description, 'metadata')) {
    // Decrypt the metadata
    const [iv, salt, msg] = metadata.description.split('|')
    const res = await passkey.decrypt({
      key: read.key,
      iv,
      ciphertext: `${salt}|${msg}`,
      label: 'prf-list'
    }).catch((e) => {
      reportError(e)
      return false
    })

    if (!res) {
      loading.value = false
      delete read.key
      return
    }

    // Build the list of entries
    const metaListEncrypted = parse(decompressFromUint8Array(res))
    const parsedList = []
    const promises = []
    const nameList = []

    // Decrypt each entry
    for (const item of metaListEncrypted) {
      const entry = rawTaskList.value.find((i) => i.id === item[1])
      if (!entry) {
        reportError(new Error('Some entries missing. Failed to decrypt the list.'))
        loading.value = false
        delete read.key
        return
      }

      promises.push(new Promise(async (resolve, reject) => {
        passkey.decrypt({
          key: read.key,
          iv: entry.content,
          ciphertext: entry.description,
          label: 'prf-list'
        }).then((res) => {
          if (!res) {
            reject(new Error('Failed to decrypt the list.'))
          }
          resolve(parse(decompressFromUint8Array(res)))
        }).catch((e) => {
          reject(e)
        })
      }))

      nameList.push(item)
    }

    const promiseResults = await Promise.all(promises).catch((e) => {
      reportError(e)
      return false
    })

    if (!promiseResults) {
      loading.value = false
      delete read.key
      return
    }

    for (let i = 0; i < promiseResults.length; i++) {
      parsedList.push({
        id: nameList[i][1],
        name: nameList[i][0],
        urls: promiseResults[i].urls,
        fields: promiseResults[i].fields,
        lastUpdated: promiseResults[i].lastUpdated
      })
    }

    delete read.key

    // All good, go to the main page
    metaList.value = parsedList
    loading.value = false
    logedin.value = true
  } else {
    // If the metadata is not found or the format is incorrect, show the error
    reportError(new Error('The project is not empty or not created by PRF Password Manager.'))
    delete read.key
    loading.value = false
  }
}

/**
 * Logout the user
 */
const logout = () => {
  // Discard all the data
  logedin.value = false
  welcome.value = false
  configStep.value = 5
  apiToken.value = ''
  todoistList.value = []
  selectedProject.value = ''
  createName.value = ''
  metaList.value = []
  rawTaskList.value = []
  searchText.value = ''
  firstSalt.value = ''
  keyid.value = ''
  entryOpened.value = false
  openedId.value = ''

  miniSearch.removeAll()
  miniSearch = null

  if (localStorage.getItem('prf_config')) {
    newDevice.value = false
  } else {
    newDevice.value = true
  }

  localStorage.setItem('prf_skip_auto_login', 'true')

  setTimeout(() => {
    builtEntriesList.value = []
  }, 100)

  // Refresh the page
  setTimeout(() => {
    window.location.reload()
  }, 200)
}

/**
 * Test the passkey's PRF and large blob support
 */
const test = async () => {
  prfTest.value = 'pending'
  lbTest.value = 'pending'
  loading.value = true

  // Start test by registering a passkey
  const res = await passkey.reg(true).catch((e) => {
    console.error(e)
    return false
  })

  if (!res) {
    loading.value = false
    return
  }

  // Show results
  prfTest.value = res.prf ? 'true' : 'false'
  lbTest.value = res.lb ? 'true' : 'false'
  loading.value = false
}

/**
 * Open a dialog to manage passkey
 * @param {Function?} close - The function to close the menu
 */
const managePasskey = (close) => {
  managePasskeyDialog.value = true
  if (close) {
    close()
  }

  // Generate a new random PRF input
  passkeyInputPrf.value = [...generateRandomUint8Array()]

  // Reset the passkey results
  passkeyReadPrf.value = []
  passkeyReadLargeBlob.value = []
  passkeyRead.value = 'Pending'
}

/**
 * Open a dialog to manage local storage
 * @param {Function?} close - The function to close the menu
 */
const manageStorage = (close) => {
  manageStorageDialog.value = true
  if (close) {
    close()
  }

  // Get the local storage data
  const local = localStorage.getItem('prf_config')
  if (local) {
    const { salt, id } = JSON.parse(local)
    storageSalt.value = salt
    storageKeyid.value = id || ''
    storageKeyidSave.value = id !== false
  }

  // Refresh Todoist status
  storageRefreshTodoist()
}

/**
 * Inspect the passkey, read ID, PRF, and large blob
 */
const inspectPasskey = async () => {
  loading.value = true

  // Do PRF with the PRF input and read the large blob
  const res = await passkey.read({
    firstSalt: Uint8Array.from(passkeyInputPrf.value),
    withResponse: true,
    allowed: []
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!res) {
    loading.value = false
    return
  }

  // Show results
  passkeyRead.value = res.response.id
  passkeyReadPrf.value = [...new Uint8Array(res.response.getClientExtensionResults().prf.results.first)]
  passkeyReadLargeBlob.value = [...new Uint8Array(res.blob)]
  passkeyReadPrfUpdate.value++
  passkeyReadLargeBlobUpdate.value++

  loading.value = false
}

/**
 * Inspect the passkey, run PRF
 */
const inspectPasskeyRunPrf = async () => {
  loading.value = true

  // Do PRF with the PRF input\
  const res = await passkey.read({
    firstSalt: Uint8Array.from(passkeyInputPrf.value),
    withResponse: true,
    allowed: []
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!res) {
    loading.value = false
    return
  }

  // Show results
  passkeyReadPrf.value = [...new Uint8Array(res.response.getClientExtensionResults().prf.results.first)]
  passkeyReadPrfUpdate.value++

  loading.value = false
}

/**
 * Inspect the passkey, read large blob
 */
const inspectPasskeyReadLargeBlob = async () => {
  loading.value = true

  // Read the large blob
  const res = await passkey.read({
    firstSalt: false,
    withResponse: true,
    allowed: []
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!res) {
    loading.value = false
    return
  }

  // Show results
  passkeyReadLargeBlob.value = [...new Uint8Array(res.blob)]
  passkeyReadLargeBlobUpdate.value++
  passkeyRead.value = res.response.id

  loading.value = false
}

/**
 * Inspect the passkey, write large blob. Only when a passkey is ready
 * @param {Function?} close - The function to close the popover
 */
const inspectPasskeyWriteLargeBlob = async (close) => {
  if (close) {
    close()
  }

  // Check if a passkey is ready
  if (!passkeyRead.value) {
    return
  }

  loading.value = true

  // Write the large blob
  const res = await passkey.write({
    keyid: Uint8Array.from(window.atob(passkeyRead.value.replace(/\-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
    write: await (new Blob([Uint8Array.from(passkeyReadLargeBlob.value)])).arrayBuffer()
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!res) {
    loading.value = false
    return
  }

  // Show results
  loading.value = false
}

/**
 * Randomize the PRF input textarea
 */
const randomizeInputPrf = () => {
  passkeyInputPrf.value = [...generateRandomUint8Array()]
  passkeyInputPrfUpdate.value++
}

/**
 * Use the current PRF input
 * @param {Function?} close - The function to close the menu
 */
const useCurrentPrf = (close) => {
  passkeyInputPrf.value = [...firstSalt.value]
  passkeyInputPrfUpdate.value++
  if (close) {
    close()
  }
}

/**
 * Read from local storage and update the UI
 */
const storageRefreshLocalStorage = () => {
  const data = JSON.parse(localStorage.getItem('prf_config') || '{"salt": "", "id": ""}')

  storageSalt.value = data.salt
  storageKeyid.value = data.id

  if (storageKeyid.value === false || storageKeyid.value === '' || storageKeyid.value === undefined) {
    storageKeyidSave.value = false
  } else {
    storageKeyidSave.value = true
  }
}

/**
 * Save to local storage
 */
const storageSaveLocalStorage = () => {
  localStorage.setItem('prf_config', JSON.stringify({
    salt: storageSalt.value,
    id: storageKeyidSave.value ? storageKeyid.value : false
  }))
}

/**
 * Refresh the Todoist storage status
 */
const storageRefreshTodoist = async () => {
  loading.value = true
  storageTodoistStatus.value = 'Syncing'

  // Get all the entries
  const data = await getAll({
    token: apiToken.value,
    projectId: selectedProject.value
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    storageTodoistStatus.value = 'Error'
    storageTodoistEntriesCount.value = 'N/A'
    return
  }

  // Update the UI
  storageTodoistStatus.value = 'Ready'
  storageTodoistEntriesCount.value = data.length

  loading.value = false
}

/**
 * Delete the project from Todoist
 */
const storageDeleteProject = async (close) => {
  if (close) {
    close()
  }

  loading.value = true

  // Delete the project
  const data = await deleteAll({
    token: apiToken.value,
    projectId: selectedProject.value
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    return
  }

  // Success, close the dialog and logout
  manageStorageDialog.value = false
  loading.value = false
  purgeLocalStorage()
  logout()
}

/**
 * Add a new entry to Todoist
 * @param {Object} config
 * @param {string} config.content - The content of the entry
 * @param {string} config.description - The description of the entry
 */
const add = async ({ content, description }) => {
  loading.value = true

  // Add the entry
  const data = await addEntry({
    title: content,
    body: description,
    auth: {
      token: apiToken.value,
      projectId: selectedProject.value
    }
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    return false
  }

  // Success
  loading.value = false
  return data
}

/**
 * Update an entry in Todoist
 * @param {Object} config
 * @param {string} config.id - The id of the entry to update
 * @param {string} config.content - The new content of the entry
 * @param {string} config.description - The new description of the entry
 */
const update = async ({ id, content, description }) => {
  loading.value = true

  // Update the entry
  const data = await updateEntry({
    id,
    title: content,
    body: description,
    auth: {
      token: apiToken.value
    }
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    return false
  }

  // Success
  loading.value = false
  return data
}

/**
 * Delete an entry from Todoist
 * @param {string} id - The id of the entry to delete
 */
const deleteTask = async (id) => {
  loading.value = true

  // Delete the entry
  const data = await deleteEntry({
    id,
    auth: {
      token: apiToken.value
    }
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    return false
  }

  // Success
  loading.value = false
  return true
}

/**
 * Open an entry and update url
 * @param {string} entry - The id of the entry to open
 * @param {boolean} push - Whether to push the state to the history
 */
const openEntry = (entry, push = true) => {
  openedId.value = entry
  entryOpened.value = true
  addingEntry.value = false
  entryUpdateKey.value = new Date().valueOf()

  if (push) {
    // Push the state to the history
    history.pushState(null, '', `/entry/${openedId.value}`)
  }
}

/**
 * Open the add new entry page and update url
 * @param {boolean} push - Whether to push the state to the history
 */
const openAddNewEntry = (push = true) => {
  openedId.value = '-1'
  entryOpened.value = true
  addingEntry.value = true
  entryUpdateKey.value = new Date().valueOf()

  if (push) {
    // Push the state to the history
    history.pushState(null, '', '/entry/new')
  }
}

/**
 * Close the opened entry and update url
 * @param {boolean} push - Whether to push the state to the history
 */
const closeEntry = (push = true) => {
  if (loading.value) return

  entryOpened.value = false
  if (push) {
    // Push the state to the history
    history.pushState(null, '', '/')
  }

  setTimeout(() => {
    openedId.value = ''
    // Clear highlights
    if (CSS.highlights) {
      window.highlightLetters.clear()
      window.highlightNumbers.clear()
      window.highlightIgnored.clear()
      window.highlightOther.clear()
      window.highlightNotice.clear()
      window.highlightSpecial.clear()
      CSS.highlights.clear()
      CSS.highlights.set('hl-letters', highlightLetters)
      CSS.highlights.set('hl-numbers', highlightNumbers)
      CSS.highlights.set('hl-ignored', highlightIgnored)
      CSS.highlights.set('hl-other', highlightOther)
      CSS.highlights.set('hl-notice', highlightNotice)
      CSS.highlights.set('hl-special', highlightSpecial)
    }
  }, 150)
}

/**
 * Delete the opened entry.
 * It will trigger multiple requests to Todoist. I know it may cause data inconsistency but this is just a demo
 * @param {CryptoKey} key - The key to use for encryption
 */
const deleteOpenedEntry = async (key) => {
  loading.value = true

  const id = openedId.value

  const entry = metaList.value.find((item) => item.id === id)
  const deletedEntries = []

  if (!entry) {
    loading.value = false
    reportError(new Error('Entry not found.'))
    return
  }

  // Delete passwords from Todoist
  const passwords = new Set(entry.fields.filter((item) => item.type === 'password' || item.type === 'card').map((item) => {
    if (item.type === 'card') {
      return item.value[0]
    }
    return item.value
  }))

  for (const password of passwords) {
    const data = await deleteTask(password).catch((e) => {
      reportError(e)
      return false
    })

    if (!data) {
      loading.value = false
      return
    }

    deletedEntries.push(password)
  }

  // Delete entry body from Todoist
  const data = await deleteTask(id).catch((e) => {
    reportError(e)
    return false
  })

  if (!data) {
    loading.value = false
    return
  }

  deletedEntries.push(id)

  metaList.value = metaList.value.filter((item) => item.id !== id)

  // Update meta list on Todoist
  // Encrypt new meta list
  const encryptedMetaList = metaList.value.map((item) => [item.name, item.id])
  const cipher = await passkey.encrypt({
    key,
    plaintext: compressToUint8Array(stringify(encryptedMetaList)),
    label: 'prf-list'
  }).catch((e) => {
    reportError(e)
    return false
  })

  // Update meta list on Todoist
  const resMeta = await update({
    id: rawTaskList.value.find((item) => item.content === 'PRF Metadata').id,
    content: 'PRF Metadata',
    description: `${cipher.iv}|${cipher.ciphertext}`
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!resMeta) {
    loading.value = false
    return
  }

  // Update local
  const rawIndex = rawTaskList.value.findIndex((item) => item.content === 'PRF Metadata')
  if (rawIndex !== -1) {
    rawTaskList.value[rawIndex].description = `${cipher.iv}|${cipher.ciphertext}`
  }

  closeEntry()
  miniSearch.discard(id)

  setTimeout(() => {
    // Remove from local
    rawTaskList.value = rawTaskList.value.filter((item) => !deletedEntries.includes(item.id))
    builtEntriesList.value = builtEntriesList.value.filter((item) => item.id !== id)

    loading.value = false
  }, 200)
}

/**
 * Update the opened entry.
 * It will trigger multiple requests to Todoist. I know it may cause data inconsistency but this is just a demo
 * @param {Object} config
 * @param {Object} config.entry - The entry to update
 * @param {CryptoKey} config.key - The key to use for encryption
 * @param {Object} config.diffFlags - The flags to indicate what has changed
 * @param {boolean} config.diffFlags.pwds - Whether the password fields have changed
 * @param {boolean} config.diffFlags.body - Whether the body has changed
 * @param {boolean} config.diffFlags.name - Whether the name of the entry has changed
 */
const updateOpenedEntry = async ({ entry, key, diffFlags }) => {
  loading.value = true

  const id = openedId.value
  const oldEntry = metaList.value.find((item) => item.id === id)

  // Find the encrypted password entry id
  const oldPasswords = oldEntry.fields.filter((item) => item.type === 'password' || item.type === 'card').map((item) => {
    if (item.type === 'card') {
      return item.value[0]
    }
    return item.value
  })

  let encryptedEntryId = oldPasswords.length > 0 ? oldPasswords[0] : '-1'

  if (diffFlags.pwds) {
    const passwords = entry.fields.filter((item) => item.type === 'password' || item.type === 'card').map((item) => item.value)

    // Encrypt passwords
    const res = await passkey.encrypt({
      key,
      plaintext: compressToUint8Array(stringify(passwords)),
      label: entry.name
    }).catch((e) => {
      reportError(e)
      return false
    })

    // Handle error
    if (!res) {
      loading.value = false
      return
    }

    // Put the encrypted passwords into Todoist
    if (encryptedEntryId === -1) {
      // If the password entry is not found, create a new one
      const data = await add({
        content: res.iv,
        description: res.ciphertext
      }).catch((e) => {
        reportError(e)
        return false
      })

      // Handle error
      if (!data) {
        loading.value = false
        return
      }

      // Save the encrypted password entry id
      encryptedEntryId = data.id

      // Update local
      rawTaskList.value.push(data)
    } else {
      // If the password entry is found, update it
      const data = await update({
        id: encryptedEntryId,
        content: res.iv,
        description: res.ciphertext
      }).catch((e) => {
        reportError(e)
        return false
      })

      // Handle error
      if (!data) {
        loading.value = false
        return
      }

      // Update local
      const rawIndex = rawTaskList.value.findIndex((item) => item.id === encryptedEntryId)
      if (rawIndex !== -1) {
        rawTaskList.value[rawIndex].content = res.iv
        rawTaskList.value[rawIndex].description = res.ciphertext
      }
    }
  }

  const fields = []

  for (const item of entry.fields) {
    if (item.type === 'password') {
      // Replace password with entry id
      item.value = encryptedEntryId
    } else if (item.type === 'card') {
      // Replace card with task id and last 4 digits of the card number
      item.value = [encryptedEntryId, item.value.split(',')[0].slice(-4)]
    }
    fields.push(item)
  }

  if (diffFlags.body) {
    const lastUpdated = Date.now().valueOf()

    // Encrypt the entry body
    const resFields = await passkey.encrypt({
      key,
      plaintext: compressToUint8Array(stringify({
        urls: entry.urls,
        fields,
        lastUpdated
      })),
      label: 'prf-list'
    }).catch((e) => {
      reportError(e)
      return false
    })

    // Handle error
    if (!resFields) {
      loading.value = false
      return
    }

    // Put the encrypted entry body into Todoist
    const dataFields = await update({
      id,
      content: resFields.iv,
      description: resFields.ciphertext
    }).catch((e) => {
      reportError(e)
      return false
    })

    // Handle error
    if (!dataFields) {
      loading.value = false
      return
    }

    // Update local
    const rawIndex = rawTaskList.value.findIndex((item) => item.id === id)
    if (rawIndex !== -1) {
      rawTaskList.value[rawIndex].content = resFields.iv
      rawTaskList.value[rawIndex].description = resFields.ciphertext
    }
    const index = metaList.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      metaList.value[index] = {
        id: metaList.value[index].id,
        fields,
        name: entry.name,
        urls: entry.urls,
        lastUpdated
      }
    }
  }

  if (diffFlags.name) {
    metaList.value.find((item) => item.id === id).name = entry.name

    // Encrypt meta list
    const metaListToEncrypt = metaList.value.map((item) => [item.name, item.id])
    const cipher = await passkey.encrypt({
      key,
      plaintext: compressToUint8Array(stringify(metaListToEncrypt)),
      label: 'prf-list'
    }).catch((e) => {
      reportError(e)
      return false
    })

    if (!cipher) {
      loading.value = false
      return
    }

    // Update meta list on Todoist
    const resMeta = await update({
      id: rawTaskList.value.find((item) => item.content === 'PRF Metadata').id,
      content: 'PRF Metadata',
      description: `${cipher.iv}|${cipher.ciphertext}`
    }).catch((e) => {
      reportError(e)
      return false
    })

    if (!resMeta) {
      loading.value = false
      return
    }

    // Update local
    const rawIndex = rawTaskList.value.findIndex((item) => item.content === 'PRF Metadata')
    if (rawIndex !== -1) {
      rawTaskList.value[rawIndex].description = `${cipher.iv}|${cipher.ciphertext}`
    }
  }

  if (diffFlags.pwds || diffFlags.body || diffFlags.name) {
    const index = builtEntriesList.value.findIndex((item) => item.id === id)

    if (index !== -1) {
      builtEntriesList.value[index] = {
        id: builtEntriesList.value[index].id,
        name: entry.name,
        urls: entry.urls,
        fields,
        _joined_urls: entry.urls.join(' '),
        _searchable_fields: fields.filter((i) => i.type !== 'password' && i.type !== 'card').map((i) => i.value)
      }
    }
    miniSearch.replace(builtEntriesList.value.find((item) => item.id === id))
  }

  entryRef.value.lock()
  loading.value = false
}

/**
 * Add a new entry.
 * It will trigger multiple requests to Todoist. I know it may cause data inconsistency but this is just a demo
 * @param {Object} entry - The entry to add
 */
const addNewEntry = async (entry) => {
  loading.value = true

  // Get the key
  let key = await passkey.getKey({
    keyid: keyid.value,
    firstSalt: firstSalt.value,
  }).catch((e) => {
    reportError(e)
    return false
  })

  // Handle error
  if (!key) {
    loading.value = false
    return false
  }

  const passwords = entry.fields.filter((item) => item.type === 'password' || item.type === 'card').map((item) => item.value)

  let pwdId = -1

  if (passwords.length > 0) {
    // Encrypt passwords
    const res = await passkey.encrypt({
      key,
      plaintext: compressToUint8Array(stringify(passwords)),
      label: entry.name
    }).catch((e) => {
      reportError(e)
      return false
    })

    // Handle error
    if (!res) {
      loading.value = false
      return
    }

    // Put the encrypted passwords into Todoist so we can get the id
    const data = await add({
      content: res.iv,
      description: res.ciphertext
    }).catch((e) => {
      reportError(e)
      return false
    })

    // Handle error
    if (!data) {
      loading.value = false
      return
    }

    // Update local
    rawTaskList.value.push(data)

    pwdId = data.id
  }

  // This array stores the entry body (only fields actually)
  const fields = []

  for (const item of entry.fields) {
    if (item.type === 'password') {
      // Replace password with task id
      item.value = pwdId
    } else if (item.type === 'card') {
      // Replace card with task id and last 4 digits of the card number
      item.value = [pwdId, item.value.split(',')[0].slice(-4)]
    }
    fields.push(item)
  }

  const lastUpdated = Date.now().valueOf()

  // Encrypt the entry body
  const resFields = await passkey.encrypt({
    key,
    plaintext: compressToUint8Array(stringify({
      urls: entry.urls,
      fields,
      lastUpdated
    })),
    label: 'prf-list'
  }).catch((e) => {
    reportError(e)
    return false
  })

  // Handle error
  if (!resFields) {
    loading.value = false
    return
  }

  // Put the encrypted entry body into Todoist so we can get the id
  const dataFields = await add({
    content: resFields.iv,
    description: resFields.ciphertext
  }).catch((e) => {
    reportError(e)
    return false
  })

  // Handle error
  if (!dataFields) {
    loading.value = false
    return
  }

  // Update local
  rawTaskList.value.push(dataFields)

  entry.id = dataFields.id
  entry.fields = fields
  entry.lastUpdated = lastUpdated

  metaList.value.push(entry)

  // Update meta list on Todoist
  const encryptedMetaList = metaList.value.map((item) => [item.name, item.id])
  const cipher = await passkey.encrypt({
    key,
    plaintext: compressToUint8Array(stringify(encryptedMetaList)),
    label: 'prf-list'
  }).catch((e) => {
    reportError(e)
    return false
  })

  const resMeta = await update({
    id: rawTaskList.value.find((item) => item.content === 'PRF Metadata').id,
    content: 'PRF Metadata',
    description: `${cipher.iv}|${cipher.ciphertext}`
  }).catch((e) => {
    reportError(e)
    return false
  })

  if (!resMeta) {
    loading.value = false
    return
  }

  // Update local
  const rawIndex = rawTaskList.value.findIndex((item) => item.content === 'PRF Metadata')
  if (rawIndex !== -1) {
    rawTaskList.value[rawIndex].description = `${cipher.iv}|${cipher.ciphertext}`
  }

  key = undefined

  // Update local
  const builtEntry = {
    id: entry.id,
    name: entry.name,
    urls: entry.urls,
    fields: entry.fields,
    _joined_urls: entry.urls.join(' '),
    _searchable_fields: entry.fields.filter((i) => i.type !== 'password' && i.type !== 'card').map((i) => i.value)
  }
  builtEntriesList.value.push(builtEntry)
  miniSearch.add(builtEntry)

  addingEntry.value = false
  closeEntry()
  setTimeout(() => {
    openEntry(entry.id)
    loading.value = false
  }, 300)
}

/**
 * Handle window path
 */
const handlePath = () => {
  if (logedin.value) {
    if (window.location.pathname === '/') {
      // Home view
      if (entryOpened.value) {
        if (loading.value) {
          history.pushState(null, '', `/entry/${openedId.value}`)
        } else {
          closeEntry(false)
        }
      }
    } else if (window.location.pathname.startsWith('/entry/')) {
      if (window.location.pathname === '/entry/new') {
        openAddNewEntry()
      } else {
        // Entry view
        const id = window.location.pathname.split('/').pop()
        if (metaList.value.find((item) => item.id === id)) {
        openEntry(id, false)
      } else {
          history.replaceState(null, '', '/')
        }
      }
    }
  } else {
    // Not logged in
    if (window.location.pathname === '/') {
      configStep.value = 5
    } else if (window.location.pathname === '/setup') {
      setUp(false, false)
    } else {
      history.replaceState(null, '', '/')
    }
  }
}

onMounted(() => {
  // Check if the device is new
  if (localStorage.getItem('prf_config')) {
    newDevice.value = false

    // Try auto login
    if (localStorage.getItem('prf_skip_auto_login')) {
      localStorage.removeItem('prf_skip_auto_login')
    } else {
      const config = JSON.parse(localStorage.getItem('prf_config'))
      firstSalt.value = Uint8Array.from(window.atob(config.salt), c => c.charCodeAt(0))
      keyid.value = config.id ? Uint8Array.from(window.atob(config.id.replace(/\-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)) : false

      // Try login when the page is loaded
      handleLogin(true)
    }
  } else {
    newDevice.value = true
  }

  // Handle the path change
  window.addEventListener('popstate', handlePath)
  handlePath()
})

onBeforeUnmount(() => {
  // Remove the path change listener
  window.removeEventListener('popstate', handlePath)
})
</script>
