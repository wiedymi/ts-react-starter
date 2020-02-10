import React from 'react'
import { Switch, Route } from 'react-router-dom'
import routes from 'desktop/routes'
import { ENV } from 'config'

export default function App() {
  return (
    <Switch>
      {routes.map((route, index) => (
        <Route key={index} {...route} />
      ))}
    </Switch>
  )
}
