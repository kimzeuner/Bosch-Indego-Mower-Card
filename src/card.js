import {
  DEFAULT_CONFIG,
  batteryFillColor,
  batteryHeaderColor,
  cameraProxyUrl,
  formatValue,
  getErrorCount
} from "./helpers.js";
import { CARD_STYLES } from "./styles.js";
import { getTranslations, t } from "./translations.js";

export class IndegoMowerCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("indego-mower-card-editor");
  }

  static getStubConfig() {
    return { ...DEFAULT_CONFIG };
  }

  setConfig(config) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }

  getCardSize() {
    return 6;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    const hass = this._hass;
    if (!hass || !this.config) return;

    const translations = getTranslations(hass);

    if (!this.content) {
      const card = document.createElement("ha-card");
      card.style.padding = "0";
      this.content = document.createElement("div");
      card.appendChild(this.content);
      this.appendChild(card);
    }

    if (!this.config.entity) {
      this.content.innerHTML = `
        <div style="padding:16px;">
          ${t(translations, "select_entity")}
        </div>
      `;
      return;
    }

    const mower = hass.states[this.config.entity];
    const mowerState = mower?.state;
    const camera = hass.states[this.config.map_entity];
    const battery = hass.states[this.config.battery_entity];
    const charging = hass.states[this.config.charging_entity];
    const stateDetail = hass.states[this.config.state_detail_entity];
    const mowed = hass.states[this.config.mowed_entity];
    const mowedSize = hass.states[this.config.mowed_size_entity];
    const stuck = hass.states[this.config.stuck_entity];
    const alerts = hass.states[this.config.alert_entity];

    const batteryPct = parseInt(battery?.state || 0, 10);
    const imageUrl = cameraProxyUrl(camera);
    const stats = this.buildStats({
      translations,
      mowerState,
      battery,
      batteryPct,
      mowed,
      mowedSize,
      stuck,
      errors
    });

    this.content.innerHTML = `
      <style>${CARD_STYLES}</style>

      ${mowerState !== "docked" && battery ? `
        <div class="header">
          <div class="battery" style="
            background: linear-gradient(
              90deg,
              ${batteryHeaderColor(batteryPct)} 0%,
              ${batteryHeaderColor(batteryPct)} ${batteryPct}%,
              transparent ${batteryPct}%,
              transparent 100%
            );
          ">
            ${t(translations, "battery")}: ${batteryPct}%
            ${charging?.state === "on" ? "⚡" : ""}
          </div>
        </div>
      ` : ""}

      ${imageUrl
        ? `<img class="image" src="${imageUrl}" alt="Mower map" />`
        : `<div class="status">${t(translations, "no_map")}</div>`}

      <div class="status">
        ${stateDetail?.state || mower?.state || "-"}
      </div>

      ${stats.length ? `
        <div class="stats" style="grid-template-columns: repeat(${stats.length}, 1fr);">
          ${stats.join("")}
        </div>
      ` : ""}

      <div class="actions">
        ${this.renderActionButton("start", "mdi:play", mowerState === "mowing")}
        ${this.renderActionButton("pause", "mdi:pause", mowerState === "paused" || mowerState === "docked")}
        ${this.renderActionButton("dock", "mdi:home-import-outline", mowerState === "docked")}
      </div>
    `;

    this.addActionHandlers(hass);
  }

  buildStats({ translations, mowerState, battery, batteryPct, mowed, mowedSize, stuck, errors }) {
    const stats = [];

    if (mowed || mowedSize) {
      const mowedValue = mowed ? formatValue(mowed, "%") : null;
      const sizeValue = mowedSize ? formatValue(mowedSize, "m²") : null;

      stats.push(`
        <div class="stat">
          <div class="label">${t(translations, "mowed")}</div>
          <div class="value">
            ${mowedValue || ""}
            ${mowedValue && sizeValue ? "<br>" : ""}
            ${sizeValue || ""}
          </div>
        </div>
      `);
    }

    if (alerts) {
      const errorCount = getErrorCount(alerts);
    
      stats.push(`
        <div class="stat">
          <div class="label">${t(translations, "errors")}</div>
          <div class="value ${errorCount > 0 ? "warning" : ""}">
            ${errorCount}
          </div>
        </div>
      `);
    }

    if (stuck && mowerState !== "docked") {
      stats.push(`
        <div class="stat">
          <div class="label">${t(translations, "stuck")}</div>
          <div class="value ${stuck.state === "on" ? "warning" : ""}">
            ${stuck.state === "on" ? t(translations, "yes") : t(translations, "no")}
          </div>
        </div>
      `);
    }

    if (battery && mowerState === "docked") {
      const fillColor = batteryFillColor(batteryPct);

      stats.push(`
        <div class="stat battery-stat" style="
          background: linear-gradient(
            to top,
            ${fillColor} 0%,
            ${fillColor} ${batteryPct}%,
            transparent ${batteryPct}%,
            transparent 100%
          );
        ">
          <div class="label">${t(translations, "charge")}</div>
          <div class="value">${formatValue(battery, "%")}</div>
        </div>
      `);
    }

    return stats;
  }

  renderActionButton(id, icon, disabled) {
    return `
      <button id="${id}" type="button">
        <ha-icon
          icon="${icon}"
          style="color:${disabled ? "var(--disabled-text-color)" : "var(--primary-color)"}">
        </ha-icon>
      </button>
    `;
  }

  addActionHandlers(hass) {
    this.content.querySelector("#start")?.addEventListener("click", () => {
      hass.callService("lawn_mower", "start_mowing", {
        entity_id: this.config.entity
      });
    });

    this.content.querySelector("#pause")?.addEventListener("click", () => {
      hass.callService("lawn_mower", "pause", {
        entity_id: this.config.entity
      });
    });

    this.content.querySelector("#dock")?.addEventListener("click", () => {
      hass.callService("lawn_mower", "dock", {
        entity_id: this.config.entity
      });
    });
  }
}

customElements.define("indego-mower-card", IndegoMowerCard);
