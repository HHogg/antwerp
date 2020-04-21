import * as React from 'react';
import groupBy from 'lodash.groupby';
import { Button, Buttons, Flex, Grid, Text } from 'preshape';
import configurations from '../../configurations.json';
import { URLStateContext } from './URLState';
import LibraryEntry from './LibraryEntry';

export default () => {
  const { configuration, onUpdateUrlState, push } = React.useContext(URLStateContext);
  const [group, setGroup] = React.useState<'vertices' | 'wallpaper'>('vertices');
  const groupedConfigurations = groupBy(configurations, group);

  if (groupedConfigurations['']) {
    const group = groupedConfigurations[''];
    delete groupedConfigurations[''];
    groupedConfigurations[''] = group;
  }

  const handleClose = () => {
    push('/');
  };

  const handleSelect = (configuration: string) => {
    onUpdateUrlState({ configuration });
    handleClose();
  };

  return (
    <Flex
        direction="vertical"
        grow
        maxWidth="1016px"
        padding="x6">
      <Flex
          alignChildrenHorizontal="between"
          alignChildrenVertical="middle"
          direction="horizontal"
          margin="x6">
        <Flex>
          <Text size="x3" strong>Tiling Library</Text>
        </Flex>

        <Flex>
          <Buttons alignChildrenHorizontal="end">
            <Button onPointerUp={ () => setGroup(group === 'vertices' ? 'wallpaper' : 'vertices') }>
              Group by: { group }
            </Button>
          </Buttons>
        </Flex>
      </Flex>

      { Object
          .entries(groupedConfigurations)
          .map(([groupKey, configurations]) => (
            <Flex key={ groupKey } margin="x12">
              <Flex margin="x6">
                <Text strong>
                  { groupKey || 'No Defined Wallpaper Group' }
                </Text>
              </Flex>

              <Flex>
                <Grid
                    gap="x6"
                    repeatWidth="224px">
                  { configurations.map((config) => (
                    <LibraryEntry { ...config }
                        active={ configuration === config.gomJauHogg }
                        key={ config.gomJauHogg }
                        onClick={ handleSelect } />
                  )) }
                </Grid>
              </Flex>
            </Flex>
          )) }
    </Flex>
  );
};
