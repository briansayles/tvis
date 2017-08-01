import gql from 'graphql-tag'

export const currentUserQuery = gql`
  query currentUser {
      user {
          id
          name
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

export const allTournamentsQuery = gql`
  query allTournaments {
    allTournaments (orderBy: updatedAt_DESC) {
      id
      title
    }
  }
`
export const allTournamentsSubscription = gql`
  subscription {
    Tournament(filter: {
      mutation_in: [CREATED, DELETED, UPDATED]
    }) {
      node {
        id
        title
      }
    }
  }
`

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

export const createTournamentMutation = gql`
  mutation createTournament( $userId: ID, $title: String="Default Tournament Title", $duration: Int=20) {
    createTournament (
      userId: $userId
      title:$title
      game:NLHE
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
  mutation updateTournament ($id: ID!, $title: String, $game: TOURNAMENT_GAME) {
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
export const getServerTimeMutation = gql`
  mutation updateTime ($id: ID! $lastRequestedAt: DateTime!) {
    updateTime(id: $id, lastRequestedAt: $lastRequestedAt) {
      updatedAt
    }
  }
`