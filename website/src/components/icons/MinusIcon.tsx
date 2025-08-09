import React from 'react';

const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    width='1em'
    height='1em'
    stroke='currentColor'
    strokeWidth={4} // Increased thickness
    strokeLinecap='round'
    strokeLinejoin='round'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M5 12l14 0' />
  </svg>
);

export default MinusIcon;
