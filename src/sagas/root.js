import { fork, takeLeading } from 'redux-saga/effects'
import {
  AUTHORIZE,
  SYNC,
  SYNC_CANCEL,
  CREATE_PLAYLIST,
  CREATE_PLAYLIST_CANCEL,
} from 'state/actions'
import { takeLeadingCancellable } from './helpers'
import { authorizeSaga } from './auth'
import { syncSaga } from './sync'
import { createPlaylistSaga } from './playlist'
import { backgroundSyncSaga } from './automation'

/**
 * Root saga
 */
export function* rootSaga() {
  yield takeLeading(AUTHORIZE, authorizeSaga)
  yield takeLeadingCancellable(SYNC, SYNC_CANCEL, syncSaga)
  yield takeLeadingCancellable(CREATE_PLAYLIST, CREATE_PLAYLIST_CANCEL, createPlaylistSaga)
  yield fork(backgroundSyncSaga)
}

export default rootSaga
