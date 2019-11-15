import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import Login from './components/Login';

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

export default function App(props) {
  return (
    <BrowserRouter>
      <Navigation />

      <Route component={Login} path="/login" />

      <Grid padded>
        <Grid.Column>...</Grid.Column>
      </Grid>
    </BrowserRouter>
  );
}
