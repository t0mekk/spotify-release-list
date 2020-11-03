import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Media from 'react-media'
import { useHotkeys } from 'react-hotkeys-hook'
import { getLastSyncDate, getHasReleases, getSyncing } from 'state/selectors'
import { showSettingsModal, showPlaylistModal } from 'state/actions'
import SyncButton from '../SyncButton'
import { useLastSync } from './hooks'

/**
 * Render header
 */
function Header() {
  const dispatch = useDispatch()
  const syncing = useSelector(getSyncing)
  const lastSyncDate = useSelector(getLastSyncDate)
  const hasReleases = useSelector(getHasReleases)
  const lastSync = useLastSync(lastSyncDate)

  const openPlaylistModal = () => {
    dispatch(showPlaylistModal())
  }
  const openSettingsModal = () => {
    dispatch(showSettingsModal())
  }

  useHotkeys('e', openPlaylistModal)
  useHotkeys('s', openSettingsModal)

  return (
    <nav className="Navbar">
      <div className="title is-4 has-text-light">
        Spotify <Media query={{ maxWidth: 375 }}>{(matches) => matches && <br />}</Media>
        Release List
      </div>
      {lastSyncDate && (
        <div className="sync">
          <SyncButton title="Refresh" icon="fas fa-sync" />
          {!syncing && <div className="last-update has-text-grey">Updated {lastSync}</div>}
        </div>
      )}
      <div className="right">
        {lastSyncDate && hasReleases && !syncing && (
          <button
            title="Export to a new playlist [E]"
            className="button is-rounded is-dark has-text-weight-semibold"
            onClick={openPlaylistModal}
          >
            <span className="icon">
              <i className="fas fa-arrow-up" />
            </span>
            <Media query={{ minWidth: 769 }}>{(matches) => matches && <span>Export</span>}</Media>
          </button>
        )}

        <button
          title="Settings [S]"
          className="button is-rounded is-dark has-text-weight-semibold"
          onClick={openSettingsModal}
          disabled={syncing}
        >
          <span className="icon">
            <i className="fas fa-cog" />
          </span>
          <Media query={{ minWidth: 769 }}>{(matches) => matches && <span>Settings</span>}</Media>
        </button>
      </div>
    </nav>
  )
}

export default Header
