// src/components/global/EchoShop.jsx
// Echo Shop panel — accessible from GlobalHeader.
// Reads/writes through the Zustand global store.

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useGlobalStore from '../../store/globalStore.js';
import { ECHO_SHOP_ITEMS, canAffordItem } from '../../meta/echoShop.js';

const TITLE_ID = 'echo-shop-title';

function EchoShop({ onClose }) {
  const echoes = useGlobalStore((s) => s.echoes);
  const echoShopPurchases = useGlobalStore((s) => s.echoShopPurchases);
  const purchaseEchoShopItem = useGlobalStore((s) => s.purchaseEchoShopItem);
  const panelRef = useRef(null);

  // Focus the panel when it opens so keyboard users land inside the dialog
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="echo-shop-overlay"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        className="echo-shop-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="echo-shop-header">
          <h2 id={TITLE_ID} className="echo-shop-title">Echo Shop</h2>
          <span className="echo-shop-balance">✦ {echoes} Echoes</span>
          <button className="echo-shop-close cartoon-button" onClick={onClose} aria-label="Close Echo Shop">
            ✕
          </button>
        </div>

        <p className="echo-shop-subtitle">
          Permanent upgrades that apply across all games.
        </p>

        <div className="echo-shop-items">
          {ECHO_SHOP_ITEMS.map((item) => {
            const purchased = echoShopPurchases.includes(item.id);
            const affordable = canAffordItem(item, echoes, echoShopPurchases);

            return (
              <div
                key={item.id}
                className={`echo-shop-item ${purchased ? 'purchased' : ''} ${!affordable && !purchased ? 'unaffordable' : ''}`}
              >
                <div className="echo-shop-item-info">
                  <span className="echo-shop-item-name">{item.name}</span>
                  <span className="echo-shop-item-desc">{item.description}</span>
                </div>
                <button
                  className="cartoon-button echo-shop-buy-btn"
                  disabled={!affordable || purchased}
                  onClick={() => purchaseEchoShopItem(item.id, item.cost)}
                >
                  {purchased ? 'Owned' : `✦ ${item.cost}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

EchoShop.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default EchoShop;
