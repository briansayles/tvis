import gql from 'graphql-tag'

export const currentUserQuery = gql`
  query currentUser {
      user {
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
export const getTournamentQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      title
      updatedAt
      timer {
        id
        active
        createdAt
        updatedAt
        elapsed
      }
      segments {
        id
        duration
        sBlind
        bBlind
        ante
        game
      }
      chips {
        denom
        color
      }
      tags {
        name
      }
    }
  }
`

export const createTournamentMutation = gql`
  mutation createTournament($title: String, $userId: ID) {
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
          sBlind:10
          bBlind:20
          duration:1
        }
        {
          sBlind:15
          bBlind:30
          duration:2
        }
        {
          sBlind:20
          bBlind:40
          duration:1
        }      {
          sBlind:25
          bBlind:50
          duration:2
        }      {
          sBlind:50
          bBlind:100
          duration:1
        }      
        {
          sBlind:75
          bBlind:150
          duration:2
        }
      ]
      chips: [
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

export const updateTournamentTimerMutation = gql`
  mutation updateTournamentTimer($id: ID!, $active: Boolean!, $tournamentId: ID!, $now: DateTime, $elapsed: Int) {
    updateTimer(id: $id, active: $active, elapsed: $elapsed) {
      id
    }
    updateTournament(id: $tournamentId, childrenUpdatedAt: $now) {
      id
    }
  }
`
export const getServerTimeMutation = gql`
  mutation updateTime ($lastRequestedAt: DateTime!) {
    updateTime(id: "cj5l33oih3t9y0193gnww7u55", lastRequestedAt: $lastRequestedAt) {
      updatedAt
    }
  }
`