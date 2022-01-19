<template>
  <q-page>
    <div class="q-pa-lg">
      <div class="row">
        <div class="col-12">
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-lg">
            <q-input
              filled
              v-model="projectPath"
              label="프로젝트 경로"
              hint="네코랜드 게임 프로젝트 경로를 지정해주세요"
              lazy-rules
              :rules="[val => val && val.length > 0 || '프로젝트 경로를 입력해주세요']"
            >
              <template v-slot:before>
                <q-btn flat dense round icon="folder_open" @click="selectProjPath"></q-btn>
              </template>
              <template v-slot:append>
                <q-btn icon="search" @click="selectProjPath">경로찾기</q-btn>
              </template>
            </q-input>
            <q-input
              filled
              v-model="serverSrc"
              label="서버소스 경로"
              hint="서버스크립트 소스 경로를 지정해주세요"
              lazy-rules
              :rules="[val => val && val.length > 0 || '서버스크립트 소스 경로를 입력해주세요']"
            >
              <template v-slot:before>
                <q-btn flat dense round icon="folder_open" @click="selectServerSrc"></q-btn>
              </template>
              <template v-slot:append>
                <q-btn icon="search" @click="selectServerSrc">경로찾기</q-btn>
              </template>
            </q-input>
            <q-input
              filled
              v-model="clientSrc"
              label="클라소스 경로"
              hint="클라이언트 소스 경로를 지정해주세요"
              lazy-rules
              :rules="[val => val && val.length > 0 || '클라이언트 소스 경로를 입력해주세요']"
            >
              <template v-slot:before>
                <q-btn flat dense round icon="folder_open" @click="selectClientSrc"></q-btn>
              </template>
              <template v-slot:append>
                <q-btn icon="search" @click="selectClientSrc">경로찾기</q-btn>
              </template>
            </q-input>
          </q-form>
        </div>
      </div>
      <div class="row q-mt-md q-pa-md">
        <div class="col q-ma-sm">
          <q-input
            filled
            v-model="serverOutputFileName"
            label="서버 출력파일명"
            hint=" 서버 출력파일명을 지정해주세요"
            lazy-rules
            :rules="[
              val => val && val.length > 0 || '서버스크립트 출력 파일명을 지정해주세요',
              val => val && /([a-zA-Z0-9\s_\\.\-\(\):])+(.lua|.txt)$/.test(val) || '파일명의 확장자는 .lua .txt로 지정해주세요',
            ]"
          ></q-input>
        </div>
        <div class="col q-ma-sm">
          <q-input
            filled
            v-model="clientOutputFileName"
            label="클라 출력파일명"
            hint=" 클라 출력파일명을 지정해주세요"
            lazy-rules
            :rules="[
              val => val && val.length > 0 || '클라이언트 스크립트 출력 파일명을 지정해주세요',
              val => val && /([a-zA-Z0-9\s_\\.\-\(\):])+(.lua|.txt)$/.test(val) || '파일명의 확장자는 .lua .txt로 지정해주세요',
            ]"
          ></q-input>
        </div>
      </div>
      <div class="row q-mt-md q-pa-md">
        <div class="col q-ma-sm">
          <q-btn color="secondary" class="full-width" label=" 경로 저장" />
        </div>
        <div class="col q-ma-sm">
          <q-btn color="primary" class="full-width" label="1회실행" />
        </div>
        <div class="col-12 q-ma-sm">
          <q-btn-toggle
            v-model="watchMode"
            spread
            no-caps
            toggle-color="purple"
            color="white"
            text-color="black"
            :options="[
              { label: '감시모드 off', value: false },
              { label: '감시모드 on', value: true, slot: 'on' }
            ]"
          >
            <template v-slot:on>
              <q-circular-progress
                indeterminate
                size="15px"
                color="black"
                class="q-ml-sm"
                v-if="watchMode"
              />
            </template>
          </q-btn-toggle>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  emits: ['page-mounted'],
  setup (props, context) {
    const projectPath = ref('')
    const serverSrc = ref('')
    const clientSrc = ref('')
    const clientOutputFileName = ref('__bundle.lua')
    const serverOutputFileName = ref('__bundle.lua')

    const watchMode = ref(false)

    onMounted(() => {
      context.emit('page-mounted', '번들러')
    })

    const selectProjPath = async () => {
      const pathData = await window.mainAPI.selectDir()
      if (pathData && pathData.canceled) {
        return
      }
      projectPath.value = pathData.filePaths[0]
    }
    const selectServerSrc = async () => {
      const pathData = await window.mainAPI.selectDir()
      if (pathData && pathData.canceled) {
        return
      }
      serverSrc.value = pathData.filePaths[0]
    }
    const selectClientSrc = async () => {
      const pathData = await window.mainAPI.selectDir()
      if (pathData && pathData.canceled) {
        return
      }
      clientSrc.value = pathData.filePaths[0]
    }

    return {
      projectPath,
      serverSrc,
      clientSrc,
      clientOutputFileName,
      serverOutputFileName,
      selectProjPath,
      selectServerSrc,
      selectClientSrc,
      watchMode
    }
  }
})
</script>
