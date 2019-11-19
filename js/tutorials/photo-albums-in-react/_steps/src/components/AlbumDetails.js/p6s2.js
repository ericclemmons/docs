import { API } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Dimmer,
  Header,
  Loader,
  Message,
  Segment,
  Form
} from 'semantic-ui-react';

import { onCreatePhoto, onUpdateAlbum } from '../graphql/subscriptions';

import DeleteAlbum from './DeleteAlbum';
import PhotoList from './PhotoList';
import PhotosUploader from './PhotosUploader';
import { getAlbum } from '../graphql/queries';
import { updateAlbum } from '../graphql/mutations';
import useAuth from '../useAuth';

function AlbumDetails({ album }) {
  const { owner } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [photos, setPhotos] = useState(album.photos.items);

  useEffect(() => {
    const subscription = API.graphql({
      authMode: owner ? 'AMAZON_COGNITO_USER_POOLS' : 'AWS_IAM',
      query: onCreatePhoto,
      variables: { owner }
    }).subscribe({
      next(payload) {
        const photo = payload.value.data.onCreatePhoto;

        setPhotos(prevPhotos => [photo, ...prevPhotos]);
      }
    });

    return () => subscription.unsubscribe();
  }, [owner]);

  const handleCancel = () => {
    setIsEditing(!isEditing);
    setIsUpdating(false);
  };

  const handleSave = event => {
    const updatedName = event.target.albumName.value.trim();

    setIsUpdating(true);

    API.graphql({
      query: updateAlbum,
      variables: {
        input: {
          id: album.id,
          expectedVersion: album.version,
          name: updatedName
        }
      }
    });
  };

  return (
    <Segment.Group>
      <Segment clearing>
        <Header data-test="album-header" floated="left" size="huge">
          <Header.Content>
            {isEditing ? (
              <Form onSubmit={handleSave}>
                <Form.Input
                  action={{
                    color: 'green',
                    disabled: isUpdating,
                    loading: isUpdating,
                    icon: 'check'
                  }}
                  autoFocus
                  defaultValue={album.name}
                  name="albumName"
                />
              </Form>
            ) : (
              album.name
            )}
          </Header.Content>

          {owner && (
            <Header.Subheader>
              <Button
                basic
                circular
                content={isEditing ? 'Cancel' : 'Edit'}
                icon={isEditing ? 'close' : 'pencil'}
                onClick={handleCancel}
                size="mini"
                style={{ position: 'relative', top: '0.5em' }}
              />
            </Header.Subheader>
          )}
        </Header>
        <PhotosUploader album={album} />
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

  useEffect(() => {
    const subscription = API.graphql({
      authMode: owner ? 'AMAZON_COGNITO_USER_POOLS' : 'AWS_IAM',
      query: onUpdateAlbum,
      variables: { owner }
    }).subscribe({
      next(payload) {
        setAlbum(payload.value.data.onUpdateAlbum);
      }
    });

    return () => subscription.unsubscribe();
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

  return <AlbumDetails album={album} key={`${album.id}-${album.version}`} />;
}
