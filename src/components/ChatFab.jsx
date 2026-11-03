import React from 'react';

export default function ChatFab({ onOpen }) {
  return (
    <button className="chat-fab" id="chatFab" type="button" aria-label="Open FAQ" onClick={onOpen}>
      <span>FAQ</span>
      <span aria-hidden="true">FAQ</span>
    </button>
  );
}
