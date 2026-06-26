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

const ACTIONS = {
  start: {
    service: "start_mowing",
    icon: "mdi:play",
  },
  pause: {
    service: "pause",
    icon: "mdi:pause",
  },
  dock: {
    service: "dock",
    icon: "mdi:home-import-outline",
  },
};

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
  
  getColors() {
    return {
      primary:
        this.config.theme_primary_color || "var(--primary-color)",
  
      border:
        this.config.theme_border_color ||
        "rgba(0,150,136,0.2)",
  
      warning:
        this.config.theme_warning_color ||
        "var(--warning-color)",
  
      error:
        this.config.theme_error_color ||
        "var(--error-color)",
  
      buttonBackground:
        this.config.theme_button_background ||
        "var(--card-background-color)",
    };
  }
  
  render() {
    if (!this.hass || !this.config) return html``;

    const translations = getTranslations(this.hass);

    const previewEntity =
      this.config.entity ||
      Object.keys(this.hass.states).find((entityId) =>
        entityId.startsWith("lawn_mower.")
      );
    
    const mower = previewEntity
      ? this.hass.states[previewEntity]
      : undefined;

    if (!mower) {
      return html`
        <ha-card>
          <div class="status">
            ${t(translations, "select_entity")}
          </div>
        </ha-card>
      `;
    }
    
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

    const stats = {
      translations,
      mowerState,
      battery,
      batteryPct,
      mowed,
      mowedSize,
      stuck,
      alerts,
    };

    const colors = this.getColors();
        
    return html`
          <ha-card
            style="
              --indego-primary-color: ${colors.primary};
              --indego-border-color: ${colors.border};
              --indego-warning-color: ${colors.warning};
              --indego-error-color: ${colors.error};
              --indego-button-background: ${colors.buttonBackground};
            "
          >
          
        ${this.config.show_battery_header !== false
          ? this.renderBatteryHeader({
              translations,
              mowerState,
              battery,
              batteryPct,
              charging,
            })
          : html``}
        
        ${this.config.show_map !== false
          ? this.renderMap({
              translations,
              imageUrl,
              entityId: this.config.map_entity,
            })
          : html``}
        
        ${this.config.show_status !== false
          ? this.renderStatus({
              mower,
              stateDetail,
              entityId: this.config.state_detail_entity || this.config.entity,
            })
          : html``}
        
        ${this.renderStats(stats)}
        
        ${this.renderActions(mowerState)}
      </ha-card>
    `;
  }

  renderBatteryHeader({ translations, mowerState, battery, batteryPct, charging }) {
    if (mowerState === "docked" || !battery) {
      return html``;
    }
  
    return html`
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
    `;
  }
  
  renderMap({ translations, imageUrl, entityId }) {
    return imageUrl
      ? html`
          <img
            class="image"
            src="${imageUrl}"
            alt="Mower map"
            @click=${() => this.fireMoreInfo(entityId)}
          />
        `
      : html`<div class="status">${t(translations, "no_map")}</div>`;
  }
  
  renderStatus({ mower, stateDetail, entityId }) {
    return html`
      <div
        class="status"
        @click=${() => this.fireMoreInfo(entityId)}
      >
        ${stateDetail?.state || mower?.state || "-"}
      </div>
    `;
  }
  
  renderActions(mowerState) {
    return html`
      <div class="actions">
        ${this.renderActionButton("start", mowerState === "mowing")}
        ${this.renderActionButton(
          "pause",
          mowerState === "paused" || mowerState === "docked"
        )}
        ${this.renderActionButton("dock", mowerState === "docked")}
      </div>
    `;
  }

  renderStats(data) {
    const stats = [];
  
    if (data.mowed || data.mowedSize) {
      stats.push(this.renderMowedStat(data));
    }
  
    if (data.alerts) {
      stats.push(this.renderAlertStat(data));
    }
  
    if (data.stuck && data.mowerState !== "docked") {
      stats.push(this.renderStuckStat(data));
    }
  
    if (data.battery && data.mowerState === "docked") {
      stats.push(this.renderBatteryStat(data));
    }
  
    if (!stats.length) {
      return html``;
    }
  
    return html`
      <div
        class="stats"
        style="grid-template-columns: repeat(${stats.length}, 1fr);"
      >
        ${stats}
      </div>
    `;
  }
  
  renderMowedStat({ translations, mowed, mowedSize }) {
    const mowedValue = mowed ? formatValue(mowed, "%") : null;
    const sizeValue = mowedSize ? formatValue(mowedSize, "m²") : null;
  
    return html`
      <div class="stat">
        <div class="label">${t(translations, "mowed")}</div>
        <div class="value">
          ${mowedValue || ""}
          ${mowedValue && sizeValue ? html`<br />` : ""}
          ${sizeValue || ""}
        </div>
      </div>
    `;
  }
  
  renderAlertStat({ translations, alerts }) {
    const errorCount = getErrorCount(alerts);
  
    return html`
      <div class="stat">
        <div class="label">${t(translations, "errors")}</div>
        <div class="value ${errorCount > 0 ? "warning" : ""}">
          ${errorCount}
        </div>
      </div>
    `;
  }
  
  renderStuckStat({ translations, stuck }) {
    return html`
      <div class="stat">
        <div class="label">${t(translations, "stuck")}</div>
        <div class="value ${stuck.state === "on" ? "warning" : ""}">
          ${stuck.state === "on"
            ? t(translations, "yes")
            : t(translations, "no")}
        </div>
      </div>
    `;
  }
  
  renderBatteryStat({ translations, battery, batteryPct }) {
    const fillColor = batteryFillColor(batteryPct);
  
    return html`
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
    `;
  }

  fireMoreInfo(entityId) {
    if (!entityId) return;
  
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }
  
  renderActionButton(actionId, disabled) {
    const action = ACTIONS[actionId];
  
    if (!action) {
      return html``;
    }
  
    return html`
      <button
        type="button"
        @click=${() => this.handleAction(actionId)}
      >
        <ha-icon
          icon="${action.icon}"
          style="color:${disabled
            ? "var(--disabled-text-color)"
            : "var(--indego-primary-color, var(--primary-color))"}"
        ></ha-icon>
      </button>
    `;
  }

  handleAction(actionId) {
    if (!this.hass || !this.config?.entity) return;
  
    const action = ACTIONS[actionId];
  
    if (!action) return;
  
    this.hass.callService("lawn_mower", action.service, {
      entity_id: this.config.entity,
    });
  }
}

if (!customElements.get("indego-mower-card")) {
  customElements.define("indego-mower-card", IndegoMowerCard);
}
