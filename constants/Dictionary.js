const tintColor = '#009900';

export default {
  BANNER_ID: 'ca-app-pub-3013833975597353/8848678187', // TEST ID: ca-app-pub-3940256099942544/6300978111, ACTUAL ID: ca-app-pub-3013833975597353/8848678187
	REWARDED_ID: 'ca-app-pub-3013833975597353/5103764479', // TEST ID: ca-app-pub-3940256099942544/1712485313, ACTUAL ID: ca-app-pub-3013833975597353/5103764479
	INTERSTITIAL_ID: 'ca-app-pub-3013833975597353/7633439481', // TEST ID: ca-app-pub-3940256099942544/1033173712, ACTUAL ID: ca-app-pub-3013833975597353/7633439481
	REVMOB_ID: '5a5ca4b4a30c3b1c882dfe7b',
	GameOptions: [
		{longName: "No Limit Hold'Em", shortName: "NLHE"},
		{longName: "Pot Limit Omaha", shortName: "PLO"},
		{longName: "Limit Hold'Em", shortName: "LHE"},
		{longName: "Limit 7 Card Stud", shortName: "L7S"},
		{longName: "H.O.R.S.E.", shortName: "HORSE"},
		{longName: "H.O.S.E.", shortName: "HOSE"},
		{longName: "Cold Capping", shortName: "CAP"}
	],
	EntryFeeOptions: [
		{longName: "Standard Buy-In", shortName: "Buyin"},
		{longName: "Re-Buy", shortName: "Rebuy"},
		{longName: "Add-On", shortName: "Addon"},
		{longName: "Bounty", shortName: "Bounty"},
		{longName: "House Fee", shortName: "House"},
		{longName: "Charity Fee", shortName: "Charity"}
	],
	ChipColorOptions: [
		{longName: "White", shortName: "#fff"},
		{longName: "Red", shortName: "#f00"},
		{longName: "Green", shortName: "#0f0"},
		{longName: "Blue", shortName: "#00f"},
		{longName: "Black", shortName: "#000"},
		{longName: "Orange", shortName: "#f90"},
		{longName: "Purple", shortName: "#808"},
		{longName: "Grey", shortName: "#888"},
		{longName: "Yellow", shortName: "#ff0"},
		{longName: "Light Blue", shortName: "#cff"}
	],
	DurationOptions: [
		{longName: "1 min.", shortName: "1"},
		{longName: "2 min.", shortName: "2"},
		{longName: "5 min.", shortName: "5"},
		{longName: "10 min.", shortName: "10"},
		{longName: "12 min.", shortName: "12"},
		{longName: "15 min.", shortName: "15"},
		{longName: "20 min.", shortName: "20"},
		{longName: "25 min.", shortName: "25"},
		{longName: "30 min.", shortName: "30"},
		{longName: "40 min.", shortName: "40"},
		{longName: "45 min.", shortName: "45"},
		{longName: "60 min.", shortName: "60"}
	],
	tintColor,
	tabIconDefault: '#888',
	tabIconSelected: tintColor,
	tabBar: '#fefefe',
	errorBackground: 'red',
	errorText: '#fff',
	warningBackground: '#EAEB5E',
	warningText: '#666804',
	noticeBackground: tintColor,
	noticeText: '#fff',
	editButtonColor: '#0498',
}