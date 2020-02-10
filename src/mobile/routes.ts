import { RouteProps } from 'react-router-dom'
import { Main, NotFound } from 'mobile/pages'

const routes: Array<RouteProps> = [
  {
    path: '/',
    component: Main,
    exact: true,
  },
  {
    path: '*',
    component: NotFound,
  },
]

export default routes
