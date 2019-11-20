import React from 'react';
import { BrowserRouter, NavLink, Route } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import AlbumList from './components/AlbumList';
import AlbumDetails from './components/AlbumDetails';
import Login from './components/Login';
import Navigation from './components/Navigation';
import NewAlbum from './components/NewAlbum';
import PhotoBox from './components/PhotoBox';

import Amplify from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

export default function App(props) {
  return (
    <BrowserRouter>
      <Navigation />

      <Route component={Login} path="/login" />

      <Grid padded>
        <Grid.Column>
          <Route component={NewAlbum} exact path="/" />
          <Route component={AlbumList} exact path="/" />
          <Route
            path="/albums/:albumId"
            render={() => (
              <div>
                <NavLink to="/">Back to Albums list</NavLink>
              </div>
            )}
          />

          <Route
            path="/albums/:albumId"
            render={props => <AlbumDetails id={props.match.params.albumId} />}
          />

          <Route component={PhotoBox} path="/albums/:albumId/photos/:photoId" />
        </Grid.Column>
      </Grid>
    </BrowserRouter>
  );
}