import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  useUrlState,
  URLStateDecoders,
  URLStateDefaults,
  URLStateEncoders,
  URLStateValidators,
} from 'preshape';
import { TypeColorScale } from '../Types';
import { colorScales } from '../utils/getColorScale';

export interface URLState {
  colorMethod: 'placement' | 'transform';
  colorScale: TypeColorScale;
  configuration: string;
  fadeConnectedShapes: boolean;
  maxRepeat: number;
  showAxis15: boolean;
  showAxis90: boolean;
  shapeSize: number;
  showTransforms: boolean;
}

const urlStateDecoders: URLStateDecoders<URLState> = {
  fadeConnectedShapes : (v) => JSON.parse(v),
  maxRepeat: (v) => parseInt(v),
  showAxis15: (v) => JSON.parse(v),
  showAxis90: (v) => JSON.parse(v),
  shapeSize: (v) => parseInt(v),
  showTransforms: (v) => JSON.parse(v),
};

const urlStateDefaults: URLStateDefaults<URLState> = {
  colorMethod: 'placement',
  colorScale: 'Preshape Theme',
  configuration: '3-4-3,3/m30/m(4)',
  fadeConnectedShapes: false,
  maxRepeat: 3,
  showAxis15: false,
  showAxis90: false,
  shapeSize: 96,
  showTransforms: false,
};

const urlStateEncoders: URLStateEncoders<URLState> = {};

const urlStateValidators: URLStateValidators<URLState> = {
  colorMethod: (v) => v === 'placement' || v === 'transform',
  colorScale: (v) => colorScales.includes(v),
  fadeConnectedShapes: (v) => v === true || v === false,
  maxRepeat: (v) => v !== undefined && Number.isFinite(v) && v >= -1,
  showAxis15: (v) => v === true || v === false,
  showAxis90: (v) => v === true || v === false,
  shapeSize: (v) => v !== undefined && Number.isFinite(v) && v >= 60 && v <= 200,
  showTransforms: (v) => v === true || v === false,
};

export const URLStateContext = React.createContext<URLState & {
  onUpdateUrlState: (state: Partial<URLState>) => void;
  push: (pathname: string) => void;
  search: string;
}>({
  colorMethod: 'placement',
  colorScale: 'Preshape Theme',
  configuration: '3-4-3,3/m30/m(4)',
  fadeConnectedShapes: false,
  maxRepeat: 3,
  onUpdateUrlState: () => {},
  push: () => {},
  search: '',
  shapeSize: 96,
  showAxis15: false,
  showAxis90: false,
  showTransforms: false,
});

const URLState: React.FC<{}> = (props) => {
  const history = useHistory();
  const { search } = useLocation();
  const refSearch = React.useRef(location.search);
  const state = useUrlState<URLState>({
    decoders: urlStateDecoders,
    defaults: urlStateDefaults,
    encoders: urlStateEncoders,
    onUpdateSearch: (search) => {
      refSearch.current = search;
      history.replace({ search });
    },
    search: search,
    validators: urlStateValidators,
  });

  const push = (pathname: string) => {
    history.push({
      pathname: pathname,
      search: refSearch.current,
    });
  };

  React.useEffect(() => {
    refSearch.current = search;
  }, [search]);

  return (
    <URLStateContext.Provider { ...props } value={ { ...state, push } } />
  );
};

export default URLState;
