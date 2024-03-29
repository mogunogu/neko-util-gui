/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import { contextBridge, ipcRenderer } from 'electron'
import { BrowserWindow } from '@electron/remote'

contextBridge.exposeInMainWorld('myWindowAPI', {
  minimize () {
    BrowserWindow.getFocusedWindow().minimize()
  },

  toggleMaximize () {
    const win = BrowserWindow.getFocusedWindow()

    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  },

  close () {
    BrowserWindow.getFocusedWindow().close()
  }
})

contextBridge.exposeInMainWorld('mainAPI', {
  selectDir: () => ipcRenderer.invoke('selectDir'),
  savePath: (pathData) => ipcRenderer.invoke('savePath', pathData),
  loadPath: () => ipcRenderer.invoke('loadPath'),
  bundleOnce: (pathData) => ipcRenderer.invoke('bundleOnce', pathData),
  bundleWatch: (pathData) => ipcRenderer.invoke('bundleWatch', pathData),
  closeWatch: () => ipcRenderer.invoke('bundleWatch'),
  validateProjPath: (projPath) => ipcRenderer.invoke('validateProjPath', projPath),
  bundlerLog: (listener) => {
    ipcRenderer.on('bundlerLog', (event, arg) => listener(arg))
  }
})
