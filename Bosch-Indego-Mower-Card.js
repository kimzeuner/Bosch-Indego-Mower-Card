const DEFAULT_TRANSLATIONS = {
  battery: "Battery",
  mowed: "Mowed",
  errors: "Errors",
  stuck: "Stuck",
  charge: "Charge",
  yes: "Yes",
  no: "No",
  no_map: "No map available",

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
    errors: "Errors",
  },
};

const CARD_TRANSLATIONS = {};

async function loadIndegoTranslations(hass) {
  const lang = hass?.language || "en";

  if (CARD_TRANSLATIONS[lang]) {
    return CARD_TRANSLATIONS[lang];
  }

  try {
    const url = new URL(`./translations/${lang}.json`, import.meta.url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Translation not found");
    }

    CARD_TRANSLATIONS[lang] = await response.json();
  } catch (err) {
    CARD_TRANSLATIONS[lang] = DEFAULT_TRANSLATIONS;
  }

  return CARD_TRANSLATIONS[lang];
}

function t(translations, key) {
  return key
    .split(".")
    .reduce((obj, part) => obj?.[part], translations) || key;
}

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
      entity: "",
      map_entity: "",
      battery_entity: "",
      charging_entity: "",
      state_detail_entity: "",
      mowed_entity: "",
      mowed_size_entity: "",
      stuck_entity: "",
      alert_entity: "",
      error_entity: "",
      ...config,
    };
  
    if (!this._rendered) {
      this.render();
    }
  }

  async render() {
    if (!this._config || this._rendering) return;

    this._rendering = true;

    const translations = await loadIndegoTranslations(this._hass);

    this._rendered = true;
    this._rendering = false;

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
      ["error_entity", t(translations, "editor.errors")],
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

      picker.addEventListener("value-changed", (ev) => {
        const key = picker.getAttribute("config-value");
        const value = ev.detail.value;

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
            composed: true,
          })
        );
      });
    });
  }
}

customElements.define("indego-mower-card-editor", IndegoMowerCardEditor);

class IndegoMowerCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("indego-mower-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      map_entity: "",
      battery_entity: "",
      charging_entity: "",
      state_detail_entity: "",
      mowed_entity: "",
      mowed_size_entity: "",
      stuck_entity: "",
      alert_entity: "",
      error_entity: "",
    };
  }

  setConfig(config) {
    this.config = {
      entity: "",
      map_entity: "",
      battery_entity: "",
      charging_entity: "",
      state_detail_entity: "",
      mowed_entity: "",
      mowed_size_entity: "",
      stuck_entity: "",
      alert_entity: "",
      error_entity: "",
      ...config,
    };
  }

  getCardSize() {
    return 6;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  async render() {
    const hass = this._hass;
    if (!hass || !this.config) return;

    const translations = await loadIndegoTranslations(hass);

    if (!this.config?.entity) {
      if (!this.content) {
        const card = document.createElement("ha-card");
        this.content = document.createElement("div");
        card.appendChild(this.content);
        this.appendChild(card);
      }
    
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

    if (!this.content) {
      const card = document.createElement("ha-card");
      card.style.padding = "0";

      this.content = document.createElement("div");
      card.appendChild(this.content);
      this.appendChild(card);
    }

    const batteryPct = parseInt(battery?.state || 0);

    let batteryColor = "rgba(200,0,0,0.35)";
    if (batteryPct > 70) batteryColor = "rgba(0,180,0,0.35)";
    else if (batteryPct > 30) batteryColor = "rgba(255,165,0,0.35)";

    let batteryBgColor = "rgba(255,0,0,0.20)";
    if (batteryPct > 50) batteryBgColor = "rgba(0,180,0,0.20)";
    else if (batteryPct > 25) batteryBgColor = "rgba(255,165,0,0.20)";

    const imageUrl = camera
      ? `/api/camera_proxy/${camera.entity_id}?token=${camera.attributes.access_token || ""}`
      : "";

    const formatValue = (entity, fallbackUnit = "") => {
      if (!entity) return null;

      const unit = entity.attributes.unit_of_measurement || fallbackUnit;
      return `${entity.state}${unit ? " " + unit : ""}`;
    };

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
      const errorCount = parseInt(errors.state || 0);

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
      stats.push(`
        <div class="stat battery-stat"
          style="
            background:
              linear-gradient(
                to top,
                ${batteryBgColor} 0%,
                ${batteryBgColor} ${batteryPct}%,
                transparent ${batteryPct}%,
                transparent 100%
              );
          ">
          <div class="label">${t(translations, "charge")}</div>
          <div class="value">${formatValue(battery, "%")}</div>
        </div>
      `);
    }

    this.content.innerHTML = `
      <style>
        .header {
          padding: 12px;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .battery {
          border:1px solid rgba(0,150,136,0.2);
          border-radius:8px;
          padding:8px;
          font-weight:bold;
          background:
            linear-gradient(
              90deg,
              ${batteryColor} 0%,
              ${batteryColor} ${batteryPct}%,
              transparent ${batteryPct}%,
              transparent 100%
            );
        }

        .image {
          width:100%;
          display:block;
        }

        .status {
          text-align:center;
          padding:10px;
          font-size:16px;
          font-weight:bold;
        }

        .stats {
          display:grid;
          gap:4px;
          padding:8px;
        }

        .stat {
          border:1px solid rgba(0,150,136,0.2);
          border-radius:8px;
          padding:8px;
          display:flex;
          flex-direction:column;
          min-height:70px;
        }

        .label {
          font-size:12px;
          opacity:0.7;
          text-align:center;
          flex:0 0 auto;
        }

        .value {
          font-weight:bold;
          line-height:1.3;
          flex:1;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
        }

        .warning {
          color:darkred;
        }

        .actions {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:8px;
          padding:12px;
        }

        button {
          border:none;
          border-radius:12px;
          padding:12px;
          cursor:pointer;
          background: var(--card-background-color);
        }

        button ha-icon {
          --mdc-icon-size: 28px;
          color: var(--primary-color);
        }
      </style>

      ${
        mowerState !== "docked"
          ? `<div class="header">
              <div class="battery">
                ${t(translations, "battery")}: ${batteryPct}%
                ${charging?.state === "on" ? "⚡" : ""}
              </div>
            </div>`
          : ""
      }

      ${
        imageUrl
          ? `<img class="image" src="${imageUrl}" alt="Mower map" />`
          : `<div class="status">${t(translations, "no_map")}</div>`
      }

      <div class="status">
        ${stateDetail?.state || "-"}
      </div>

      ${
        stats.length
          ? `<div class="stats" style="grid-template-columns: repeat(${stats.length}, 1fr);">
              ${stats.join("")}
            </div>`
          : ""
      }

      <div class="actions">
        <button id="start">
          <ha-icon
            icon="mdi:play"
            style="color:${
              mowerState === "mowing"
                ? "var(--disabled-text-color)"
                : "var(--primary-color)"
            }">
          </ha-icon>
        </button>

        <button id="pause">
          <ha-icon
            icon="mdi:pause"
            style="color:${
              mowerState === "paused" || mowerState === "docked"
                ? "var(--disabled-text-color)"
                : "var(--primary-color)"
            }">
          </ha-icon>
        </button>

        <button id="dock">
          <ha-icon
            icon="mdi:home-import-outline"
            style="color:${
              mowerState === "docked"
                ? "var(--disabled-text-color)"
                : "var(--primary-color)"
            }">
          </ha-icon>
        </button>
      </div>
    `;

    this.content.querySelector("#start").onclick = () => {
      hass.callService("lawn_mower", "start_mowing", {
        entity_id: this.config.entity,
      });
    };

    this.content.querySelector("#pause").onclick = () => {
      hass.callService("lawn_mower", "pause", {
        entity_id: this.config.entity,
      });
    };

    this.content.querySelector("#dock").onclick = () => {
      hass.callService("lawn_mower", "dock", {
        entity_id: this.config.entity,
      });
    };
  }
}

customElements.define("indego-mower-card", IndegoMowerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "indego-mower-card",
  name: "Indego Mower Card",
  description: "Bosch Indego robotic mower card",
});
