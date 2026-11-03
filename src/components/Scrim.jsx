import React from 'react';

export default function Scrim({ visible, onClick }) {
  return (
    <div
      className={`scrim${visible ? ' visible' : ''}`}
      id="scrim"
      onClick={onClick}
    />
  );
}
