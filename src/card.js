import { LitElement, html, css, unsafeCSS } from "lit";
import {
  DEFAULT_CONFIG,
  batteryFillColor,
  batteryHeaderColor,
  cameraProxyUrl,
  formatValue,
  getErrorCount,
} from "./helpers.js";
import { CARD_STYLES } from "./styles.js";
import { getTranslations, t } from "./translations.js";

export class IndegoMowerCard extends LitElement {
  static properties = {
    hass: {},
    config: { state: true },
  };

  static styles = css`
    ${unsafeCSS(CARD_STYLES)}
  `;

  static getConfigElement() {
    return document.createElement("indego-mower-card-editor");
  }

  static getStubConfig() {
    return { ...DEFAULT_CONFIG };
  }

  setConfig(config) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  getCardSize() {
    return 6;
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const translations = getTranslations(this.hass);

    if (!this.config.entity) {
      return html`
        <ha-card>
          <div style="padding:16px;">
            ${t(translations, "select_entity")}
          </div>
        </ha-card>
      `;
    }

    const mower = this.hass.states[this.config.entity];
    const mowerState = mower?.state;
    const camera = this.hass.states[this.config.map_entity];
    const battery = this.hass.states[this.config.battery_entity];
    const charging = this.hass.states[this.config.charging_entity];
    const stateDetail = this.hass.states[this.config.state_detail_entity];
    const mowed = this.hass.states[this.config.mowed_entity];
    const mowedSize = this.hass.states[this.config.mowed_size_entity];
    const stuck = this.hass.states[this.config.stuck_entity];
    const alerts = this.hass.states[this.config.alert_entity];

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
      alerts,
    });

    return html`
      <ha-card>
        ${mowerState !== "docked" && battery
          ? html`
              <div class="header">
                <div
                  class="battery"
                  style="
                    background: linear-gradient(
                      90deg,
                      ${batteryHeaderColor(batteryPct)} 0%,
                      ${batteryHeaderColor(batteryPct)} ${batteryPct}%,
                      transparent ${batteryPct}%,
                      transparent 100%
                    );
                  "
                >
                  ${t(translations, "battery")}: ${batteryPct}%
                  ${charging?.state === "on" ? "⚡" : ""}
                </div>
              </div>
            `
          : ""}

        ${imageUrl
          ? html`<img class="image" src="${imageUrl}" alt="Mower map" />`
          : html`<div class="status">${t(translations, "no_map")}</div>`}

        <div class="status">
          ${stateDetail?.state || mower?.state || "-"}
        </div>

        ${stats.length
          ? html`
              <div
                class="stats"
                style="grid-template-columns: repeat(${stats.length}, 1fr);"
              >
                ${stats}
              </div>
            `
          : ""}

        <div class="actions">
          ${this.renderActionButton("start", "mdi:play", mowerState === "mowing")}
          ${this.renderActionButton(
            "pause",
            "mdi:pause",
            mowerState === "paused" || mowerState === "docked"
          )}
          ${this.renderActionButton(
            "dock",
            "mdi:home-import-outline",
            mowerState === "docked"
          )}
        </div>
      </ha-card>
    `;
  }

  buildStats({
    translations,
    mowerState,
    battery,
    batteryPct,
    mowed,
    mowedSize,
    stuck,
    alerts,
  }) {
    const stats = [];

    if (mowed || mowedSize) {
      const mowedValue = mowed ? formatValue(mowed, "%") : null;
      const sizeValue = mowedSize ? formatValue(mowedSize, "m²") : null;

      stats.push(html`
        <div class="stat">
          <div class="label">${t(translations, "mowed")}</div>
          <div class="value">
            ${mowedValue || ""}
            ${mowedValue && sizeValue ? html`<br />` : ""}
            ${sizeValue || ""}
          </div>
        </div>
      `);
    }

    if (alerts) {
      const errorCount = getErrorCount(alerts);

      stats.push(html`
        <div class="stat">
          <div class="label">${t(translations, "errors")}</div>
          <div class="value ${errorCount > 0 ? "warning" : ""}">
            ${errorCount}
          </div>
        </div>
      `);
    }

    if (stuck && mowerState !== "docked") {
      stats.push(html`
        <div class="stat">
          <div class="label">${t(translations, "stuck")}</div>
          <div class="value ${stuck.state === "on" ? "warning" : ""}">
            ${stuck.state === "on"
              ? t(translations, "yes")
              : t(translations, "no")}
          </div>
        </div>
      `);
    }

    if (battery && mowerState === "docked") {
      const fillColor = batteryFillColor(batteryPct);

      stats.push(html`
        <div
          class="stat battery-stat"
          style="
            background: linear-gradient(
              to top,
              ${fillColor} 0%,
              ${fillColor} ${batteryPct}%,
              transparent ${batteryPct}%,
              transparent 100%
            );
          "
        >
          <div class="label">${t(translations, "charge")}</div>
          <div class="value">${formatValue(battery, "%")}</div>
        </div>
      `);
    }

    return stats;
  }

  renderActionButton(id, icon, disabled) {
    return html`
      <button
        id="${id}"
        type="button"
        @click=${() => this.handleAction(id)}
      >
        <ha-icon
          icon="${icon}"
          style="color:${disabled
            ? "var(--disabled-text-color)"
            : "var(--primary-color)"}"
        ></ha-icon>
      </button>
    `;
  }

  handleAction(action) {
    if (!this.hass || !this.config?.entity) return;

    const services = {
      start: "start_mowing",
      pause: "pause",
      dock: "dock",
    };

    this.hass.callService("lawn_mower", services[action], {
      entity_id: this.config.entity,
    });
  }
}

if (!customElements.get("indego-mower-card")) {
  customElements.define("indego-mower-card", IndegoMowerCard);
}
