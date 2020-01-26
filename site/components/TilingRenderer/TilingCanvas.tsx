import * as React from 'react';
import { Alert, Appear, Base, Flex, Text } from 'preshape';
import TilingDrawer from './TilingDrawer';
import { URLState } from '../URLState/URLState';

interface Props extends URLState {
  colorScale?: (t: number) => string;
  configuration: string;
  height: number;
  width: number;
}

export default React.forwardRef<SVGSVGElement, Props>((props, ref) => {
  const {
    animate,
    colorScale,
    configuration,
    disableColoring,
    disableRepeating,
    fadeConnectedShapes,
    height,
    maxRepeat,
    shapeSize,
    showAxis,
    showTransforms,
    width,
  } = props;

  const refContainer = React.useRef<HTMLDivElement>(null);
  const refDrawer = React.useRef<TilingDrawer>();
  const refWorker = React.useRef<Worker>();
  const [data, setData] = React.useState();

  React.useEffect(() => {
    refWorker.current = new Worker('./AntwerpWorker.js');
    refWorker.current.onmessage = ({ data }) => {
      setData(data);
    };

    return () => {
      if (refWorker.current) {
        refWorker.current.terminate();
      }
    };
  }, []);

  React.useEffect(() => {
    if (refContainer.current && !refDrawer.current) {
      refDrawer.current = new TilingDrawer(refContainer.current);
      ref.current = refDrawer.current.two.renderer.domElement;
    }

    return () => {
      if (refDrawer.current) {
        refDrawer.current.destroy();
      }
    };
  }, [refContainer.current]);

  React.useEffect(() => {
    if (refWorker.current) {
      refWorker.current.postMessage({
        configuration,
        disableRepeating,
        height,
        maxRepeat,
        shapeSize,
        width,
      });
    }
  }, [configuration, disableRepeating, height, maxRepeat, shapeSize, width]);

  React.useEffect(() => {
    if (refDrawer.current && data) {
      refDrawer.current.draw(height, width, data, {
        animate: animate,
        colorScale: disableColoring ? undefined : colorScale,
        fadeConnectedShapes: fadeConnectedShapes,
        showAxis: showAxis,
        showTransforms: showTransforms,
      });
    }
  }, [animate, colorScale, data, disableColoring, fadeConnectedShapes]);

  React.useEffect(() => {
    if (refDrawer.current && data) {
      if (showAxis) {
        refDrawer.current.drawAxis();
      } else {
        refDrawer.current.removeAxis();
      }
    }
  }, [showAxis]);

  React.useEffect(() => {
    if (refDrawer.current && data) {
      if (showTransforms) {
        refDrawer.current.drawTransforms();
      } else {
        refDrawer.current.removeTransforms();
      }
    }
  }, [showTransforms]);

  return (
    <Appear animation="Fade">
      <Base
          absolute="fullscreen"
          backgroundColor="background-shade-3"
          ref={ refContainer } />

      <Flex
          absolute="fullscreen"
          alignChildrenVertical="end"
          direction="vertical"
          padding="x2">
        <Appear animation="Pop" visible={ !!(data && data.error) }>
          <Alert color="negative" fill padding="x2">
            { data && data.error && (
              <Text size="x1">
                <Text inline strong>
                  <Text
                      backgroundColor="text-shade-1"
                      inline
                      paddingHorizontal="x1"
                      textColor="negative-shade-1">ERROR</Text> { data.error.type }:
                </Text> { data.error.message }
              </Text>
            ) }
          </Alert>
        </Appear>
      </Flex>
    </Appear>
  );
});
