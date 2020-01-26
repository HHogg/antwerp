import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { TypeTheme } from 'preshape';
import URLStateContext, { URLStateContextProps } from './URLStateContext';

export interface URLState {
  animate?: boolean;
  configuration?: string;
  disableColoring?: boolean;
  disableRepeating?: boolean;
  fadeConnectedShapes?: boolean;
  maxRepeat?: number;
  showAxis?: boolean;
  shapeSize?: number;
  showTransforms?: boolean;
  theme?: TypeTheme;
}

export const defaultValues: Required<URLState> = {
  animate: false,
  configuration: '6-3-3,3-3/r60/r45(3e)',
  disableColoring: false,
  disableRepeating: false,
  fadeConnectedShapes: false,
  maxRepeat: 3,
  showAxis: false,
  shapeSize: 96,
  showTransforms: false,
  theme: 'night',
};

const validators: { [K in keyof URLState]: (v: URLState[K]) => boolean } = {
  animate: (v) => v === true || v === false,
  configuration: (v) => typeof v === 'string',
  disableColoring: (v) => v === true || v === false,
  disableRepeating: (v) => v === true || v === false,
  fadeConnectedShapes: (v) => v === true || v === false,
  maxRepeat: (v) => v !== undefined && Number.isFinite(v) && v >= 1,
  showAxis: (v) => v === true || v === false,
  shapeSize: (v) => v !== undefined && Number.isFinite(v) && v >= 60 && v <= 200,
  showTransforms: (v) => v === true || v === false,
  theme: (v) => v === 'day' || v === 'night',
};

const getURLSearchParams = (search: string) => {
  const urlSearchParams = new URLSearchParams(search);

  urlSearchParams.forEach((v, k) => {
    try {
      const key = k as keyof URLState;
      const value = JSON.parse(v);
      const validator = validators[key];

      if (!validator || !validator(value) || defaultValues[key] === value) {
        urlSearchParams.delete(k);
      }
    } catch (e) {
      urlSearchParams.delete(k);
    }
  });

  return urlSearchParams;
};

const getURLSearchParamsAsObject = (search: string) => {
  const object: URLState = {};

  getURLSearchParams(search).forEach((value, key) => {
    object[key as keyof URLState] = JSON.parse(value);
  });

  Object.entries(defaultValues).forEach(([k, v]) => {
    const key = k as keyof URLState;

    if (!object.hasOwnProperty(key)) {
      object[key] = v;
    }
  });

  return object as Required<URLState>;
};

const URLState: React.FC<{}> = (props) => {
  const history = useHistory();
  const location = useLocation();
  const refState = React.useRef<string>(location.search);

  const handleSetURLState = (search: string) => {
    refState.current = search;
    history.replace({ search });
  };

  const handleUpdateURLState = (state: Partial<URLState>) => {
    const urlSearchParams = getURLSearchParams(location.search);

    Object.entries(state).forEach(([k, v]) => {
      const key = k as keyof URLState;
      const validator = validators[key];

      if (validator && validator(v) && defaultValues[key] !== v) {
        urlSearchParams.set(key, JSON.stringify(v));
      } else {
        urlSearchParams.delete(key);
      }
    });

    handleSetURLState(urlSearchParams.toString());
  };

  React.useEffect(() => {
    handleSetURLState(getURLSearchParams(location.search).toString());
  }, []);

  const value: URLStateContextProps = {
    ...getURLSearchParamsAsObject(location.search),
    onUpdateURLState: handleUpdateURLState,
    pushWithState: (path) => history.push(`${path}?${refState.current}`),
  };

  return (
    <URLStateContext.Provider { ...props } value={ value } />
  );
};

export default URLState;
