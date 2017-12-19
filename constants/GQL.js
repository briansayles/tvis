import gql from 'graphql-tag'

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

export const currentUserQuery = gql`
  query currentUser {
    user {
      id
      name
    }
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
      }
    }
  }
`

// export const currentUserTournamentsSubscription = gql`
//   subscription {
//     Tournament(filter: {
//       mutation_in: [CREATED, DELETED, UPDATED]
//     }) {
//       node {
//         id
//         title
//       }
//     }
//   }
// `

export const allTournamentsQuery = gql`
  query allTournaments {
    allTournaments (
      orderBy: updatedAt_DESC,
    )
    {
      id
      title
    }
  }
`

// export const allTournamentsSubscription = gql`
//   subscription {
//     Tournament(filter: {
//       mutation_in: [CREATED, DELETED, UPDATED]
//     }) {
//       node {
//         id
//         title
//       }
//     }
//   }
// `

export const getTournamentQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      title
      updatedAt
      game
      timer {
        id
        active
        createdAt
        updatedAt
        elapsed
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
        denom
        color
        rimColor
        textColor
      }
      tags (orderBy: name_ASC) {
        name
      }
      user {
        id
        name
      }
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
export const getTournamentCostsQuery = gql`
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
export const createTournamentCostMutation = gql`
  mutation createTournamentCost( $tournamentId: ID!, $price: Int=20, $chipStack: Int=1000) {
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
      ]
      timer: {
        active: false
        elapsed: 0
      }
      segments: [
        {
          sBlind:5
          bBlind:10
          duration: $duration
        }
        {
          sBlind:15
          bBlind:30
          duration:$duration
        }
        {
          sBlind:10
          bBlind:20
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
          ante: 10
          duration:$duration
        }      
        {
          sBlind:25
          bBlind:50
          duration:$duration
        }      
        {
          sBlind:5
          bBlind:5
          duration:$duration
        }      
        {
          sBlind:50
          bBlind:100
          ante: 20
          duration:$duration
        }      
        {
          sBlind:75
          bBlind:150
          ante: 25
          duration:$duration
        }
      ]
      chips: [
        {
          color:"#f00"
          rimColor: "#fff"
          textColor: "#fff"
          denom:5
        }
        {
          color:"#0f0"
          rimColor: "#000"
          textColor: "#000"
          denom:25
        }
        {
          color:"#000"
          rimColor: "#fff"
          textColor: "#fff"
          denom:100
        }
      ]
    )
    {
      id
      title
      game
      segments {
        sBlind
        duration
      }
      user {
        name
        id
      }
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

export const changeTitleMutation = gql`
  mutation updateTournamentTitle ($id: ID!, $newTitle: String) {
    updateTournament(id: $id, title: $newTitle) {
      id
    }
  }
`

export const updateTournamentMutation = gql`
  mutation updateTournament ($id: ID!, $title: String, $game: Game) {
    updateTournament(id: $id, title: $title, game: $game) {
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

export const getServerTimeMutation = gql`
  mutation updateTime ($id: ID! $lastRequestedAt: DateTime!) {
    updateTime(id: $id, lastRequestedAt: $lastRequestedAt) {
      updatedAt
    }
  }
`