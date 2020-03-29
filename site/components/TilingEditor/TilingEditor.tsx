import * as React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import FileSaver from 'file-saver';
import {
  colorLightShade1,
  useMatchMedia,
  useTheme,
  themes,
  Flex,
  Form,
  Icon,
  Link,
  List,
  ListItem,
  Text,
  ThemeSwitcher,
} from 'preshape';
import * as d3Scale from 'd3-scale';
import About from '../About/About';
import Logo from '../Logo/Logo';
import TilingLibrary from '../TilingLibrary/TilingLibrary';
import TilingRenderer from '../TilingRenderer/TilingRenderer';
import TilingSettings from '../TilingSettings/TilingSettings';
import { URLStateContext } from '../URLState/URLState';
import { RootContext } from '../Root';
import './TilingEditor.css';

export default () => {
  const {
    animate,
    configuration,
    disableColoring,
    disableRepeating,
    fadeConnectedShapes,
    maxRepeat,
    onUpdateUrlState,
    showAxis,
    shapeSize,
    showTransforms,
  } = React.useContext(URLStateContext);

  const { theme, onChangeTheme } = React.useContext(RootContext);
  const refSVG = React.useRef<SVGSVGElement>(null);
  const [value, setValue] = React.useState<string>(configuration);
  const location = useLocation();
  const match = useMatchMedia(['600px']);

  useTheme(theme);

  React.useEffect(() => {
    setValue(configuration);
  }, [configuration]);

  const colorScale = d3Scale.scaleLinear<string>()
    .domain([0, 1])
    .range([colorLightShade1, themes[theme].colorAccentShade3]);

  const handleDownload = () => {
    if (refSVG.current) {
      FileSaver.saveAs(
        new Blob([refSVG.current.outerHTML], { type: 'image/svg;charset=utf-8' }),
        `${configuration}_${Date.now()}.svg`);
    }
  };

  const handleUpdateConfiguration = () => {
    onUpdateUrlState({ configuration: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleUpdateConfiguration();
  };

  return (
    <Flex backgroundColor="text-shade-1" direction="vertical" gap="x1" grow>
      <Flex
          alignChildrenVertical="middle"
          backgroundColor="background-shade-1"
          direction="horizontal"
          gap="x6"
          paddingHorizontal="x6"
          paddingVertical="x2">
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

        <Flex>
          <List gap="x2">
            <ListItem separator="|">
              <Link title="Library" to={ `/library${location.search}` }>
                <Icon name="Book" size="1.25rem" />
              </Link>
            </ListItem>

            <ListItem separator="|">
              <Link title="Settings" to={ `/settings${location.search}` }>
                <Icon name="Cog" size="1.25rem" />
              </Link>
            </ListItem>

            <ListItem separator="|">
              <Link title="About" to={ `/about${location.search}` }>
                <Icon name="Info" size="1.25rem" />
              </Link>
            </ListItem>

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

      <Flex backgroundColor="background-shade-3" direction="vertical" grow>
        <TilingRenderer
            animate={ animate }
            colorScale={ colorScale }
            configuration={ configuration }
            disableColoring={ disableColoring }
            disableRepeating={ disableRepeating }
            fadeConnectedShapes={ fadeConnectedShapes }
            maxRepeat={ maxRepeat }
            ref={ refSVG }
            shapeSize={ shapeSize }
            showAxis={ showAxis }
            showTransforms={ showTransforms } />

        <Switch>
          <Route component={ About } path="/about" />
          <Route component={ TilingLibrary } path="/library" />
          <Route component={ TilingSettings } path="/settings" />
        </Switch>
      </Flex>

      <Flex direction="horizontal" gap="x1">
        <Flex
            alignChildrenVertical="middle"
            backgroundColor="background-shade-1"
            direction="horizontal"
            grow>
          <Flex basis="none" grow>
            <Form onSubmit={ handleSubmit }>
              <Text
                  align="middle"
                  className="TilingEditor__input"
                  monospace
                  onChange={ (event) => setValue((event.target as HTMLInputElement).value) }
                  paddingHorizontal="x6"
                  paddingVertical="x3"
                  size="x2"
                  strong
                  tag="input"
                  value={ value } />
            </Form>
          </Flex>
        </Flex>

        <Flex backgroundColor="background-shade-1">
          <Link
              display="block"
              onClick={ handleUpdateConfiguration }
              paddingHorizontal="x6"
              paddingVertical="x3"
              size="x2"
              strong>
            <Icon name="Refresh" size="1.25rem" />
          </Link>
        </Flex>

        <Flex backgroundColor="background-shade-1">
          <Link
              display="block"
              onClick={ handleDownload }
              paddingHorizontal="x6"
              paddingVertical="x3"
              size="x2"
              strong>
            <Icon name="Save" size="1.25rem" />
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
};

