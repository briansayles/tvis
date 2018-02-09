import React from 'react'
import { View } from 'react-native'
import { AdMobBanner, AdMobInterstitial, PublisherBanner, AdMobRewarded } from 'expo'
import dict from '../constants/Dictionary'

export class BannerAd extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
			<View style={{backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 5, marginTop: 2}}>
				<AdMobBanner
					style={{flex: -1, backgroundColor: 'transparent'}}
		    	bannerSize='smartBannerPortrait'
		    	adUnitID={dict.BANNER_ID} // banner1
		    	testDeviceID='EMULATOR'
		    	didFailToReceiveAdWithError={this.bannerError}
		  	/>
			</View>
    )
  }
}