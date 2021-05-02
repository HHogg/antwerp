import * as React from 'react';
import { useResizeObserver, Alert, Appear, Flex, FlexProps, Text } from 'preshape';
import { AntwerpData, AntwerpOptions } from './Types';
import AntwerpDrawer from './AntwerpDrawer';
import { AntwerpQueueContext } from './AntwerpQueue';
import toShapes from './toShapes';

export interface AntwerpProps extends FlexProps {
  animateInterval?: number;
  colorMethod?: 'placement' | 'transform';
  colorScale?: (t: number) => string;
  configuration: string;
  maxRepeat?: number;
  shapeSize: number;
  showAxis15?: boolean;
  showAxis90?: boolean;
  showTransforms?: boolean;
  showVertices?: boolean;
  refSvg?: React.MutableRefObject<SVGSVGElement | null>;
  worker?: Worker;
}

const Antwerp = React.forwardRef<HTMLDivElement, AntwerpProps>((props, ref) => {
  const {
    animateInterval,
    colorMethod,
    colorScale,
    configuration,
    maxRepeat,
    shapeSize,
    showAxis15,
    showAxis90,
    showTransforms,
    showVertices,
    refSvg,
    worker,
    ...rest
  } = props;

  const { pushToQueue } = React.useContext(AntwerpQueueContext);
  const [size, refSize, sizeNode] = useResizeObserver<HTMLDivElement>();
  const refDrawer = React.useRef<AntwerpDrawer>();
  const refShouldSetData = React.useRef(true);
  const refWorker = React.useRef<Worker>();
  const [data, setData] = React.useState<AntwerpData | null>();

  const handleSetData = (data: AntwerpData) => {
    if (refShouldSetData.current) {
      setData(data);
    }
  };

  React.useLayoutEffect(() => {
    if (sizeNode && !refDrawer.current) {
      refDrawer.current = new AntwerpDrawer(sizeNode);

      if (refSvg) {
        refSvg.current = sizeNode.firstChild as SVGSVGElement;
      }
    }

    return () => {
      if (refDrawer.current) {
        refDrawer.current.destroy();
        refDrawer.current = undefined;
      }
    };
  }, [sizeNode]);

  React.useEffect(() => {
    if (worker && !refWorker.current && !pushToQueue) {
      refWorker.current = worker;
      refWorker.current.onmessage = ({ data }) => handleSetData(data);
    } else if ((!worker || pushToQueue) && refWorker.current) {
      refWorker.current.terminate();
    }
  }, [pushToQueue, worker]);

  React.useEffect(() => {
    const options: AntwerpOptions = {
      configuration: configuration,
      height: size.height,
      maxRepeat: maxRepeat === undefined || maxRepeat < 0 ? undefined : maxRepeat,
      shapeSize: shapeSize,
      width: size.width,
    };

    if (size.height && size.width) {
      if (pushToQueue) {
        pushToQueue(options).then(handleSetData);
      } else if (refWorker.current) {
        refWorker.current.postMessage(options);
      } else {
        setData(toShapes(options));
      }
    }
  }, [configuration, pushToQueue, maxRepeat, shapeSize, size]);

  React.useEffect(() => {
    if (data) {
      refDrawer.current?.draw(size.height, size.width, data, {
        animateInterval,
        colorMethod,
        colorScale,
        showAxis15,
        showAxis90,
        showTransforms,
        showVertices,
      });
    }
  }, [
    animateInterval,
    colorMethod,
    colorScale,
    data,
    showAxis15,
    showAxis90,
    showTransforms,
    showVertices,
    size.height,
    size.width,
  ]);

  React.useEffect(() => {
    return () => {
      refShouldSetData.current = false;
    };
  }, []);

  return (
    <Flex { ...rest } container ref={ ref }>
      <Flex
          absolute="edge-to-edge"
          backgroundColor="background-shade-3"
          ref={ refSize } />

      <Flex
          absolute="edge-to-edge"
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
    </Flex>
  );
});

export default Antwerp;
