export const CARD_STYLES = `
  .header {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .battery {
    border: 1px solid var(--indego-border-color, rgba(0,150,136,0.2));
    border-radius: 8px;
    padding: 8px;
    font-weight: bold;
  }

  .image {
    width: 100%;
    display: block;
    cursor: pointer;
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
`;
