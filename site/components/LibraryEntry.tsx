import * as React from 'react';
import { Antwerp } from '@hhogg/antwerp';
import { Box, Link, LinkProps, Text } from 'preshape';
import { Configuration } from '../Types';
import getColorScale from '../utils/getColorScale';
import { URLStateContext } from './URLState';
import { RootContext } from './Root';

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

  const {
    colorMethod,
    colorScale,
    showTransforms,
  } = React.useContext(URLStateContext);

  const {
    theme,
  } = React.useContext(RootContext);

  return (
    <Link { ...rest }
        active={ active }
        borderSize="x1"
        display="block"
        key={ gomJauHogg }
        minWidth="0"
        onClick={ () => onClick(gomJauHogg) }
        padding="x3">
      <Box margin="x3">
        <Antwerp
            colorMethod={ colorMethod }
            colorScale={ getColorScale(colorScale, theme) }
            configuration={ gomJauHogg }
            height="200px"
            maxRepeat={ 3 }
            shapeSize={ 30 }
            showTransforms={ showTransforms } />
      </Box>

      <Text ellipsis size="x1" strong>{ cundyRollett }</Text>
      <Text ellipsis size="x1" strong>{ gomJauHogg }</Text>
      <Text ellipsis size="x1">{ vertices }</Text>
      <Text ellipsis size="x1">{ wallpaper }</Text>
    </Link>
  );
};
