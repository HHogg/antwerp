import * as React from 'react';
import { useResizeObserver, Alert, Appear, Flex, FlexProps, Text } from 'preshape';
import { AntwerpData } from './Types';
import AntwerpDrawer from './AntwerpDrawer';
import toShapes from './toShapes';

export interface AntwerpProps extends FlexProps {
  animate?: boolean;
  colorMethod?: 'placement' | 'transform';
  colorScale?: (t: number) => string;
  configuration: string;
  disableRepeating?: boolean;
  maxRepeat?: number;
  shapeSize: number;
  showAxis?: boolean;
  showTransforms?: boolean;
  refSvg?: React.Ref<SVGSVGElement | null>;
  worker?: Worker;
}

const Antwerp = (props: AntwerpProps) => {
  const {
    animate,
    colorMethod,
    colorScale,
    configuration,
    disableRepeating,
    maxRepeat,
    shapeSize,
    showAxis,
    showTransforms,
    refSvg,
    worker,
    ...rest
  } = props;

  const [size, refSize, sizeNode] = useResizeObserver<HTMLDivElement>();
  const refDrawer = React.useRef<AntwerpDrawer>();
  const refWorker = React.useRef<Worker>();
  const [data, setData] = React.useState<AntwerpData | null>();

  React.useLayoutEffect(() => {
    if (sizeNode && !refDrawer.current) {
      refDrawer.current = new AntwerpDrawer(sizeNode);

      if (refSvg) {
        refSvg.current = sizeNode.firstChild as SVGSVGElement;
      }
    }
  }, [sizeNode]);

  React.useEffect(() => {
    if (worker && !refWorker.current) {
      refWorker.current = worker;
      refWorker.current.onmessage = ({ data }) => setData(data);
    } else if (!worker && refWorker.current) {
      refWorker.current.terminate();
    }

    return () => {
      if (refWorker.current) {
        refWorker.current.terminate();
      }
    };
  }, [worker]);

  React.useEffect(() => {
    const options = {
      configuration: configuration,
      disableRepeating: disableRepeating,
      height: size.height,
      maxRepeat: maxRepeat === undefined || maxRepeat < 0 ? undefined : maxRepeat,
      shapeSize: shapeSize,
      width: size.width,
    };

    if (size.height && size.width) {
      if (refWorker.current) {
        refWorker.current.postMessage(options);
      } else {
        setData(toShapes(options));
      }
    }
  }, [configuration, disableRepeating, maxRepeat, shapeSize, size]);

  React.useEffect(() => {
    if (data) {
      refDrawer.current?.draw(size.height, size.width, data, {
        animate,
        colorMethod,
        colorScale,
        showAxis,
        showTransforms,
      });
    }
  }, [animate, colorMethod, colorScale, data]);

  React.useEffect(() => {
    if (showAxis) {
      refDrawer.current?.drawAxis();
    } else {
      refDrawer.current?.removeAxis();
    }
  }, [showAxis]);

  React.useEffect(() => {
    if (showTransforms) {
      refDrawer.current?.drawTransforms();
    } else {
      refDrawer.current?.removeTransforms();
    }
  }, [showTransforms]);

  return (
    <Flex { ...rest } container>
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
};

export default Antwerp;
