import { split } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { createUploadLink } from 'apollo-upload-client'
import { setContext } from 'apollo-link-context'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { ENV } from 'config'
import { StateResolvers, typeDefs, getAppState } from './store'

const { HTTP_API, WS_API } = ENV

const httpLink = createUploadLink({
  uri: HTTP_API,
})

const wsLink = new WebSocketLink({
  uri: WS_API,
  options: {
    reconnect: true,
  },
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(LOCAL_STORAGE.TOKEN)
  const Authorization = token ? `Bearer ${token}` : false

  if (!Authorization) {
    return {
      headers,
    }
  }

  return {
    headers: {
      ...headers,
    },
  }
})

const linkError = ({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
    )
  }

  if (networkError) console.log(`[Network error]: ${networkError}`)
}

const linkSub = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  httpLink,
  linkError,
)

const link = authLink.concat(linkSub)

const cache = new InMemoryCache().restore(window.__APOLLO_STATE__)

const writeState = state => {
  return cache.writeData({ data: { state } })
}

const initState = () => {
  const state = {
    appState: {
      isDarkModeEnabled: true,
    },
    __typename: 'State',
  }

  writeState(state)
}

initState()

const getState = query => {
  return cache.readQuery({ query })
}

export const client = new ApolloClient({
  link,
  cache,
  resolvers: StateResolvers(getState, writeState),
  typeDefs,
})
