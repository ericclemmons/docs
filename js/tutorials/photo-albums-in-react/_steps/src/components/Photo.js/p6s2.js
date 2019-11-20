import { API, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { Image, Loader, Segment } from 'semantic-ui-react';

import { getPhoto } from '../graphql/queries';
import useAuth from '../useAuth';

export default function Photo(props) {
  const { owner } = useAuth();

  // The supplied photo isn't the full `getPhoto` shape, so we'll load it
  const [photo, setPhoto] = useState(props.photo);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retries, setRetries] = useState(0);
  const [src, setSrc] = useState();

  // Fetch the full photo object shape on load
  useEffect(() => {
    API.graphql({
      authMode: owner ? 'AMAZON_COGNITO_USER_POOLS' : 'AWS_IAM',
      query: getPhoto,
      variables: {
        id: photo.id
      }
    }).then(payload => setPhoto(payload.data.getPhoto));
  }, [owner, photo.id]);

  // Fetch the photo URL, if missing
  useEffect(() => {
    if (photo.fullsize && !src) {
      const { key } = photo.fullsize;

      Storage.get(props.thumbnail ? `thumbnails/${key}` : key).then(setSrc);
    }
  }, [photo.fullsize, props.thumbnail, src]);

  // Poll for the image while the thumbnail may be generating
  useEffect(() => {
    if (!src) {
      return;
    }

    // Give up & show a broken image instead of a loader
    if (retries > 10) {
      setIsLoaded(true);
    }

    const image = new window.Image();
    let timeout;

    image.onerror = () => {
      timeout = setTimeout(() => setRetries(retries + 1), 1000);
    };
    image.onload = () => setIsLoaded(true);
    image.src = src;

    return () => clearTimeout(timeout);
  }, [retries, src]);

  if (!isLoaded) {
    return (
      <Segment basic style={{ margin: 'auto' }}>
        <Loader active inline="centered" />
      </Segment>
    );
  }

  return (
    <Image
      data-test={props.thumbnail ? 'thumbnail' : 'photo'}
      src={src}
      style={{ margin: 'auto' }}
    />
  );
}