const DEFAULT_CONFIG = {
  entity: "",
  map_entity: "",
  battery_entity: "",
  charging_entity: "",
  state_detail_entity: "",
  mowed_entity: "",
  mowed_size_entity: "",
  stuck_entity: "",
  alert_entity: "",
  error_entity: ""
};

const TRANSLATIONS = {
  en: {
    battery: "Battery",
    mowed: "Mowed",
    errors: "Errors",
    stuck: "Stuck",
    charge: "Charge",
    yes: "Yes",
    no: "No",
    no_map: "No map available",
    select_entity: "Please select a mower entity in the card configuration.",
    editor: {
      mower: "Mower",
      map: "Map",
      battery: "Battery",
      charging: "Charging",
      state_detail: "Status detail",
      mowed: "Mowed",
      mowed_size: "Mowed area",
      stuck: "Stuck",
      alert: "Alert",
      errors: "Errors"
    }
  },
  de: {
    battery: "Batterie",
    mowed: "Gemäht",
    errors: "Fehler",
    stuck: "Fest",
    charge: "Ladung",
    yes: "Ja",
    no: "Nein",
    no_map: "Keine Karte verfügbar",
    select_entity: "Bitte wähle im Karteneditor eine Mäher-Entität aus.",
    editor: {
      mower: "Mäher",
      map: "Karte",
      battery: "Batterie",
      charging: "Lädt",
      state_detail: "Status Detail",
      mowed: "Gemäht",
      mowed_size: "Gemähte Fläche",
      stuck: "Festgefahren",
      alert: "Alarm",
      errors: "Fehler"
    }
  }
};

function getTranslations(hass) {
  const language = hass?.language || "en";
  const baseLanguage = language.split("-")[0];
  return TRANSLATIONS[language] || TRANSLATIONS[baseLanguage] || TRANSLATIONS.en;
}

function t(translations, key) {
  return key.split(".").reduce((obj, part) => obj?.[part], translations) || key;
}

function formatValue(entity, fallbackUnit = "") {
  if (!entity) return null;
  const unit = entity.attributes.unit_of_measurement || fallbackUnit;
  return `${entity.state}${unit ? " " + unit : ""}`;
}

function batteryHeaderColor(percent) {
  if (percent > 70) return "rgba(0,180,0,0.35)";
  if (percent > 30) return "rgba(255,165,0,0.35)";
  return "rgba(200,0,0,0.35)";
}

function batteryFillColor(percent) {
  if (percent > 50) return "rgba(0,180,0,0.20)";
  if (percent > 25) return "rgba(255,165,0,0.20)";
  return "rgba(255,0,0,0.20)";
}

function cameraProxyUrl(camera) {
  if (!camera) return "";
  return `/api/camera_proxy/${camera.entity_id}?token=${camera.attributes.access_token || ""}`;
}

const CARD_STYLES = `
  .header {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .battery {
    border: 1px solid rgba(0,150,136,0.2);
    border-radius: 8px;
    padding: 8px;
    font-weight: bold;
  }

  .image {
    width: 100%;
    display: block;
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
    border: 1px solid rgba(0,150,136,0.2);
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
    color: darkred;
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
    background: var(--card-background-color);
  }

  button ha-icon {
    --mdc-icon-size: 28px;
  }
`;

class IndegoMowerCardEditor extends HTMLElement {
  set hass(hass) {
    this._hass = hass;

    this.querySelectorAll("ha-entity-picker").forEach((picker) => {
      picker.hass = hass;
    });

    if (!this._rendered) {
      this.render();
    }
  }

  setConfig(config) {
    this._config = {
      ...DEFAULT_CONFIG,
      ...config
    };

    if (!this._rendered) {
      this.render();
    }
  }

  render() {
    if (!this._config || this._rendering) return;

    this._rendering = true;
    const translations = getTranslations(this._hass);

    const fields = [
      ["entity", t(translations, "editor.mower")],
      ["map_entity", t(translations, "editor.map")],
      ["battery_entity", t(translations, "editor.battery")],
      ["charging_entity", t(translations, "editor.charging")],
      ["state_detail_entity", t(translations, "editor.state_detail")],
      ["mowed_entity", t(translations, "editor.mowed")],
      ["mowed_size_entity", t(translations, "editor.mowed_size")],
      ["stuck_entity", t(translations, "editor.stuck")],
      ["alert_entity", t(translations, "editor.alert")],
      ["error_entity", t(translations, "editor.errors")]
    ];

    this.innerHTML = `
      <div style="padding:16px;">
        ${fields.map(([key, label]) => `
          <ha-entity-picker
            label="${label}"
            value="${this._config[key] || ""}"
            config-value="${key}"
            allow-custom-entity
            style="display:block; margin-bottom:12px;"
          ></ha-entity-picker>
        `).join("")}
      </div>
    `;

    this.querySelectorAll("ha-entity-picker").forEach((picker) => {
      picker.hass = this._hass;

      picker.addEventListener("value-changed", (event) => {
        const key = picker.getAttribute("config-value");
        const value = event.detail.value;
        const config = { ...this._config };

        if (value) {
          config[key] = value;
        } else {
          delete config[key];
        }

        this._config = config;

        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config },
            bubbles: true,
            composed: true
          })
        );
      });
    });

    this._rendered = true;
    this._rendering = false;
  }
}

customElements.define("indego-mower-card-editor", IndegoMowerCardEditor);

class IndegoMowerCard extends HTMLElement {
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
    const errors = hass.states[this.config.error_entity];

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

    if (errors) {
      const errorCount = parseInt(errors.state || 0, 10);

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

window.customCards = window.customCards || [];
window.customCards.push({
  type: "indego-mower-card",
  name: "Indego Mower Card",
  description: "Bosch Indego robotic mower card"
});
