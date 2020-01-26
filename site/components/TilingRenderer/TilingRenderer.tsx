import * as React from 'react';
import {
  useIntersectionObserver,
  useResizeObserver,
  Base,
  Flex,
  FlexProps,
} from 'preshape';
import getMergedRef from '../../utils/getMergedRef';
import { URLState } from '../URLState/URLState';
import TilingCanvas from './TilingCanvas';

interface Props extends FlexProps, URLState {
  colorScale?: (t: number) => string;
  configuration: string;
}

export default React.forwardRef<SVGSVGElement, Props>((props, ref) => {
  const {
    animate,
    colorScale,
    configuration,
    disableColoring,
    disableRepeating,
    fadeConnectedShapes,
    maxRepeat,
    showAxis,
    shapeSize,
    showTransforms,
    ...rest
  } = props;

  const [isInView, refIsInView] = useIntersectionObserver();
  const [size, refSize] = useResizeObserver();
  const refContainer = getMergedRef(refIsInView, refSize);

  return (
    <Flex { ...rest } container grow ref={ refContainer }>
      <Base absolute="fullscreen">
        { !!size.height && !!size.width && (
          <TilingCanvas
              animate={ isInView && animate }
              colorScale={ colorScale }
              configuration={ configuration }
              disableColoring={ disableColoring }
              disableRepeating={ disableRepeating }
              fadeConnectedShapes={ fadeConnectedShapes }
              height={ size.height }
              maxRepeat={ maxRepeat }
              ref={ ref }
              shapeSize={ shapeSize }
              showAxis={ showAxis }
              showTransforms={ showTransforms }
              width={ size.width } />
        ) }
      </Base>
    </Flex>
  );
});
