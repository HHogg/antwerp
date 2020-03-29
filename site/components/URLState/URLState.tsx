import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  useUrlState,
  URLStateDecoders,
  URLStateDefaults,
  URLStateEncoders,
  URLStateValidators,
} from 'preshape';

export interface URLState {
  animate: boolean;
  configuration: string;
  disableColoring: boolean;
  disableRepeating: boolean;
  fadeConnectedShapes: boolean;
  maxRepeat: number;
  showAxis: boolean;
  shapeSize: number;
  showTransforms: boolean;
}

const urlStateDecoders: URLStateDecoders<URLState> = {
  animate: (v) => JSON.parse(v),
  disableColoring: (v) => JSON.parse(v),
  disableRepeating: (v) => JSON.parse(v),
  fadeConnectedShapes : (v) => JSON.parse(v),
  maxRepeat: (v) => parseInt(v),
  showAxis: (v) => JSON.parse(v),
  shapeSize: (v) => parseInt(v),
  showTransforms: (v) => JSON.parse(v),
};

const urlStateDefaults: URLStateDefaults<URLState> = {
  animate: false,
  configuration: '6-3-3,3-3/r60/r45(3e)',
  disableColoring: false,
  disableRepeating: false,
  fadeConnectedShapes: false,
  maxRepeat: 3,
  showAxis: false,
  shapeSize: 96,
  showTransforms: false,
};

const urlStateEncoders: URLStateEncoders<URLState> = {};

const urlStateValidators: URLStateValidators<URLState> = {
  animate: (v) => v === true || v === false,
  disableColoring: (v) => v === true || v === false,
  disableRepeating: (v) => v === true || v === false,
  fadeConnectedShapes: (v) => v === true || v === false,
  maxRepeat: (v) => v !== undefined && Number.isFinite(v) && v >= 1,
  showAxis: (v) => v === true || v === false,
  shapeSize: (v) => v !== undefined && Number.isFinite(v) && v >= 60 && v <= 200,
  showTransforms: (v) => v === true || v === false,
};

export const URLStateContext = React.createContext<URLState & {
  onUpdateUrlState: (state: Partial<URLState>) => void;
  push: (pathname: string) => void;
  search: string;
}>({
  animate: false,
  configuration: '6-3-3,3-3/r60/r45(3e)',
  disableColoring: false,
  disableRepeating: false,
  fadeConnectedShapes: false,
  maxRepeat: 3,
  onUpdateUrlState: () => {},
  push: () => {},
  search: '',
  shapeSize: 96,
  showAxis: false,
  showTransforms: false,
});

const URLState: React.FC<{}> = (props) => {
  const history = useHistory();
  const location = useLocation();
  const refSearch = React.useRef(location.search);
  const state = useUrlState<URLState>({
    decoders: urlStateDecoders,
    defaults: urlStateDefaults,
    encoders: urlStateEncoders,
    onUpdateSearch: (search) => {
      refSearch.current = search;
      history.replace({ search });
    },
    search: location.search,
    validators: urlStateValidators,
  });

  const push = (pathname: string) => {
    history.push({
      pathname: pathname,
      search: refSearch.current,
    });
  };

  React.useEffect(() => {
    refSearch.current = location.search;
  }, [location.search]);

  return (
    <URLStateContext.Provider { ...props } value={ { ...state, push } } />
  );
};

export default URLState;
