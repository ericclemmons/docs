import React from 'react';
import { Card, Label } from 'semantic-ui-react';

export default function PhotoDetails({ photo }) {
  const [description, labels] = photo;

  return (
    <Card data-test="photo-card" raised>
      <Card.Content data-test="photo-card-description">
        <Card.Meta style={{ whiteSpace: 'pre-line' }}>{description}</Card.Meta>
      </Card.Content>

      {labels.length ? (
        <Card.Content extra>
          <Card.Description>
            <Label.Group>
              {labels.map(label => (
                <Label key={label} size="tiny">
                  {label}
                </Label>
              ))}
            </Label.Group>
          </Card.Description>
        </Card.Content>
      ) : null}
    </Card>
  );
}