import { ApolloClient, HttpLink, split } from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache';
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import Constants from 'expo-constants'

export const makeApolloClient = (token) => {
  var bearerString = 'Bearer ' + token
  bearerString = bearerString.replace(/['"]+/g, '')
  const httpLink = new HttpLink({
    uri: Constants.expoConfig.extra.GraphQLConfig.httpLinkUri,
    headers: {
      Authorization: `${bearerString}`
    }
  });
  const wsLink = new WebSocketLink(new SubscriptionClient(
    Constants.expoConfig.extra.GraphQLConfig.wsLinkUri, {
    reconnect: true,
    connectionParams: {
      headers: {
        Authorization: `${bearerString}`
      }
    }
  }));
  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  );
  const cache = new InMemoryCache()
  const client = new ApolloClient({
    link,
    cache
  });
  return client;
}