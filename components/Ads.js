import React from 'react'
import { View, Dimensions, } from 'react-native'
// import { PublisherBanner } from 'expo'
import { AdMobBanner, AdMobInterstitial, AdMobRewarded} from 'expo-ads-admob'
import dict from '../constants/Dictionary'

export class BannerAd extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      orientation: this._isPortrait() ? 'portrait' : 'landscape',
		}
    Dimensions.addEventListener('change', this._handleOrientationChange)
  }

  _handleOrientationChange = () => {
    this.setState({
      orientation: this._isPortrait() ? 'portrait' : 'landscape'
    })
  }

  _isPortrait = () => {
    const dim = Dimensions.get('screen')
    return dim.height >= dim.width
  }

  componentWillUnmount () {
    Dimensions.removeEventListener('change', this._handleOrientationChange)
  }


  render() {
    return (
			<View style={{backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', }}>
				<AdMobBanner
          style={{flex: -1, backgroundColor: 'transparent'}}
		    	bannerSize={this.state.orientation == 'landscape' ? 'smartBannerLandscape' : 'smartBannerPortrait'}
		    	adUnitID={dict.BANNER_ID} // banner1
		    	// testDeviceID='EMULATOR'
		    	didFailToReceiveAdWithError={this.bannerError}
		  	/>
			</View>
    )
  }
}