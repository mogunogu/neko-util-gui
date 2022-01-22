<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-bar class="q-electron-drag">
        <q-icon name="laptop_chromebook" />
        <div>네코랜드 유틸</div>

        <q-space />

        <q-btn dense flat icon="minimize" @click="minimize" />
        <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
        <q-btn dense flat icon="close" @click="closeApp" />
      </q-bar>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ title }}</q-toolbar-title>

        <div>v0.01</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Essential Links</q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view @page-mounted="pageMounted" />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: '홈',
    caption: '홈',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  }
]

import { defineComponent, ref, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const store = useStore()
    const leftDrawerOpen = ref(false)
    const title = ref('루아 번들러')
    console.log(store.state.glob)

    function minimize () {
      if (process.env.MODE === 'electron') {
        window.myWindowAPI.minimize()
      }
    }

    function toggleMaximize () {
      if (process.env.MODE === 'electron') {
        window.myWindowAPI.toggleMaximize()
      }
    }

    function closeApp () {
      if (process.env.MODE === 'electron') {
        window.myWindowAPI.close()
      }
    }
    const pageMounted = (newTitle) => {
      title.value = newTitle
    }

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      pageMounted,
      title,
      minimize,
      toggleMaximize,
      closeApp,
      isShowSideLog: computed(() => store.state.glob.isShowSideLog),
      bundleLogs: computed(() => store.state.glob.bundleLogs)
    }
  }
})
</script>
