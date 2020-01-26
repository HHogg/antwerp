import * as React from 'react';

interface Props {
  size: string;
}

export default ({ size }: Props) => {
  return (
    <svg height={ size } viewBox="0 0 24 24" width={ size }>
      <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
        <g>
          <polygon fill="var(--color-accent--shade-1)" points="12 2 22 22 12 14.947299"></polygon>
          <polygon fill="var(--color-accent--shade-2)" points="12 14.947299 22 22 2 22"></polygon>
          <polygon fill="var(--color-accent--shade-3)" points="12 2 12 14.947299 2 22"></polygon>
        </g>
      </g>
    </svg>
  );
};
