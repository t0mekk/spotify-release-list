import { all, call, put, select } from 'redux-saga/effects'
import { chunks, spotifyUri } from 'helpers'
import { Scope, SpotifyEntity } from 'enums'
import { getAlbumsTrackIds, createPlaylist, addTracksToPlaylist } from 'api'
import { AuthError } from 'auth'
import {
  getAuthData,
  getPlaylistForm,
  getReleasesEntries,
  getSettings,
  getUser,
} from 'state/selectors'
import {
  createPlaylistStart,
  createPlaylistFinished,
  createPlaylistError,
  showErrorMessage,
} from 'state/actions'
import { authorize } from './auth'
import { withTitle } from './helpers'

const { USER_FOLLOW_READ, PLAYLIST_MODIFY_PRIVATE, PLAYLIST_MODIFY_PUBLIC } = Scope
const { TRACK } = SpotifyEntity

/**
 * Playlist creation saga
 *
 * @param {CreatePlaylistAction} action
 */
export function* createPlaylistSaga(action) {
  try {
    /** @type {ReturnType<getPlaylistForm>} */
    const { isPrivate } = yield select(getPlaylistForm)
    const scopes = [USER_FOLLOW_READ, isPrivate ? PLAYLIST_MODIFY_PRIVATE : PLAYLIST_MODIFY_PUBLIC]
    const titled = yield call(withTitle, 'Creating playlist...', createPlaylistMainSaga)
    const authorized = yield call(authorize, action, scopes, titled)

    yield call(authorized)
  } catch (error) {
    yield put(showErrorMessage(error instanceof AuthError ? error.message : undefined))
    yield put(createPlaylistError())
  }
}

/**
 * Playlist creation main saga
 */
function* createPlaylistMainSaga() {
  yield put(createPlaylistStart())

  /** @type {ReturnType<getAuthData>} */
  const { token } = yield select(getAuthData)
  /** @type {ReturnType<getUser>} */
  const user = yield select(getUser)
  /** @type {ReturnType<getPlaylistForm>} */
  const { name, description, isPrivate } = yield select(getPlaylistForm)
  /** @type {ReturnType<getSettings>} */
  const { market } = yield select(getSettings)
  /** @type {ReturnType<getReleasesEntries>} */
  const releases = yield select(getReleasesEntries)

  const albumIds = releases.reduce(
    (ids, [, albums]) => [...ids, ...albums.map((album) => album.id)],
    /** @type {string[]} */ ([])
  )

  const trackIdsCalls = chunks(albumIds, 20).map((albumIdsChunk) =>
    call(getAlbumsTrackIds, token, albumIdsChunk, market)
  )

  /** @type {Await<ReturnType<getAlbumsTrackIds>>[]} */
  const trackIds = yield all(trackIdsCalls)
  const trackUris = trackIds.flat().map((trackId) => spotifyUri(trackId, TRACK))
  /** @type {SpotifyPlaylist} */
  let firstPlaylist

  for (const [part, playlistTrackUrisChunk] of chunks(trackUris, 9500).entries()) {
    const fullName = part > 0 ? `${name} (${part + 1})` : name
    /** @type {Await<ReturnType<createPlaylist>>} */
    const playlist = yield call(createPlaylist, token, user.id, fullName, description, isPrivate)

    if (!firstPlaylist) {
      firstPlaylist = playlist
    }

    for (const trackUrisChunk of chunks(playlistTrackUrisChunk, 100)) {
      yield call(addTracksToPlaylist, token, playlist.id, trackUrisChunk)
    }
  }

  yield put(createPlaylistFinished(firstPlaylist.id))
}
