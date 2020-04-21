import * as React from 'react';
import { Antwerp } from 'antwerp';
import { Flex, Link, LinkProps, Text } from 'preshape';
import { Configuration } from '../Types';
import getColorScale from '../utils/getColorScale';

interface Props extends Configuration, LinkProps {
  active: boolean;
  onClick: (configuration: string) => void;
}

export default (props: Props) => {
  const {
    active,
    cundyRollett,
    gomJauHogg,
    onClick,
    vertices,
    wallpaper,
    ...rest
  } = props;

  const worker = React.useMemo(() => new Worker('../../src/AntwerpWorker.js'), []);

  return (
    <Link { ...rest }
        active={ active }
        borderSize="x1"
        display="block"
        key={ gomJauHogg }
        minWidth="0"
        onClick={ () => onClick(gomJauHogg) }
        padding="x3">
      <Flex margin="x3">
        <Antwerp
            colorScale={ getColorScale('Spectral', 'day') }
            configuration={ gomJauHogg }
            height="200px"
            maxRepeat={ 3 }
            shapeSize={ 50 }
            showAxis
            showTransforms
            worker={ worker } />
      </Flex>

      <Text ellipsis size="x1" strong>{ cundyRollett }</Text>
      <Text ellipsis size="x1" strong>{ gomJauHogg }</Text>
      <Text ellipsis size="x1">{ vertices }</Text>
      <Text ellipsis size="x1">{ wallpaper }</Text>
    </Link>
  );
};
