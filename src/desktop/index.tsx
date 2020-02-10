import React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'emotion-theming'
import { ApolloProvider } from '@apollo/react-hooks'
import { client } from 'core'
import * as theme from 'theme'
import App from './App'

hydrate(
  <ApolloProvider client={client}>
    <ThemeProvider theme={{ ...theme }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('root')!,
)
