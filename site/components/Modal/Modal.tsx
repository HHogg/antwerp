import * as React from 'react';
import { createPortal } from 'react-dom';
import { Appear, Flex, AppearProps, Icon, Link, Text, Separator, useMatchMedia } from 'preshape';

interface Props extends AppearProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  maxWidth: string;
  onClose?: () => void;
  title?: string;
  visible: boolean;
}

const Modal: React.FunctionComponent<Props> = (props: Props) => {
  const {
    children,
    fullHeight,
    maxWidth,
    onClose,
    padding = 'x10',
    title,
    visible,
    width,
    ...rest
  } = props;

  const [render, setRender] = React.useState(props.visible);
  const refModal = React.useRef<HTMLDivElement>(null);
  const match = useMatchMedia([maxWidth]);

  React.useEffect(() => {
    if (visible) {
      setRender(true);
    }
  }, [visible]);

  const handleOnAnimateComplete = () => {
    if (!visible) {
      setRender(false);
    }
  };

  const handlePointerUp = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    if ((!refModal.current || !refModal.current.contains(event.target as Element)) && onClose) {
      onClose();
    }
  };

  if (!render) {
    return null;
  }

  return createPortal(
    <Appear { ...rest }
        alignChildren="middle"
        animation="FadeSlideUp"
        backgroundColor="overlay"
        direction="vertical"
        fixed="fullscreen"
        onAnimationComplete={ handleOnAnimateComplete }
        onPointerUp={ handlePointerUp }
        padding={ match(maxWidth) ? padding : 'x0' }
        visible={ visible }>
      <Flex
          backgroundColor="background-shade-1"
          direction="vertical"
          grow={ fullHeight || !match(maxWidth) }
          maxWidth={ maxWidth }
          ref={ refModal }
          shrink
          width={ width }>
        <Flex
            alignChildrenVertical="middle"
            direction="horizontal"
            gap="x6"
            paddingHorizontal="x6"
            paddingVertical="x6">
          <Flex grow>
            <Text strong>{ title }</Text>
          </Flex>

          { onClose && (
            <Flex>
              <Link onPointerUp={ () => onClose() }>
                <Icon name="Cross" size="1.5rem" />
              </Link>
            </Flex>
          ) }
        </Flex>

        <Flex>
          <Separator borderSize="x2" />
        </Flex>

        <Flex
            direction="vertical"
            grow
            shrink>
          { children }
        </Flex>
      </Flex>
    </Appear>
  , document.body);
};

export default Modal;
