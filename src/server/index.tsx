import Koa from 'koa'
import views from 'koa-views'
import logger from 'koa-logger'
import url from 'url'
import path from 'path'
import fetch from 'node-fetch'
import React from 'react'
import { ThemeProvider } from 'emotion-theming'
import { isUserAgentMobile } from 'server/helpers'
import { renderToString } from 'react-dom/server'
import { StaticRouterContext } from 'react-router'
import { StaticRouter } from 'react-router-dom'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from '@apollo/react-common'
import { getDataFromTree } from '@apollo/react-ssr'
import DesktopApp from 'desktop/App'
import MobileApp from 'mobile/App'
import * as theme from 'theme'

const app = new Koa()

app.use(
  views(path.resolve(__dirname, 'views'), {
    map: {
      html: 'twig',
    },
  }),
)

app.use(logger())

if (!process.env.prod) {
  /**
   * A proxy for assets on devServer is needed only during development.
   * devServer listens to http://localhost:8080 and gives everything in the root directory.
   * At production, Nginx will do this, not the front-end server.
   * The build/ directory contains the assets we need.
   * http://localhost:3000/assets/some.js -> http://localhost:8080/build/some.js
   */
  app.use(async (ctx, next) => {
    if (!ctx.path.startsWith('/assets')) {
      await next()
      return
    }
    const path = ctx.path.replace(/^\/assets/i, '/build')
    const assetUrl = new url.URL(path, process.env.HOST || 'http://localhost:8080')
    const result = await fetch(assetUrl)
    ctx.status = result.status
    result.headers.forEach((value, name) => ctx.set(name, value))
    ctx.body = result.body
  })
}

app.use(async ctx => {
  const isMobile = isUserAgentMobile(ctx.headers['user-agent'])
  const platform = isMobile ? 'mobile' : 'desktop'
  const App = isMobile ? MobileApp : DesktopApp

  const client = new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: process.env.HTTP_API || 'http://localhost:4000/graphql',
      credentials: 'same-origin',
      headers: {
        cookie: ctx.headers['Cookie'],
      },
      fetch: fetch as any,
    }),
    cache: new InMemoryCache(),
  })

  const context: StaticRouterContext = {}
  const AppJsx = (
    <ApolloProvider client={client}>
      <ThemeProvider theme={{ ...theme }}>
        <StaticRouter location={ctx.url} context={context}>
          <App />
        </StaticRouter>
      </ThemeProvider>
    </ApolloProvider>
  )

  await getDataFromTree(AppJsx)

  const html = renderToString(AppJsx)

  const initialState = client.extract()
  const state = JSON.stringify(initialState).replace(/</g, '\\u003c')

  ctx.status = context.statusCode || 200
  await ctx.render('index.html', {
    platform,
    html,
    state,
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Frontend app is now running on http://localhost:${PORT}`))
