import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui';

const chatOptions = [
  { label: 'About BinZ', msg: 'BinZ schedules doorstep scrap pickup and rewards verified recycling with Z-Coins.' },
  { label: 'Schedule pickup', msg: 'Enter a 10-digit mobile number in the hero booking field and tap Book.' },
  { label: 'E-waste help', msg: 'Use the e-waste ticket panel for phones, laptops, batteries and other sensitive electronics.' },
  { label: 'Contact', msg: 'Contact: +91 9696202329 or cloudynx.tech@gmail.com' },
];

export default function ChatDrawer({ isOpen, onClose }) {
  const [response, setResponse] = useState('Choose a quick action to start.');

  useEffect(() => {
    function handleKeydown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isOpen, onClose]);

  return (
    <aside
      className={`drawer${isOpen ? ' open' : ''}`}
      id="chatDrawer"
      aria-hidden={!isOpen}
      aria-label="FAQ panel"
      role="dialog"
      aria-modal={isOpen || undefined}
      inert={!isOpen}
    >
      <div className="drawer-head">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2>How can BinZ help?</h2>
        </div>
        <button className="icon-button" type="button" aria-label="Close chat" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="chat-options">
        {chatOptions.map((opt) => (
          <Button variant="secondary"
            key={opt.label}
            type="button"
            onClick={() => setResponse(opt.msg)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <div className="chat-response" id="chatResponse" role="status" aria-live="polite">{response}</div>
    </aside>
  );
}
