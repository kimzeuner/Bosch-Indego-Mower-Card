import { DEFAULT_CONFIG, autoDetectIndegoEntities } from "./helpers.js";
import { getTranslations, t } from "./translations.js";

export class IndegoMowerCardEditor extends HTMLElement {
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
      ["alert_entity", t(translations, "editor.errors")]
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
