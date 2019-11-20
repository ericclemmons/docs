import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header, Image, Menu } from 'semantic-ui-react';

import useAuth from '../useAuth';

export default function Navigation() {
  const { Auth, user } = useAuth();
  const { pathname } = useLocation();

  if (pathname === '/login') {
    return null;
  }

  return (
    <Menu secondary pointing>
      <Menu.Item header>
        <Link to="/">
          <Header color="teal" size="small" textAlign="center">
            <Image
              size="tiny"
              src="https://aws-amplify.github.io/docs/images/Logos/Amplify Logo.svg"
              verticalAlign="bottom"
            />
            Amplify Photo Albums
          </Header>
        </Link>
      </Menu.Item>

      <Menu.Menu position="right">
        {user ? (
          <Menu.Item active onClick={() => Auth.signOut()} name="Sign Out" />
        ) : (
          <Menu.Item active as={Link} name="Sign In" to="/login" />
        )}
      </Menu.Menu>
    </Menu>
  );
}