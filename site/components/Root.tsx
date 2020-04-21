import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { useLocalStorage, useMatchMedia, useTheme, Flex, Icon, Link, List, ListItem, Text, ThemeSwitcher, TypeTheme } from 'preshape';
import { URLStateContext } from './URLState';
import About from './About';
import Editor from './Editor';
import Library from './Library';
import Logo from './Logo';
import Settings from './Settings';

export const RootContext = React.createContext<{
  onChangeTheme: (theme: TypeTheme) => void;
  theme: TypeTheme;
}>({
  onChangeTheme: () => {},
  theme: 'day',
});

export default () => {
  const { search } = React.useContext(URLStateContext);
  const match = useMatchMedia(['600px']);
  const [theme, onChangeTheme] = useLocalStorage<TypeTheme>('com.hogg.theme', 'night');

  useTheme(theme);

  return (
    <RootContext.Provider value={ { theme, onChangeTheme } }>
      <Flex backgroundColor="text-shade-1" direction="vertical" gap="x1" grow>
        <Flex
            alignChildrenVertical="middle"
            backgroundColor="background-shade-1"
            direction="horizontal"
            gap="x6"
            paddingHorizontal="x6"
            paddingVertical="x2">
          <Flex direction="horizontal" grow>
            <Link display="block" to={ `/?${search}` }>
              <Flex
                  alignChildrenVertical="middle"
                  direction="horizontal"
                  gap="x4"
                  grow>
                <Flex>
                  <Logo height="32px" width="32px" />
                </Flex>

                { match('600px') && (
                  <Flex>
                    <Text>
                      <Text inline strong>ANTWERP</Text>
                    </Text>
                  </Flex>
                ) }
              </Flex>
            </Link>
          </Flex>

          <Flex>
            <List gap="x2">
              <Route exact path="/">
                { ({ match }) => (
                  <ListItem separator="|">
                    <Link active={ !!match } title="Editor" to={ `/?${search}` }>
                      <Icon name="Pencil" size="1.25rem" />
                    </Link>
                  </ListItem>
                ) }
              </Route>

              <Route path="/library">
                { ({ match }) => (
                  <ListItem separator="|">
                    <Link active={ !!match } title="Library" to={ `/library?${search}` }>
                      <Icon name="Book" size="1.25rem" />
                    </Link>
                  </ListItem>
                ) }
              </Route>

              <Route path="/settings">
                { ({ match }) => (
                  <ListItem separator="|">
                    <Link active={ !!match } title="Settings" to={ `/settings?${search}` }>
                      <Icon name="Cog" size="1.25rem" />
                    </Link>
                  </ListItem>
                ) }
              </Route>

              <Route path="/about">
                { ({ match }) => (
                  <ListItem separator="|">
                    <Link active={ !!match } title="About" to={ `/about?${search}` }>
                      <Icon name="Info" size="1.25rem" />
                    </Link>
                  </ListItem>
                ) }
              </Route>

              <ListItem separator="|">
                <Link href="https://github.com/HHogg/antwerp" target="Github" title="Github">
                  <Icon name="Github" size="1.25rem" />
                </Link>
              </ListItem>

              <ListItem>
                <ThemeSwitcher
                    onChange={ onChangeTheme }
                    theme={ theme } />
              </ListItem>
            </List>
          </Flex>
        </Flex>

        <Flex backgroundColor="background-shade-1" direction="vertical" grow>
          <Switch>
            <Route component={ Library } path="/library" />
            <Route component={ Editor } path="/" />
          </Switch>

          <Switch>
            <Route component={ About } path="/about" />
            <Route component={ Settings } path="/settings" />
          </Switch>
        </Flex>
      </Flex>
    </RootContext.Provider>
  );
};
