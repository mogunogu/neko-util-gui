import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron'
import { initialize, enable } from '@electron/remote/main'
import path from 'path'
import os from 'os'
import storage from 'electron-json-storage'
import * as fs from 'fs/promises'
const luabundle = require('lua-bundler')
const chokidar = require('chokidar')

initialize()
storage.setDataPath(os.tmpdir())

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  enable(mainWindow.webContents)

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('selectDir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result
})

ipcMain.handle('savePath', (e, data) => {
  console.log(data)
  return new Promise((resolve, reject) => {
    storage.set('pathData', data, (error) => {
      if (error) {
        return resolve(false)
      }
      return resolve(true)
    })
  })
})

ipcMain.handle('loadPath', (e) => {
  return new Promise((resolve, reject) => {
    storage.get('pathData', (error, data) => {
      if (error) {
        return resolve(false)
      }
      return resolve(data)
    })
  })
})

ipcMain.handle('validateProjPath', async (e, projPath) => {
  const stat = await fs.stat(projPath)
  console.log(stat)
})

const build = (e, pathData) => {
  luabundle.toFile(
    path.join(pathData.serverSrc, 'index.lua'),
    path.join(pathData.projectPath, 'ServerScripts', pathData.serverOutputFileName),
    null,
    (params) => {
      e.sender.send('bundlerLog', {
        type: 'server',
        level: params.shift(),
        msg: params.join()
      })
    })
  luabundle.toFile(
    path.join(pathData.clientSrc, 'index.lua'),
    path.join(pathData.projectPath, 'Scripts', pathData.clientOutputFileName),
    null,
    (params) => {
      e.sender.send('bundlerLog', {
        type: 'client',
        level: params.shift(),
        msg: params.join()
      })
    })
}

let watchMode = false
let watcher

const watch = (e, pathData) => {
  if (watchMode) return
  watchMode = true
  watcher = chokidar.watch(pathData.serverSrc, { ignoreInitial: true })
  watcher.add(pathData.clientSrc)
  const changed = []
  const check = (path) => {
    if (!changed.includes(path)) {
      changed.push(path)
    }
    return changed.length
  }

  watcher
    .on('ready', () => {
      e.sender.send('bundlerLog', {
        type: 'all',
        level: 1,
        msg: '실시간 감시모드를 시작합니다. . '
      })
    })
    .on('all', (_, path) => {
      const changed = check(path)
      e.sender.send('bundlerLog', {
        type: 'all',
        level: 1,
        msg: `현재까지 변경된 파일 : ${changed}개. 실시간 감시모드 실행중`
      })
    })
    .on('add', (path, stats) => {
      build(e, pathData)
      e.sender.send('bundlerLog', {
        type: 'all',
        level: 1,
        msg: `파일변경을 감지했습니다 (추가) - ${path} - ${stats.size} byte`
      })
    })
    .on('change', (path, stats) => {
      build(e, pathData)
      e.sender.send('bundlerLog', {
        type: 'all',
        level: 1,
        msg: `파일변경을 감지했습니다 (갱신) - ${path} - ${stats.size} byte`
      })
    })
    .on('unlink', path => {
      build(e, pathData)
      e.sender.send('bundlerLog', {
        type: 'all',
        level: 1,
        msg: `파일변경을 감지했습니다 (삭제) - ${path} byte`
      })
    })
}

const closeWatch = (e) => {
  watcher.close().then(() => {
    e.sender.send('bundlerLog', {
      type: 'all',
      level: 1,
      msg: `파일변경을 감지했습니다 (삭제) - ${path} byte`
    })
    watcher = null
  })
}

ipcMain.handle('bundleOnce', async (e, pathData) => {
  build(e, pathData)
})

ipcMain.handle('bundleWatch', async (e, pathData) => {
  watch(e, pathData)
})

ipcMain.handle('closeWatch', async (e) => {
  closeWatch(e)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
