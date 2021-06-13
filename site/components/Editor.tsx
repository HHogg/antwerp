import * as React from 'react';
import FileSaver from 'file-saver';
import { Box, Form, Icon, Input, Link, Tooltip } from 'preshape';
import { Antwerp } from '@hhogg/antwerp';
import { URLStateContext } from './URLState';
import { RootContext } from './Root';
import getColorScale from '../utils/getColorScale';

export default () => {
  const {
    animate,
    colorMethod,
    colorScale,
    configuration,
    maxRepeat,
    onUpdateUrlState,
    showAxis15,
    showAxis90,
    shapeSize,
    showTransforms,
    showVertices,
  } = React.useContext(URLStateContext);

  const refSVG = React.useRef<SVGSVGElement>(null);
  const [value, setValue] = React.useState<string>(configuration);
  const { theme } = React.useContext(RootContext);
  const worker = React.useMemo(() => new Worker('../../src/AntwerpWorker.js'), []);

  React.useEffect(() => {
    setValue(configuration);
  }, [configuration]);

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
    <Box
        backgroundColor="text-shade-1"
        flex="vertical"
        gap="x1"
        grow>
      <Box
          backgroundColor="background-shade-3"
          flex="vertical"
          grow>
        <Antwerp
            animateInterval={ animate ? 250 : 0 }
            colorMethod={ colorMethod }
            colorScale={ getColorScale(colorScale, theme) }
            configuration={ configuration }
            grow
            maxRepeat={ maxRepeat }
            refSvg={ refSVG }
            shapeSize={ shapeSize }
            showAxis15={ showAxis15 }
            showAxis90={ showAxis90 }
            showTransforms={ showTransforms }
            showVertices={ showVertices }
            worker={ worker } />
      </Box>

      <Box
          flex="horizontal"
          gap="x1">
        <Box
            alignChildrenVertical="middle"
            backgroundColor="background-shade-1"
            flex="horizontal"
            grow>
          <Box basis="0" grow>
            <Form onSubmit={ handleSubmit }>
              <Input
                  align="middle"
                  monospace
                  onChange={ (event) => setValue((event.target as HTMLInputElement).value) }
                  paddingHorizontal="x6"
                  paddingVertical="x3"
                  size="x2"
                  value={ value } />
            </Form>
          </Box>
        </Box>

        <Box backgroundColor="background-shade-1">
          <Tooltip content="Refresh">
            { (props) => (
              <Link { ...props }
                  display="block"
                  onClick={ handleUpdateConfiguration }
                  paddingHorizontal="x6"
                  paddingVertical="x3"
                  size="x2"
                  strong>
                <Icon name="Refresh" size="1.25rem" />
              </Link>
            ) }
          </Tooltip>
        </Box>

        <Box backgroundColor="background-shade-1">
          <Tooltip content="Save to SVG">
            { (props) => (
              <Link { ...props }
                  display="block"
                  onClick={ handleDownload }
                  paddingHorizontal="x6"
                  paddingVertical="x3"
                  size="x2"
                  strong>
                <Icon name="Save" size="1.25rem" />
              </Link>
            ) }
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

