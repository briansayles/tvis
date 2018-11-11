import gql from 'graphql-tag'

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

export const currentUserTournamentsQuery = gql`
  query currentUserTournaments {
    user {
      id
      name
      tournaments {
        id
        title
        subtitle
      }
    }
  }
`

export const allTournamentsQuery = gql`
  query allTournaments {
    allTournaments (
      orderBy: updatedAt_DESC,
    )
    {
      id
      title
      subtitle
    }
  }
`

export const getTournamentQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      title
      subtitle
      comments
      updatedAt
      game
      timer {
        id
        active
        createdAt
        updatedAt
        elapsed
      }
      costs (orderBy: chipStack_DESC) {
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
        id
        duration
        sBlind
        bBlind
        ante
        game
      } 
      chips (orderBy: denom_ASC) {
        id
        denom
        color
        rimColor
        textColor
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
`

export const tournamentSubscription = gql`
  subscription {
    Tournament(filter: {
      mutation_in: [UPDATED]
    }) {
      node {
        id
      }
    }
  }
`

// TODO: Make costs, chips and segments Input Types. Doesn't work as-is.
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
    {
      id
      title
    }
  }
`
export const createTournamentMutation = gql`
  mutation createTournament( $userId: ID!, $title: String="Default Tournament Title", $duration: Int=20) {
    createTournament (
      userId: $userId
      title: $title
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
    {
      id
      title
      game
      user {
        name
        id
      }
    }
  }
`

export const updateTournamentMutation = gql`
  mutation updateTournament ($id: ID!, $title: String, $subtitle: String, $comments: String, $game: Game) {
    updateTournament(id: $id, title: $title, subtitle: $subtitle, comments: $comments, game: $game) {
      id
    }
  }
`

export const deleteTournamentMutation = gql`
  mutation deleteTournament($id: ID!) {
    deleteTournament(id: $id) {
      id
    }
  }
`

export const updateTournamentTimerMutation = gql`
  mutation updateTournamentTimer($id: ID!, $active: Boolean, $tournamentId: ID!, $now: DateTime, $elapsed: Int) {
    updateTimer(id: $id, active: $active, elapsed: $elapsed) {
      id
    }
    updateTournament(id: $tournamentId, childrenUpdatedAt: $now) {
      id
    }
  }
`

export const createTournamentSegmentMutation = gql`
  mutation createTournamentSegment( $tournamentId: ID!, $sBlind: Int=1, $bBlind: Int=2, $duration: Int=20) {
    createSegment (
      tournamentId: $tournamentId
      sBlind: $sBlind 
      bBlind: $bBlind
      duration: $duration
    )
    {
      id
      tournament { id }
      sBlind
      bBlind
      duration
    }
  }
`

export const getTournamentSegmentsQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      user { id }
      segments (orderBy: bBlind_ASC) {
        id
        duration
        sBlind
        bBlind
        ante
        game
      }
    }
  }
`

export const getSegmentQuery = gql`
  query getSegment($id: ID) {
    Segment(id: $id)
    {
      id
      duration
      sBlind
      bBlind
      ante
      game
      tournament {
        id
      }
    }
  }
`

export const updateSegmentMutation = gql`
  mutation updateSegment($id: ID!, $duration: Int, $sBlind: Int, $bBlind: Int, $ante: Int, $game: Game) {
    updateSegment(id: $id, duration: $duration, sBlind: $sBlind, bBlind: $bBlind, ante: $ante, game: $game) {
      id
    }
  }
`

export const deleteSegmentMutation = gql`
  mutation deleteSegment($id: ID!) {
    deleteSegment(id: $id) {
      id
    }
  }
`

export const createTournamentChipMutation = gql`
  mutation createTournamentChip( $tournamentId: ID!, $denom: Int=1, $color: String="#888", $textColor: String="#000", $rimColor: String="#fff") {
    createChip (
      tournamentId: $tournamentId
      denom: $denom 
      color: $color
      textColor: $textColor
      rimColor: $rimColor
    )
    {
      id
      tournament { id }
      denom
      color
      textColor
      rimColor
    }
  }
`

export const getTournamentChipsQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      user { id }
      chips (orderBy: denom_ASC) {
        id
        denom
        color
        rimColor
        textColor
      }
    }
  }
`

export const getChipQuery = gql`
  query getChip($id: ID) {
    Chip(id: $id)
    {
      id
      denom
      color
      textColor
      rimColor
      tournament {
        id
      }
    }
  }
`

export const updateChipMutation = gql`
  mutation updateChip($id: ID!, $denom: Int, $color: String, $textColor: String, $rimColor: String, ) {
    updateChip(id: $id, denom: $denom, color: $color, textColor: $textColor, rimColor: $rimColor) {
      id
    }
  }
`

export const deleteChipMutation = gql`
  mutation deleteChip($id: ID!) {
    deleteChip(id: $id) {
      id
    }
  }
`

export const createTournamentCostMutation = gql`
  mutation createTournamentCost( $tournamentId: ID!, $price: Int, $chipStack: Int) {
    createCost (
      tournamentId: $tournamentId
      price: $price
      chipStack: $chipStack
    )
    {
        id
        price
        chipStack
        costType
    }
  }
`

export const getTournamentCostsQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      title
      comments
      game
      user { id }
      costs (orderBy: chipStack_DESC) {
        id
        price
        chipStack
        costType
        _buysMeta {
          count
        }
      }
    }
  }
`

export const tournamentCosts = gql`
  query ($id: ID!) {
    allCosts(filter: {
      tournament: {
        id: $id
      }
    }) {
      id
      price
      chipStack
      costType
      _buysMeta {
        count
      }
      tournament {
        user {
          id
        }
      }
    }
  }
`

export const getCostQuery = gql`
  query getCost($id: ID) {
    Cost(id: $id)
    {
      id
      price
      chipStack
      costType
      tournament {
        id
      }
    }
  }
`

export const updateCostMutation = gql`
  mutation updateCost ($id: ID!, $price: Int, $chipStack: Int, $costType: CostType, ) {
    updateCost(id: $id, price: $price, chipStack: $chipStack, costType: $costType) {
      id
    }
  }
`

export const deleteCostMutation = gql`
  mutation deleteCost($id: ID!) {
    deleteCost(id: $id) {
      id
    }
  }
`

export const createCostBuyMutation = gql`
  mutation createCostBuy( $costId: ID!) {
    createBuy (
      costId: $costId
    )
    {
      id
      cost {
        costType
        chipStack
        price
      }
    }
  }
`

export const getTournamentBuysQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      user { id } 
      costs (orderBy: chipStack_DESC) {
        id
        price
        chipStack
        costType
        _buysMeta {
          count
        }
        buys {
          id
          player {id}
        }
      }
    }
  }
`

export const tournamentBuys = gql`
  query ($id: ID!) {
    allBuys(filter: {
      cost: {
        tournament: {
          id: $id
        }
      }
    }) {
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
      id
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