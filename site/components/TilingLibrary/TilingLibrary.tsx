import * as React from 'react';
import groupBy from 'lodash.groupby';
import {
  useMatchMedia,
  Base,
  Flex,
  Grid,
  Link,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from 'preshape';
import configurations from '../../../configurations.json';
import URLStateContext from '../URLState/URLStateContext';

const ShortNamesMap: {
  [key: string]: string;
} = {
  '3-Uniform (2 Vertex Types)': '3-Uniform (2V)',
  '3-Uniform (3 Vertex Types)': '3-Uniform (3V)',
  '4-Uniform (3 Vertex Types)': '4-Uniform (3V)',
};

export default () => {
  const { configuration, onUpdateURLState, pushWithState } = React.useContext(URLStateContext);
  const match = useMatchMedia(['600px']);
  const [group, setGroup] = React.useState<'vertices' | 'wallpaper'>('vertices');
  const groupedConfigurations = groupBy(configurations, group);

  if (groupedConfigurations['']) {
    const group = groupedConfigurations[''];
    delete groupedConfigurations[''];
    groupedConfigurations[''] = group;
  }

  const handleClose = () => {
    pushWithState('/');
  };

  const handleSelect = (configuration: string) => {
    onUpdateURLState({ configuration });
    handleClose();
  };

  return (
    <Modal
        fullscreen
        margin="x6"
        maxWidth="800px"
        onClose={ handleClose }
        visible>
      <ModalHeader padding="x6">
        <Text strong>Library</Text>
      </ModalHeader>

      <ModalBody>
        <Flex paddingHorizontal="x6">
          <Text align="end">
            <Link
                onClick={ () => setGroup(group === 'vertices' ? 'wallpaper' : 'vertices') }
                size="x1"
                underline>
              Group by: <Text inline strong>{ group }</Text>
            </Link>
          </Text>

          { match('600px') && (
            <Table size="x1">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell width="30%">
                    Cundy & Rollett
                  </TableHeaderCell>

                  <TableHeaderCell width="40%">
                    GomJau-Hogg
                  </TableHeaderCell>

                  <TableHeaderCell width="15%">
                    Vertices
                  </TableHeaderCell>

                  <TableHeaderCell width="15%">
                    Wallpaper
                  </TableHeaderCell>
                </TableRow>
              </TableHeader>
            </Table>
          ) }
        </Flex>

        <Flex
            basis="none"
            direction="vertical"
            grow
            scrollable>
          <Flex basis="none" grow>
            <Flex padding="x6">
              { Object
                  .entries(groupedConfigurations)
                  .map(([groupKey, configurations]) => (
                    <Base key={ groupKey } margin="x6">
                      <Table size="x1">
                        <TableHeader>
                          <TableRow>
                            <TableHeaderCell
                                backgroundColor="background-shade-1"
                                colSpan={ 4 }
                                style={ { position: 'sticky', top: 0 } }>
                              { groupKey || 'No Defined Wallpaper Group' }
                            </TableHeaderCell>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          { configurations.map(({ cundyRollett, gomJauHogg, vertices, wallpaper }, index) => (
                            <TableRow
                                active={ configuration === gomJauHogg }
                                clickable
                                key={ index }
                                onPointerUp={ () => handleSelect(gomJauHogg) }>

                              { match('600px') ? (
                                <React.Fragment>
                                  <TableCell align="start" ellipsis width="30%">
                                    { cundyRollett }
                                  </TableCell>

                                  <TableCell align="start" ellipsis width="40%">
                                    { gomJauHogg }
                                  </TableCell>

                                  <TableCell align="start" ellipsis width="15%">
                                    { ShortNamesMap[vertices] || vertices || '-' }
                                  </TableCell>

                                  <TableCell align="start" ellipsis width="15%">
                                    { wallpaper || '-' }
                                  </TableCell>
                                </React.Fragment>
                              ) : (
                                <TableCell
                                    align="start"
                                    colSpan={ 4 }>
                                  <Grid
                                      gapHorizontal="x2"
                                      repeat={ 2 }
                                      repeatWidth="1fr">
                                    <Text strong>Cundy & Rollett:</Text>
                                    <Flex direction="horizontal">
                                      <Flex basis="none" grow>
                                        <Text ellipsis>{ cundyRollett }</Text>
                                      </Flex>
                                    </Flex>

                                    <Text strong>GomJau-Hogg:</Text>
                                    <Flex direction="horizontal">
                                      <Flex basis="none" grow>
                                        <Text ellipsis>{ gomJauHogg }</Text>
                                      </Flex>
                                    </Flex>

                                    <Text strong>Vertices:</Text>
                                    <Flex direction="horizontal">
                                      <Flex basis="none" grow>
                                        <Text ellipsis>{ vertices }</Text>
                                      </Flex>
                                    </Flex>

                                    <Text strong>Wallpaper:</Text>
                                    <Flex direction="horizontal">
                                      <Flex basis="none" grow>
                                        <Text ellipsis>{ wallpaper }</Text>
                                      </Flex>
                                    </Flex>
                                  </Grid>
                                </TableCell>
                              ) }
                            </TableRow>
                          )) }
                        </TableBody>
                      </Table>
                    </Base>
              )) }
            </Flex>
          </Flex>
        </Flex>
      </ModalBody>
    </Modal>
  );
};
