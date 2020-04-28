import configurations from '../configurations.json';
import toEntities from '../src/toEntities';
import toShapes from '../src/toShapes';

describe('Antwerp', () => {
  describe('notation entities', () => {
    test('seed shape', () => {
      expect(toEntities('3')).toEqual([3, [], []]);
    });

    test('shape groups', () => {
      expect(toEntities('3-3,3-3,3')).toEqual([3, [[3, 3], [3, 3]], []]);
    });

    test('transform mirror center', () => {
      expect(toEntities('3/m60')).toEqual([3, [], [{
        action: 'm',
        actionAngle: Math.PI / 3,
        pointIndex: 0,
        string: 'm60',
      }]]);
    });

    test('transform mirror point', () => {
      expect(toEntities('3/m60(1)')).toEqual([3, [], [{
        action: 'm',
        actionAngle: (Math.PI / 3) - (Math.PI / 2),
        pointIndex: 1,
        string: 'm60(1)',
      }]]);
    });

    test('transform rotation center', () => {
      expect(toEntities('3/r60')).toEqual([3, [], [{
        action: 'r',
        actionAngle: Math.PI / 3,
        pointIndex: 0,
        string: 'r60',
      }]]);
    });

    test('transform rotation point', () => {
      expect(toEntities('3/r60(1)')).toEqual([3, [], [{
        action: 'r',
        actionAngle: (Math.PI / 3) - (Math.PI / 2),
        pointIndex: 1,
        string: 'r60(1)',
      }]]);
    });

    test('multiple transforms', () => {
      expect(toEntities('3/m60/m60(1)')).toEqual([3, [], [{
        action: 'm',
        actionAngle: Math.PI / 3,
        pointIndex: 0,
        string: 'm60',
      }, {
        action: 'm',
        actionAngle: (Math.PI / 3) - (Math.PI / 2),
        pointIndex: 1,
        string: 'm60(1)',
      }]]);
    });
  });

  describe('configurations', () => {
    test('are all unique', () => {
      for (let i = 0; i < configurations.length - 1; i++) {
        for (let j = i + 1; j < configurations.length; j++) {
          expect(configurations[i].cundyRollett).not.toBe(configurations[j].cundyRollett);

          if (configurations[i].gomJauHogg && configurations[j].gomJauHogg) {
            expect(configurations[i].gomJauHogg).not.toBe(configurations[j].gomJauHogg);
          }
        }
      }
    });

    describe('snapshots', () => {
      configurations.forEach((config) => {
        test(`${config.cundyRollett}`, () => {
          expect(toShapes({
            configuration: config.gomJauHogg,
            height: 500,
            maxRepeat: 1,
            shapeSize: 100,
            width: 500,
          }).shapes).toMatchSnapshot();
        });
      });
    });
  });
});
