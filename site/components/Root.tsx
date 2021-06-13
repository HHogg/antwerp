import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { useLocalStorage, useMatchMedia, useTheme, Box, Icon, Link, List, ListItem, Text, ThemeSwitcher, Tooltip, TypeTheme } from 'preshape';
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
      <Box backgroundColor="text-shade-1" flex="vertical" gap="x1" grow>
        <Box
            alignChildrenVertical="middle"
            backgroundColor="background-shade-1"
            flex="horizontal"
            gap="x6"
            paddingHorizontal="x6"
            paddingVertical="x2">
          <Box flex="horizontal" grow>
            <Link display="block" to={ `/?${search}` }>
              <Box
                  alignChildrenVertical="middle"
                  flex="horizontal"
                  gap="x4"
                  grow>
                <Box>
                  <Logo height="32px" width="32px" />
                </Box>

                { match('600px') && (
                  <Box>
                    <Text>
                      <Text inline strong>ANTWERP</Text>
                    </Text>
                  </Box>
                ) }
              </Box>
            </Link>
          </Box>

          <Box>
            <List gap="x2">
              <Route exact path="/">
                { ({ match }) => (
                  <ListItem separator="|">
                    <Link active={ !!match } title="Editor" to={ `/?${search}` }>
                      <Tooltip content="Editor">
                        { (props) => <Icon { ...props } name="Pencil" size="1.25rem" /> }
                      </Tooltip>
                    </Link>
                  </ListItem>
                ) }
              </Route>

              <Route path="/library">
                { ({ match }) => (
                  <ListItem separator="|">
                    <Link active={ !!match } title="Library" to={ `/library?${search}` }>
                      <Tooltip content="Library">
                        { (props) => <Icon { ...props } name="Book" size="1.25rem" /> }
                      </Tooltip>
                    </Link>
                  </ListItem>
                ) }
              </Route>

              <Route path="/settings">
                { ({ match }) => (
                  <ListItem separator="|">
                    <Link active={ !!match } title="Settings" to={ `/settings?${search}` }>
                      <Tooltip content="Settings">
                        { (props) => <Icon { ...props } name="Cog" size="1.25rem" /> }
                      </Tooltip>
                    </Link>
                  </ListItem>
                ) }
              </Route>

              <Route path="/about">
                { ({ match }) => (
                  <ListItem separator="|">
                    <Link active={ !!match } title="About" to={ `/about?${search}` }>
                      <Tooltip content="About">
                        { (props) => <Icon { ...props } name="Info" size="1.25rem" /> }
                      </Tooltip>
                    </Link>
                  </ListItem>
                ) }
              </Route>

              <ListItem separator="|">
                <Link href="https://github.com/HHogg/antwerp" target="Github" title="Github">
                  <Tooltip content="Github">
                    { (props) => <Icon { ...props } name="Github" size="1.25rem" /> }
                  </Tooltip>
                </Link>
              </ListItem>

              <ListItem>
                <ThemeSwitcher
                    onChange={ onChangeTheme }
                    theme={ theme } />
              </ListItem>
            </List>
          </Box>
        </Box>

        <Box backgroundColor="background-shade-1" flex="vertical" grow>
          <Switch>
            <Route component={ Library } path="/library" />
            <Route component={ Editor } path="/" />
          </Switch>

          <Switch>
            <Route component={ About } path="/about" />
            <Route component={ Settings } path="/settings" />
          </Switch>
        </Box>
      </Box>
    </RootContext.Provider>
  );
};
