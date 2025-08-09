import React from 'react';

const RankIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    // fill='hsl(121, 27%, 55%)'
    fill='currentColor'
    width='1em'
    height='1em'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z' />
  </svg>
);

export default RankIcon;
