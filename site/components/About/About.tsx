import * as React from 'react';
import {
  Flex,
  Text,
  Separator,
} from 'preshape';
import { version } from '../../../package.json';
import URLStateContext from '../URLState/URLStateContext';
import Modal from '../Modal/Modal';

export default () => {
  const { pushWithState } = React.useContext(URLStateContext);

  const handleClose = () => {
    pushWithState('/');
  };

  return (
    <Modal
        maxWidth="600px"
        onClose={ handleClose }
        title="About"
        visible>
      <Flex padding="x6">
        <Text strong>ANTWERP v{ version }</Text>
        <Text size="x1" strong>
          Application for Nets and Tessellations
          With Edge-to-edge Regular Polygons
        </Text>

        <Separator margin="x6" />

        <Text margin="x2" size="x1">
          <Text strong>Harrison Hogg</Text>
          <Text>Software Engineer</Text>
        </Text>

        <Text margin="x2" size="x1">
          <Text strong>Valentin Gomez Jauregui</Text>
          <Text>Professor of Graphic Expression in Engineering</Text>
          <Text>University of Cantabria</Text>
        </Text>
      </Flex>
    </Modal>
  );
};
