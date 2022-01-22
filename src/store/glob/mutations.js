
export function someMutation (/* state */) {
}

export const setIsShowSideLog = (state, isShowSideLog) => {
  state.isShowSideLog = isShowSideLog
}

export const addBundleLog = (state, bundleLog) => {
  state.bundleLogs.push(bundleLog)
}
