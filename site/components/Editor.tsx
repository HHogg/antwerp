import * as React from 'react';
import FileSaver from 'file-saver';
import { Flex, Form, Icon, Input, Link } from 'preshape';
import { Antwerp } from 'antwerp';
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
    showAxis,
    shapeSize,
    showTransforms,
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
    <Flex
        backgroundColor="text-shade-1"
        direction="vertical"
        gap="x1"
        grow>
      <Flex
          backgroundColor="background-shade-3"
          direction="vertical"
          grow>
        <Antwerp
            animate={ animate }
            colorMethod={ colorMethod }
            colorScale={ getColorScale(colorScale, theme) }
            configuration={ configuration }
            grow
            maxRepeat={ maxRepeat }
            refSvg={ refSVG }
            shapeSize={ shapeSize }
            showAxis={ showAxis }
            showTransforms={ showTransforms }
            worker={ worker } />
      </Flex>

      <Flex
          direction="horizontal"
          gap="x1">
        <Flex
            alignChildrenVertical="middle"
            backgroundColor="background-shade-1"
            direction="horizontal"
            grow>
          <Flex basis="none" grow>
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

