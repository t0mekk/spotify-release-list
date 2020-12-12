import { useSelector, useDispatch } from 'react-redux'
import { Market } from 'enums'
import { getSettingsMarket } from 'state/selectors'
import { setSettings } from 'state/actions'
import { defer } from 'helpers'
import { Select } from 'components/common'

/** @type {SelectOptions} */
const options = [['', 'Use account country (default)'], ...Object.entries(Market)]

/**
 * Render market selection field
 */
function MarketField() {
  const market = useSelector(getSettingsMarket)
  const dispatch = useDispatch()

  return (
    <div className="field">
      <label className="label has-text-light" htmlFor="market">
        Market
      </label>
      <Select
        id="market"
        icon="fas fa-globe"
        defaultValue={market}
        onChange={(event) => defer(dispatch, setSettings({ market: event.target.value }))}
        options={options}
      />
    </div>
  )
}

export default MarketField
