import { API } from 'aws-amplify';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Icon, Label, Form, TextArea } from 'semantic-ui-react';

import Photo from './Photo';
import { deletePhoto, updatePhoto } from '../graphql/mutations';
import useAuth from '../useAuth';

export default function PhotoDetails({ photo }) {
  const { owner } = useAuth();
  const { albumId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [description, setDescription] = useState(photo.description);
  const [labels, setLabels] = useState(photo.labels);
  const [newLabel, setNewLabel] = useState();
  const [isDeleting, setIsDeleting] = useState(false);

  const reset = () => {
    setDescription(photo.description);
    setLabels(photo.labels);
    setIsEditing(false);
  };

  const handleNewLabel = event => {
    if (newLabel) {
      setLabels(prevLabels => [...prevLabels, newLabel]);
    }

    setNewLabel();
  };

  const handleUpdatePhoto = async () => {
    setIsUpdating(true);

    try {
      await API.graphql({
        authMode: owner ? 'AMAZON_COGNITO_USER_POOLS' : 'AWS_IAM',
        query: updatePhoto,
        variables: {
          input: {
            expectedVersion: photo.version,
            id: photo.id,
            description,
            labels
          }
        }
      });
    } catch (payload) {
      throw new Error(payload.errors[0].message);
    }

    setIsUpdating(false);
    setIsEditing(false);
  };

  const handleDeletePhoto = async () => {
    setIsDeleting(true);

    await API.graphql({
      authMode: owner ? 'AMAZON_COGNITO_USER_POOLS' : 'AWS_IAM',
      query: deletePhoto,
      variables: {
        input: {
          expectedVersion: photo.version,
          id: photo.id
        }
      }
    });
  };

  return (
    <Card data-test="photo-card" raised>
      <Link
        data-test="photo-card-thumbnail"
        style={{ background: 'black' }}
        to={`/albums/${albumId}/photos/${photo.id}`}
      >
        <Photo photo={photo} thumbnail />
      </Link>

      <Card.Content data-test="photo-card-description">
        {isEditing ? (
          <Form style={{ height: '100%' }}>
            <TextArea
              autoFocus
              defaultValue={description}
              onChange={event => setDescription(event.target.value || null)}
              placeholder="Photo description"
              style={{ height: '100%' }}
            />
          </Form>
        ) : (
          <Card.Meta style={{ whiteSpace: 'pre-line' }}>
            {description}
          </Card.Meta>
        )}
      </Card.Content>

      {labels.length ? (
        <Card.Content extra>
          <Card.Description>
            <Label.Group>
              {labels.map(label => (
                <Label
                  as={isEditing ? 'a' : null}
                  key={label}
                  onClick={
                    isEditing
                      ? () => {
                          setLabels(labels.filter(name => name !== label));
                        }
                      : undefined
                  }
                  size="tiny"
                >
                  {label}
                  {isEditing && <Icon name="delete" />}
                </Label>
              ))}

              {isEditing && (
                <Form onSubmit={handleNewLabel} size="tiny">
                  <Form.Input
                    action={{ icon: 'plus' }}
                    onChange={event => {
                      setNewLabel(event.target.value.trim().toLowerCase());
                    }}
                    name="label"
                    placeholder="New label"
                    value={newLabel || ''}
                  />
                </Form>
              )}
            </Label.Group>
          </Card.Description>
        </Card.Content>
      ) : null}

      {owner && (
        <Card.Content extra>
          {!isEditing && (
            <Button
              basic
              circular
              compact
              icon="pencil"
              onClick={() => setIsEditing(true)}
              primary
            />
          )}

          {isEditing && (
            <Button
              circular
              compact
              disabled={isUpdating}
              icon="check"
              loading={isUpdating}
              onClick={handleUpdatePhoto}
              positive
            />
          )}

          {isEditing && (
            <Button
              aria-label="Edit"
              basic
              circular
              compact
              disabled={isUpdating}
              icon="delete"
              onClick={reset}
            />
          )}

          {isEditing && (
            <Button
              aria-label="Delete"
              basic
              circular
              compact
              disabled={isDeleting}
              floated="right"
              icon="trash"
              loading={isDeleting}
              negative
              onClick={handleDeletePhoto}
            />
          )}
        </Card.Content>
      )}
    </Card>
  );
}