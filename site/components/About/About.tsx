import * as React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Text,
  Separator,
} from 'preshape';
import { version } from '../../../package.json';
import URLStateContext from '../URLState/URLStateContext';

export default () => {
  const { pushWithState } = React.useContext(URLStateContext);

  const handleClose = () => {
    pushWithState('/');
  };

  return (
    <Modal
        margin="x6"
        maxWidth="600px"
        onClose={ handleClose }
        padding="x6"
        visible>
      <ModalHeader />
      <ModalBody>
        <Text strong>ANTWERP v{ version }</Text>
        <Text size="x1" strong>
          Application for Nets and Tessellations
          With Edge-to-edge Regular Polygons
        </Text>

        <Separator margin="x6" />

        <Text margin="x2" size="x1" tag="div">
          <Text strong>Harrison Hogg</Text>
          <Text>Software Engineer</Text>
        </Text>

        <Text margin="x2" size="x1" tag="div">
          <Text strong>Valentin Gomez Jauregui</Text>
          <Text>Professor of Graphic Expression in Engineering</Text>
          <Text>University of Cantabria</Text>
        </Text>
      </ModalBody>
    </Modal>
  );
};
