import * as React from 'react';
import { AntwerpData, AntwerpOptions } from './Types';

export const AntwerpQueueContext = React.createContext<{
  pushToQueue: null | ((options: AntwerpOptions) => Promise<AntwerpData>);
}>({
  pushToQueue: null,
});

export interface AntwerpQueueProps {
  workers: Worker[];
}

const AntwerpQueue: React.FC<AntwerpQueueProps> = (props) => {
  const { workers, ...rest } = props;
  const refIsDetached = React.useRef(false);
  const refProcessingStates = React.useRef<boolean[]>([]);
  const queue = React.useRef<[AntwerpOptions, (data: AntwerpData) => void][]>([]);

  const getAvailableWorkerIndex = () => {
    for (let i = 0; i < workers.length; i++) {
      if (!refProcessingStates.current[i]) {
        return i;
      }
    }

    return null;
  };

  const processQueue = () => {
    const workerIndex = getAvailableWorkerIndex();

    if (workerIndex !== null) {
      const item = queue.current.shift();

      if (item) {
        const options = item[0];
        const resolve = item[1];

        workers[workerIndex].onmessage = ({ data }) => {
          if (!refIsDetached.current) {
            resolve(data);
            refProcessingStates.current[workerIndex] = false;
            processQueue();
          }
        };

        refProcessingStates.current[workerIndex] = true;
        workers[workerIndex].postMessage(options);
      }
    }
  };

  const pushToQueue = (options: AntwerpOptions): Promise<AntwerpData> => {
    return new Promise((resolve) => {
      queue.current.push([options, resolve]);
      processQueue();
    });
  };

  const value = React.useMemo(() => ({
    pushToQueue: workers ? pushToQueue : null,
  }), [workers]);

  React.useEffect(() => {
    return () => {
      refIsDetached.current = true;
    };
  }, []);

  return (
    <AntwerpQueueContext.Provider { ...rest } value={ value } />
  );
};

export default AntwerpQueue;
