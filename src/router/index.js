import React, { Component } from 'react'
import { BrowserRouter , Route, Switch, Redirect } from 'react-router-dom'
import loadable from '@/components/loadable.js'
// import AuthRoute from '@/components/AuthRoute.js'

const DefaultLayout = loadable(() => import('./DefaultLayout/DefaultLayout.js'))
// const LoginUser = loadable(() => import('./LoginUser/LoginUser.js'))
const NoMatch = loadable(() => import('@/pages/NoMatch.js'))
const NoPermission = loadable(() => import('@/pages/NoPermission.js'))
const Waiting = loadable(() => import('@/pages/Waiting.js'))
export default class RouterWrap extends Component {
  render() {
    return (
      <div className="divflow">
        <BrowserRouter basename='/'>
          <Switch>
            <Route path="wait" component={Waiting} exact strict/>
            <Route path="404" component={NoMatch} exact strict/>
            <Route path="555" component={NoPermission} exact strict/>
            <Route  component={DefaultLayout} />
            <Redirect from="*" to="/404" />
          </Switch>
        </BrowserRouter>
      </div>
    )
  }
}
