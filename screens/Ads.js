import React from 'react'
import { View } from 'react-native'
import { AdMobBanner, AdMobInterstitial, PublisherBanner, AdMobRewarded } from 'expo'

export class BannerAd extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
			<View style={{backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 5, marginTop: 5}}>
				<AdMobBanner
					style={{flex: -1, backgroundColor: 'transparent'}}
		    	bannerSize='smartBannerPortrait'
		    	adUnitID='ca-app-pub-3013833975597353/8848678187' // banner1
		    	testDeviceID='EMULATOR'
		    	didFailToReceiveAdWithError={this.bannerError}
		  	/>
			</View>
    )
  }
}