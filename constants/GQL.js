import gql from 'graphql-tag' //To be removed with v3 upgrade
// import gql from '@apollo/client'

export const getServerTimeMutation = gql`
  mutation updateTime ($id: ID! $lastRequestedAt: DateTime!) {
    updateTime(id: $id, lastRequestedAt: $lastRequestedAt) {
      updatedAt
    }
  }
`

export const currentUserQuery = gql`
  query currentUser {
    user {
      id
      name
      credits
    }
  }
`

export const createUserMutation = gql`
  mutation createUser($encodedToken: String!, $username: String!) {
    createUser(
      authProvider: {
        auth0: {
          idToken: $encodedToken
        }
      }
      name: $username
    )
    {
      id
      name
    }
  }
`

export const createContactMutation = gql`
  mutation createContact($userId: ID!, $name: String!) {
    createContact(
      userId: $userId
      name: $name
    )
    {
      id
    }
  }
`

export const getUserContactsQuery = gql`
  query currentUserContacts {
    user {
      id
      name
      contacts {
        id
        name
        phone
        email
      }
    }
  }
`

export const addCreditsMutation = gql`
  mutation updateUserMutation($userId: ID!, $amount: Int!) {
    updateUser(id: $userId, credits: $amount) { id }
  }
`

export const TournamentFragments =
{
  overview: gql`
    fragment TournamentOverviewPayload on Tournament {
      id
      title
      subtitle
      updatedAt
      childrenUpdatedAt
      comments
      game
      timer {
        id
        active
      }
    }
  `,
  segment: gql`
    fragment SegmentPayload on Segment {
      id
      duration
      sBlind
      bBlind
      ante
      game
    }
  `,
  chip: gql`
    fragment ChipPayload on Chip {
      id
      denom
      color
      rimColor
      textColor
      qtyAvailable
    }
  `,
  cost: gql`
    fragment CostPayload on Cost {
      id
      costType
      price
      chipStack
      buys {
        player {
          id
        } 
      }
      _buysMeta {
        count
      }
    }
  `
}

export const currentUserTournamentsQuery = gql`
  query currentUserTournaments {
    user 
    {
      id
      name
      tournaments {...TournamentOverviewPayload}
    }
  }
  ${TournamentFragments.overview}
`

export const allTournamentsQuery = gql`
  query allTournaments {
    allTournaments (
      orderBy: updatedAt_DESC,
    )
    {...TournamentOverviewParts}
  }
`

export const getTournamentQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      ...TournamentOverviewPayload
      timer {
        id
        active
        createdAt
        updatedAt
        elapsed
        oneMinuteRemainingSpeech
        playOneMinuteRemainingSound
        endOfRoundSpeech
        playEndOfRoundSound
        backgroundColor
      }
      costs (orderBy: chipStack_DESC) {
        ...CostPayload
      }
      payoutLevels (orderBy: levelNumber_ASC) {
        id
        levelNumber
        payCount
        playerCount
      }
      _payoutLevelsMeta {
        count
      }
      segments (orderBy: bBlind_ASC) {
        ...SegmentPayload
      } 
      chips (orderBy: denom_ASC) {
        ...ChipPayload
      }
      tags (orderBy: name_ASC) {
        id
        name
      }
      user {
        id
        name
      }
    }
  }
  ${TournamentFragments.segment}
  ${TournamentFragments.overview}
  ${TournamentFragments.chip}
  ${TournamentFragments.cost}
`

export const createTournamentFromExistingTournamentMutation = gql`
  mutation createTournament($userId: ID!, $title: String, $subtitle: String, $comments: String, $game: Game, $costs: [TournamentcostsCost!], $chips: [TournamentchipsChip!], $segments: [TournamentsegmentsSegment!] ) {
    createTournament (
      userId: $userId
      title: $title
      subtitle: $subtitle
      comments: $comments
      game: $game
      costs: $costs
      segments: $segments
      chips: $chips
      timer: {
        active: false
        elapsed: 0
      }
   )
    {...TournamentOverviewPayload}
  }
  ${TournamentFragments.overview}
`
export const createTournamentMutation = gql`
  mutation createTournament( $userId: ID!, $title: String="Default Tournament", $duration: Int=20) {
    createTournament (
      userId: $userId
      title: $title
      subtitle: "No limit hold'em Tournament"
      game: NLHE
      costs: [
        {
          price: 20
          chipStack: 1000
          costType: Buyin
        }
        {
          price: 20
          chipStack: 1000
          costType: Rebuy
        }
      ]
      timer: {
        active: false
        elapsed: 0
      }
      segments: [
        {
          sBlind:1
          bBlind:2
          duration: $duration
        }
        {
          sBlind:2
          bBlind:4
          duration: $duration
        }
        {
          sBlind:3
          bBlind:6
          duration: $duration
        }
        {
          sBlind:5
          bBlind:10
          duration: $duration
        }
        {
          sBlind:10
          bBlind:20
          duration: $duration
        }
        {
          sBlind:15
          bBlind:30
          duration: $duration
        }
        {
          sBlind:20
          bBlind:40
          duration:$duration
        }      
        {
          sBlind:25
          bBlind:50
          duration:$duration
        }      
        {
          sBlind:30
          bBlind:60
          duration:$duration
        }      
        {
          sBlind:40
          bBlind:80
          duration:$duration
        }      
        {
          sBlind:50
          bBlind:100
          duration:$duration
        }      
        {
          sBlind:60
          bBlind:120
          duration: $duration
        }
        {
          sBlind:75
          bBlind:150
          duration:$duration
        }
        {
          sBlind:100
          bBlind:200
          duration: $duration
        }
        {
          sBlind:150
          bBlind:300
          duration: $duration
        }
        {
          sBlind:200
          bBlind:400
          duration: $duration
        }
        {
          sBlind:250
          bBlind:500
          duration: $duration
        }
        {
          sBlind:300
          bBlind:600
          duration: $duration
        }
        {
          sBlind:400
          bBlind:800
          duration: $duration
        }
        {
          sBlind:500
          bBlind:1000
          duration: $duration
        }
      ]
      chips: [
        {
          color:"#fff"
          denom:1
        }
        {
          color:"#f00"
          denom:5
        }
        {
          color:"#0f0"
          denom:25
        }
        {
          color:"#000"
          denom:100
        }
        {
          color:"#808"
          denom:500
        }
      ]
    )
    {...TournamentOverviewPayload}
  }
  ${TournamentFragments.overview}
`

export const updateTournamentMutation = gql`
  mutation updateTournament ($id: ID!, $title: String, $subtitle: String, $comments: String, $game: Game) {
    updateTournament(
      id: $id, title: $title, subtitle: $subtitle, comments: $comments, game: $game
    ) 
    {...TournamentOverviewPayload}
  }
  ${TournamentFragments.overview}
`
export const deleteTournamentMutation = gql`mutation deleteTournament($id: ID!) {deleteTournament(id: $id) {id}}`

export const updateTimerMutation = gql`
  mutation updateTournamentTimer($id: ID!, $active: Boolean, $elapsed: Int, $oneMinuteRemainingSpeech: String, $playOneMinuteRemainingSound: Boolean, $endOfRoundSpeech: String, $playEndOfRoundSound: Boolean, $backgroundColor: String) {
    updateTimer(id: $id, active: $active, elapsed: $elapsed, oneMinuteRemainingSpeech: $oneMinuteRemainingSpeech,
    playOneMinuteRemainingSound: $playOneMinuteRemainingSound, endOfRoundSpeech: $endOfRoundSpeech, playEndOfRoundSound: $playEndOfRoundSound,
    backgroundColor: $backgroundColor) {
      id
      active
      createdAt
      updatedAt
      elapsed
      oneMinuteRemainingSpeech
      playOneMinuteRemainingSound
      endOfRoundSpeech
      playEndOfRoundSound
      backgroundColor
    }
  }
`
export const deleteTimerMutation = gql`mutation deleteTimer($id: ID!) {deleteTimer(id: $id) {id}}`

export const createSegmentMutation = gql`
  mutation createSegment( $tournamentId: ID!, $sBlind: Int, $bBlind: Int, $duration: Int, $ante: Int, $game: Game) {
    createSegment (
      tournamentId: $tournamentId, duration: $duration, sBlind: $sBlind, bBlind: $bBlind, ante: $ante, game: $game
    )
    { ...SegmentPayload }
  }
  ${TournamentFragments.segment}
`
export const updateSegmentMutation = gql`
  mutation updateSegment($id: ID!, $duration: Int, $sBlind: Int, $bBlind: Int, $ante: Int, $game: Game) {
    updateSegment(
      id: $id, duration: $duration, sBlind: $sBlind, bBlind: $bBlind, ante: $ante, game: $game
    )
    { ...SegmentPayload }
  }
  ${TournamentFragments.segment}
`
export const deleteSegmentMutation = gql`mutation deleteSegment($id: ID!) {deleteSegment(id: $id) {id}}`

export const createChipMutation = gql`
  mutation createChip( $tournamentId: ID!, $denom: Int, $color: String, $textColor: String="#000", $rimColor: String="#fff", $qtyAvailable: Int, ) {
    createChip (
      tournamentId: $tournamentId, denom: $denom, color: $color, textColor: $textColor, rimColor: $rimColor, qtyAvailable: $qtyAvailable
    )
    {...ChipPayload }
  }
  ${TournamentFragments.chip}
`
export const updateChipMutation = gql`
  mutation updateChip($id: ID!, $denom: Int, $color: String, $textColor: String, $rimColor: String, $qtyAvailable: Int, ) {
    updateChip(
      id: $id, denom: $denom, color: $color, textColor: $textColor, rimColor: $rimColor, qtyAvailable: $qtyAvailable
    )
    { ...ChipPayload }
  }
  ${TournamentFragments.chip}
`
export const deleteChipMutation = gql`mutation deleteChip($id: ID!) {deleteChip(id: $id) {id}}`

export const createCostMutation = gql`
  mutation createCost( $tournamentId: ID!, $price: Int, $chipStack: Int) {
    createCost (
      tournamentId: $tournamentId,price: $price, chipStack: $chipStack
    )
    {...CostPayload}
  }
  ${TournamentFragments.cost}
`
export const updateCostMutation = gql`
  mutation updateCost ($id: ID!, $price: Int, $chipStack: Int, $costType: CostType, ) {
    updateCost(
      id: $id, price: $price, chipStack: $chipStack, costType: $costType
    )
    {...CostPayload}
  }
  ${TournamentFragments.cost}
`
export const deleteCostMutation = gql`mutation deleteCost($id: ID!) { deleteCost(id: $id) {id}}`




export const createCostBuyMutation = gql`
  mutation createCostBuy( $costId: ID!) {
    createBuy (
      costId: $costId
    )
    {
      id
      player { id }
    }
  }
`

export const lastBuyOnCost = gql`
  query lastBuyOnCost($costId: ID!) {
    allBuys(
      filter: {
        cost: {
          id: $costId
        }
      },
      last: 1,
    ) {
      id
      cost {
        tournament {
          user {
            id
          }
        }
      }
    }
  }
`

export const getBuyQuery = gql`
  query getBuy($id: ID) {
    Buy(id: $id)
    {
      id
      player {
        id
      }
      cost {
        chipStack
        price
        costType       
      }
    }
  }
`

export const updateBuyMutation = gql`
  mutation updateBuy ($id: ID!, $cost: Cost, $player: Player, ) {
    updateCost(id: $id, cost: $cost, player: $player) {
      id
    }
  }
`

export const deleteBuyMutation = gql`
  mutation deleteBuy($id: ID!) {
    deleteBuy(id: $id) {
      id
    }
  }
`

export const createTournamentPayoutLevelMutation = gql`
  mutation createTournamentPayoutLevel( $tournamentId: ID!, $levelNumber: Int!, $payCount: Int!, $playerCount: Int!) {
    createPayoutLevel (
      tournamentId: $tournamentId
      levelNumber: $levelNumber
      payCount: $payCount
      playerCount: $playerCount
    )
    {
      id
      levelNumber
      payCount
      playerCount
    }
  }
`

export const getTournamentPayoutLevelsQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      user { id }
      _payoutLevelsMeta {
        count
      }
      payoutLevels (orderBy: levelNumber_ASC) {
        id
        levelNumber
        payCount
        playerCount
      }
    }
  }
`

export const getPayoutLevelQuery = gql`
  query getPayoutLevel($id: ID) {
    payoutLevel(id: $id)
    {
      id
      levelNumber
      payCount
      playerCount
    }
  }
`

export const updatePayoutLevelMutation = gql`
  mutation updatePayoutLevelMutation ($id: ID!, $levelNumber: Int, $payCount: Int, $playerCount: Int ) {
    updatePayoutLevel(id: $id, levelNumber: $levelNumber, payCount: $payCount, playerCount: $playerCount) {
      _payoutLevelsMeta {
        count
      }
      id
      levelNumber
      payCount
      playerCount
    }
  }
`

export const deletePayoutLevelMutation = gql`
  mutation deletePayoutLevel($id: ID!) {
    deletePayoutLevel(id: $id) {
      id
    }
  }
`

export const orphanedSegmentsQuery = gql`
  query orphanedSegments {
    allSegments (filter: {tournament: null}) {
      id
    }
  }
`
export const orphanedChipsQuery = gql`
  query orphanedChips {
    allChips (filter: {tournament: null}) {
      id
    }
  }
`
export const orphanedCostsQuery = gql`
  query orphanedCosts {
    allCosts (filter: {tournament: null}) {
      id
    }
  }
`
export const orphanedTimersQuery = gql`
  query orphanedTimers {
    allTimers (filter: {tournament: null}) {
      id
    }
  }
`
export const orphanedBuysQuery = gql`
  query orphanedBuys {
    allBuys (filter: {cost: null}) {
      id
    }
  }
`
export const orphanedPayoutLevelsQuery = gql`
  query orphanedPayoutLevels {
    allPayoutLevels (filter: {tournament: null}) {
      id
    }
  }
`