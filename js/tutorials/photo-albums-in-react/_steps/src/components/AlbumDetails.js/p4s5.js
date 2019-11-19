import { API } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { Dimmer, Header, Loader, Message, Segment } from 'semantic-ui-react';

import DeleteAlbum from './DeleteAlbum';
import PhotoList from './PhotoList';
import { getAlbum } from '../graphql/queries';
import useAuth from '../useAuth';

function AlbumDetails({ album }) {
  const photos = album.photos.items;

  return (
    <Segment.Group>
      <Segment clearing>
        <Header data-test="album-header" floated="left" size="huge">
          <Header.Content>{album.name}</Header.Content>
        </Header>
      </Segment>

      <Segment data-test="album-content" tertiary>
        <PhotoList photos={photos} />
      </Segment>

      <Segment data-test="album-footer" clearing secondary>
        <DeleteAlbum album={album} />
      </Segment>
    </Segment.Group>
  );
}

export default function AlbumDetailsLoader(props) {
  const { id } = props;
  const { owner } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [album, setAlbum] = useState();

  useEffect(() => {
    API.graphql({
      authMode: owner ? 'AMAZON_COGNITO_USER_POOLS' : 'AWS_IAM',
      query: getAlbum,
      variables: { id }
    }).then(payload => {
      if (payload.data.getAlbum) {
        setAlbum(payload.data.getAlbum);
      }

      setIsLoading(false);
    });
  }, [id, owner]);

  if (isLoading) {
    return (
      <Dimmer active inverted page>
        <Loader />
      </Dimmer>
    );
  }

  if (!album) {
    return (
      <Message native>
        <Message.Header>Album not found</Message.Header>
      </Message>
    );
  }

  return <AlbumDetails album={album} />;
}
