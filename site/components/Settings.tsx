import * as React from 'react';
import {
  CheckBox,
  Icon,
  Input,
  InputAddon,
  InputLabel,
  Modal,
  ModalBody,
  ModalHeader,
  Placement,
  PlacementManager,
  PlacementReference,
  Option,
  Options,
  Text,
} from 'preshape';
import { URLState, URLStateContext } from './URLState';
import { colorScales } from '../utils/getColorScale';

export default () => {
  const {
    animate,
    colorMethod,
    colorScale,
    maxRepeat,
    onUpdateUrlState,
    push,
    showAxis15,
    showAxis90,
    shapeSize,
    showTransforms,
  } = React.useContext(URLStateContext);

  const [maxRepeatState, setMaxRepeatState] = React.useState(maxRepeat.toString());
  const [shapeSizeState, setShapeSizeState] = React.useState(shapeSize.toString());

  const handleClose = () => {
    push('/');
  };

  const handleNumberChange = (event: React.FormEvent<HTMLInputElement>, setState: (value: string) => void, prop: keyof URLState, min: number = -Infinity, max: number = Infinity) => {
    const { value } = event.target as HTMLInputElement;
    const number = Math.max(min, Math.min(max, parseFloat(value)));

    setState(value);

    if (!isNaN(number)) {
      onUpdateUrlState({ [prop]: number });
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
            margin="x1"
            onChange={ () => onUpdateUrlState({ animate: !animate }) }>
          Animate Stages
        </CheckBox>

        <PlacementManager trigger="click">
          <PlacementReference>
            { (props, { visible }) => (
              <InputLabel clickable { ...props } margin="x1">
                <Input readOnly titlecase value={ `Color by: ${colorMethod}` } />
                <InputAddon>
                  <Icon name={ visible ? 'ChevronUp' : 'ChevronDown' } size="1.25rem" />
                </InputAddon>
              </InputLabel>
            ) }
          </PlacementReference>

          <Placement
              elevate
              minWidth="reference"
              textColor="text-shade-1"
              theme="day"
              unrender
              zIndex={ 1 }>
            <Options>
              <Option
                  checked={ colorMethod === 'placement' }
                  onChange={ () => onUpdateUrlState({ colorMethod: 'placement' }) }>
                Placement
              </Option>
              <Option
                  checked={ colorMethod === 'transform' }
                  onChange={ () => onUpdateUrlState({ colorMethod: 'transform' }) }>
                Transform
              </Option>
            </Options>
          </Placement>
        </PlacementManager>

        <PlacementManager trigger="click">
          <PlacementReference>
            { (props, { visible }) => (
              <InputLabel clickable { ...props } margin="x1">
                <Input readOnly value={ `Color scale: ${colorScale}` } />
                <InputAddon>
                  <Icon name={ visible ? 'ChevronUp' : 'ChevronDown' } size="1.25rem" />
                </InputAddon>
              </InputLabel>
            ) }
          </PlacementReference>

          <Placement
              elevate
              minWidth="reference"
              textColor="text-shade-1"
              theme="day"
              unrender
              zIndex={ 1 }>
            <Options>
              { colorScales.map((cs) => (
                <Option
                    checked={ colorScale === cs }
                    key={ cs }
                    onChange={ () => onUpdateUrlState({ colorScale: cs }) }>
                  { cs }
                </Option>
              )) }
            </Options>
          </Placement>
        </PlacementManager>

        <CheckBox
            checked={ showAxis15 }
            margin="x1"
            onChange={ () => onUpdateUrlState({ showAxis15: !showAxis15 }) }>
          Show Angle Guides 15°
        </CheckBox>

        <CheckBox
            checked={ showAxis90 }
            margin="x1"
            onChange={ () => onUpdateUrlState({ showAxis90: !showAxis90 }) }>
          Show Angle Guides 90°
        </CheckBox>

        <CheckBox
            checked={ showTransforms }
            margin="x1"
            onChange={ () => onUpdateUrlState({ showTransforms: !showTransforms }) }>
          Show Transformations
        </CheckBox>

        <InputLabel label="Maximum Transform Repeats" margin="x1">
          <Input
              onChange={ (e) => handleNumberChange(e, setMaxRepeatState, 'maxRepeat', -1) }
              placeholder="Maximum transform repeats..."
              type="number"
              value={ maxRepeatState } />
        </InputLabel>

        <InputLabel label="Shape Size" margin="x1">
          <Input
              onChange={ (e) => handleNumberChange(e, setShapeSizeState, 'shapeSize', 60, 200) }
              placeholder="Shape size..."
              type="number"
              value={ shapeSizeState } />
        </InputLabel>
      </ModalBody>
    </Modal>
  );
};
