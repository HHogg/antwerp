import * as React from 'react';
import { CheckBox, Flex, Input, Modal, ModalBody, ModalHeader, Text } from 'preshape';
import { URLState } from '../URLState/URLState';
import URLStateContext from '../URLState/URLStateContext';

export default () => {
  const {
    animate,
    disableColoring,
    disableRepeating,
    fadeConnectedShapes,
    maxRepeat,
    onUpdateURLState,
    pushWithState,
    showAxis,
    shapeSize,
    showTransforms,
  } = React.useContext(URLStateContext);

  const [maxRepeatState, setMaxRepeatState] = React.useState(maxRepeat.toString());
  const [shapeSizeState, setShapeSizeState] = React.useState(shapeSize.toString());

  const handleClose = () => {
    pushWithState('/');
  };

  const handleNumberChange = (event: React.FormEvent<HTMLInputElement>, setState: (value: string) => void, prop: keyof URLState, min: number = -Infinity, max: number = Infinity) => {
    const { value } = event.target as HTMLInputElement;
    const number = Math.max(min, Math.min(max, parseFloat(value)));

    setState(value);

    if (!isNaN(number)) {
      onUpdateURLState({ [prop]: number });
    }
  };

  return (
    <Modal
        gap="x6"
        maxWidth="24rem"
        onClose={ handleClose }
        padding="x6"
        visible>
      <ModalHeader>
        <Text strong>Settings</Text>
      </ModalHeader>

      <ModalBody>
        <CheckBox
            checked={ animate }
            label="Animate Stages"
            margin="x2"
            onChange={ () => onUpdateURLState({ animate: !animate }) } />

        <CheckBox
            checked={ disableColoring }
            label="Disable Colouring"
            margin="x2"
            onChange={ () => onUpdateURLState({ disableColoring: !disableColoring }) } />

        <CheckBox
            checked={ disableRepeating }
            label="Disable Repeating"
            margin="x2"
            onChange={ () => onUpdateURLState({ disableRepeating: !disableRepeating }) } />

        <CheckBox
            checked={ fadeConnectedShapes }
            label="Fade Connected Shapes"
            margin="x2"
            onChange={ () => onUpdateURLState({ fadeConnectedShapes: !fadeConnectedShapes })} />

        <CheckBox
            checked={ showAxis }
            label="Show Axis"
            margin="x2"
            onChange={ () => onUpdateURLState({ showAxis: !showAxis }) } />

        <CheckBox
            checked={ showTransforms }
            label="Show Transformations"
            margin="x2"
            onChange={ () => onUpdateURLState({ showTransforms: !showTransforms }) } />

        <Input
            label="Maximum Transform Repeats"
            margin="x2"
            onChange={ (e) => handleNumberChange(e, setMaxRepeatState, 'maxRepeat', 1) }
            placeholder="Maximum transform repeats..."
            type="number"
            value={ maxRepeatState } />

        <Input
            label="Shape Size"
            margin="x2"
            onChange={ (e) => handleNumberChange(e, setShapeSizeState, 'shapeSize', 60, 200) }
            placeholder="Shape size..."
            type="number"
            value={ shapeSizeState } />
      </ModalBody>

    </Modal>
  );
};
