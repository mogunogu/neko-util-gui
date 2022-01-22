<template>
  <q-page>
    <div class="q-pa-lg">
      <div class="row">
        <div class="col-12">
          <q-form class="q-gutter-lg">
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
          <q-btn color="secondary" class="full-width" label=" 경로 저장" @click="savePath" />
        </div>
        <div class="col q-ma-sm">
          <q-btn color="primary" class="full-width" label="1회실행" @click="bundleOnce" />
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
            @update:model-value="changeWatchMode"
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
import { useQuasar } from 'quasar'
import { defineComponent, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

const _STATUS_VALIANTS = {
  1: 'success',
  2: 'warning',
  3: 'negative'
}
const _LOG_TYPE_LABELS = {
  server: '[서버 스크립트]',
  client: '[클라이언트 스크립트]'

}

export default defineComponent({
  name: 'PageIndex',
  emits: ['page-mounted'],
  setup (props, context) {
    const store = useStore()
    const $q = useQuasar()
    const projectPath = ref('')
    const serverSrc = ref('')
    const clientSrc = ref('')
    const clientOutputFileName = ref('__bundle.lua')
    const serverOutputFileName = ref('__bundle.lua')

    const watchMode = ref(false)

    onMounted(async () => {
      const pathData = await window.mainAPI.loadPath()
      projectPath.value = pathData.projectPath
      serverSrc.value = pathData.serverSrc
      clientSrc.value = pathData.clientSrc
      window.mainAPI.bundlerLog((log) => {
        if (log.level === 3) {
          $q.notify({
            message: _LOG_TYPE_LABELS[log.type] + ' 에러가 발생했습니다.',
            color: _STATUS_VALIANTS[log.level],
            multiLine: true,
            actions: [
              { label: '로그확인', color: 'yellow', handler: () => { /* ... */ } }
            ]
          })
        }
        if (log.level === 1) {
          $q.notify({
            message: _LOG_TYPE_LABELS[log.type] + log.msg,
            color: _STATUS_VALIANTS[log.level],
            multiLine: true,
            actions: [
              { label: '로그확인', color: 'yellow', handler: () => { /* ... */ } }
            ]
          })
        }
        store.commit('addBundleLog', {
          type: log.type,
          level: log.level,
          msg: log.msg
        })
      })
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

    const savePath = () => {
      window.mainAPI.savePath({
        projectPath: projectPath.value,
        serverSrc: serverSrc.value,
        clientSrc: clientSrc.value
      }).then(res => {
        if (res) {
          alert('success')
        }
      })
    }
    const bundleOnce = () => {
      store.commit('setIsShowSideLog', true)
      window.mainAPI.bundleOnce({
        projectPath: projectPath.value,
        serverSrc: serverSrc.value,
        clientSrc: clientSrc.value,
        clientOutputFileName: clientOutputFileName.value,
        serverOutputFileName: serverOutputFileName.value
      }).then(res => {
        $q.notify({
          message: '빌드완료.',
          color: 'primary',
          multiLine: true,
          actions: [
            { label: '로그확인', color: 'yellow', handler: () => { /* ... */ } }
          ]
        })
      })
    }

    const changeWatchMode = (isWatchMode) => {
      if (isWatchMode) {
        window.mainAPI.bundleWatch({
          projectPath: projectPath.value,
          serverSrc: serverSrc.value,
          clientSrc: clientSrc.value,
          clientOutputFileName: clientOutputFileName.value,
          serverOutputFileName: serverOutputFileName.value
        })
      } else {
        window.mainAPI.closeWatch().then(() => {
          $q.notify({
            message: '감시모드 정지',
            color: 'warning',
            multiLine: true,
            actions: [
              { label: '로그확인', color: 'yellow', handler: () => { /* ... */ } }
            ]
          })
        })
      }
    }
    return {
      // data
      projectPath,
      serverSrc,
      clientSrc,
      clientOutputFileName,
      serverOutputFileName,
      selectProjPath,
      selectServerSrc,
      selectClientSrc,
      watchMode,
      // methods
      savePath,
      bundleOnce,
      changeWatchMode
      // computed
    }
  }
})
</script>
