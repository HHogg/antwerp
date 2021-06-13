import * as React from 'react';
import groupBy from 'lodash.groupby';
import { AntwerpQueue } from '@hhogg/antwerp';
import { Button, Buttons, Box, Grid, Text } from 'preshape';
import configurations from '../../configurations.json';
import { URLStateContext } from './URLState';
import LibraryEntry from './LibraryEntry';

export default () => {
  const { configuration, onUpdateUrlState, push } = React.useContext(URLStateContext);
  const [group, setGroup] = React.useState<'vertices' | 'wallpaper'>('vertices');
  const groupedConfigurations = groupBy(configurations, group);
  const workers = React.useMemo(() => Array.from({ length: 5 }).map(() => new Worker('../../src/AntwerpWorker.js')), []);

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
    <Box
        flex="vertical"
        grow
        maxWidth="1016px"
        padding="x6">
      <Box
          alignChildrenVertical="middle"
          flex="horizontal"
          gap="x4"
          margin="x6">
        <Box grow>
          <Text size="x3" strong>Tiling Library</Text>
        </Box>

        <Box>
          <Buttons>
            <Buttons alignChildrenHorizontal="end">
              <Button onPointerUp={ () => setGroup(group === 'vertices' ? 'wallpaper' : 'vertices') }>
                Group by: { group }
              </Button>
            </Buttons>
          </Buttons>
        </Box>
      </Box>

      <AntwerpQueue workers={ workers }>
        { Object
            .entries(groupedConfigurations)
            .map(([groupKey, configurations]) => (
              <Box key={ groupKey } margin="x12">
                <Box margin="x6">
                  <Text strong>
                    { groupKey || 'No Defined Wallpaper Group' }
                  </Text>
                </Box>

                <Box>
                  <Grid
                      gap="x6"
                      repeatWidth="224px">
                    { configurations.map((config, index) => (
                      <LibraryEntry { ...config }
                          active={ configuration === config.gomJauHogg }
                          key={ config.gomJauHogg || config.cundyRollett || index }
                          onClick={ handleSelect } />
                    )) }
                  </Grid>
                </Box>
              </Box>
            )) }
      </AntwerpQueue>
    </Box>
  );
};
