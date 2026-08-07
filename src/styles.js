export const CARD_STYLES = `
  .header {
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header.inline {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .header.stacked {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header.title {
    justify-content: flex-start;
  }
  
  .header.battery-only {
    justify-content: flex-end;
  }

  .header.stacked.battery-left .battery,
  .header.battery-only.battery-left .battery {
    align-self: flex-start;
  }
  
  .header.stacked.battery-right .battery,
  .header.battery-only.battery-right .battery {
    align-self: flex-end;
  }
  
  .card-title {
    min-width: 0;
    flex: 1;
    font-size: 18px;
    font-weight: 500;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .header.stacked .battery {
    align-self: flex-end;
  }
  
  .header.inline .battery {
    flex: 0 0 auto;
  }
  
  .header .battery {
    flex: 0 0 auto;
  }

  .battery {
    border: 1px solid var(--indego-border-color, rgba(0,150,136,0.2));
    border-radius: 8px;
    padding: 8px;
    font-weight: bold;
  }

  .image-container {
    position: relative;
    width: 100%;
    aspect-ratio: var(--map-container-ratio, 1);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    cursor: pointer;
  
    left: 50%;
    top: 50%;
  
    transform:
      translate(
        calc(-50% + var(--map-offset-x, 0%)),
        calc(-50% + var(--map-offset-y, 0%))
      )
      rotate(var(--map-rotation, 0deg))
      scale(calc(var(--map-scale, 1) * var(--map-zoom, 1)));
  
    transform-origin: center center;
  
    transition: transform 0.2s ease;
  }

  .status {
    text-align: center;
    padding: 10px;
    font-size: 16px;
    font-weight: bold;
  }

  .stats {
    display: grid;
    gap: 4px;
    padding: 8px;
  }

  .stat {
    border: 1px solid var(--indego-border-color, rgba(0,150,136,0.2));
    border-radius: 8px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    min-height: 70px;
  }

  .label {
    font-size: 12px;
    opacity: 0.7;
    text-align: center;
    flex: 0 0 auto;
  }

  .value {
    font-weight: bold;
    line-height: 1.3;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .warning {
    color: var(--indego-error-color, var(--error-color));
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 12px;
  }

  button {
    border: none;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    background: var(--indego-button-background, var(--card-background-color));
  }

  button ha-icon {
    --mdc-icon-size: 28px;
  }

  .clickable {
    cursor: pointer;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  
  .action-button.text,
  .action-button.icon_text,
  .action-button.text_icon {
    min-height: 44px;
  }
  
  .action-label {
    font-size: 14px;
    font-weight: 500;
  }
`;
