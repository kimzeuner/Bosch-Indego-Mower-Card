import { DEFAULT_CONFIG, autoDetectIndegoEntities } from "./helpers.js";
import { getTranslations, t } from "./translations.js";

export class IndegoMowerCardEditor extends HTMLElement {
  set hass(hass) {
    this._hass = hass;

    this.querySelectorAll("ha-entity-picker").forEach((picker) => {
      picker.hass = hass;
    });

    if (!this._initialized && this._config) {
      this.render();
    }
  }

  setConfig(config) {
    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    if (!this._initialized && this._hass) {
      this.render();
    } else {
      this.updatePickerValues();
    }
  }

  render() {
    if (!this._hass || !this._config || this._initialized) return;

    const translations = getTranslations(this._hass);

    const fields = [
      ["entity", t(translations, "editor.mower")],
      ["map_entity", t(translations, "editor.map"), "show_map"],
      ["battery_entity", t(translations, "editor.battery"), "show_battery_header"],
      ["charging_entity", t(translations, "editor.charging")],
      ["state_detail_entity", t(translations, "editor.state_detail"), "show_status"],
      ["mowed_entity", t(translations, "editor.mowed")],
      ["mowed_size_entity", t(translations, "editor.mowed_size")],
      ["stuck_entity", t(translations, "editor.stuck")],
      ["alert_entity", t(translations, "editor.errors")],
    ];

    const colorFields = [
      ["theme_primary_color", t(translations, "editor.theme_primary_color")],
      ["theme_border_color", t(translations, "editor.theme_border_color")],
      ["theme_warning_color", t(translations, "editor.theme_warning_color")],
      ["theme_error_color", t(translations, "editor.theme_error_color")],
      ["theme_button_background", t(translations, "editor.theme_button_background")],
    ];

    this.innerHTML = `
      <div style="padding:16px;">
        ${fields
          .map(
            ([key, label, toggleKey]) => `
              <div style="margin-bottom:12px;">
                <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  margin-bottom:4px;
                ">
                  <div style="font-size:14px; font-weight:500;">
                    ${label}
                  </div>

                  ${
                    toggleKey
                      ? `
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="font-size:14px; color:var(--secondary-text-color);">
                            ${t(translations, `editor.${toggleKey}`)}
                          </span>
                          <ha-switch config-value="${toggleKey}"></ha-switch>
                        </div>
                      `
                      : ""
                  }
                </div>

                <ha-entity-picker
                  config-value="${key}"
                  allow-custom-entity
                  style="display:block;"
                ></ha-entity-picker>
              </div>
            `
          )
          .join("")}

        <div style="margin-top:20px; margin-bottom:8px; font-size:16px; font-weight:500;">
          ${t(translations, "editor.colors")}
        </div>
        
        <div style="
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap:12px;
        ">
          ${colorFields
            .map(
              ([key, label]) => `
                <label style="display:block;">
                  <div style="font-size:12px; color:var(--secondary-text-color); margin-bottom:4px;">
                    ${label}
                  </div>
                  <input
                    type="text"
                    config-value="${key}"
                    value="${this._config[key] || ""}"
                    style="
                      width:100%;
                      box-sizing:border-box;
                      padding:8px;
                      border:1px solid var(--divider-color);
                      border-radius:4px;
                      background:var(--card-background-color);
                      color:var(--primary-text-color);
                    "
                  />
                </label>
              `
            )
            .join("")}
        </div>
      </div>
    `;

    this.querySelectorAll("ha-entity-picker").forEach((picker) => {
      const key = picker.getAttribute("config-value");

      picker.hass = this._hass;

      if (key === "entity") {
        picker.includeDomains = ["lawn_mower"];
      }

      picker.value = this._config[key] || "";

      picker.addEventListener("value-changed", (event) => {
        const value = event.detail.value;
        const config = { ...this._config };

        if (value) {
          config[key] = value;

          if (key === "entity") {
            const detected = autoDetectIndegoEntities(this._hass, value);

            Object.entries(detected).forEach(([detectedKey, detectedValue]) => {
              if (!config[detectedKey]) {
                config[detectedKey] = detectedValue;
              }
            });
          }
        } else {
          delete config[key];
        }

        this._config = config;
        this.updatePickerValues();

        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config },
            bubbles: true,
            composed: true,
          })
        );
      });
    });

    this.querySelectorAll('input[config-value^="theme_"]').forEach((field) => {
      const key = field.getAttribute("config-value");
    
      field.addEventListener("change", (event) => {
        const value = event.target.value?.trim();
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
    
    this.querySelectorAll("ha-switch").forEach((toggle) => {
      const key = toggle.getAttribute("config-value");

      toggle.checked = this._config[key] !== false;

      toggle.addEventListener("change", (event) => {
        const config = {
          ...this._config,
          [key]: event.target.checked,
        };

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

    this._initialized = true;
  }

  updatePickerValues() {
    if (!this._config) return;

    this.querySelectorAll("ha-entity-picker").forEach((picker) => {
      const key = picker.getAttribute("config-value");
      const value = this._config[key] || "";

      if (picker.value !== value) {
        picker.value = value;
      }
    });

    this.querySelectorAll("ha-switch").forEach((toggle) => {
      const key = toggle.getAttribute("config-value");
      toggle.checked = this._config[key] !== false;
    });

    this.querySelectorAll('input[config-value^="theme_"]').forEach((field) => {
      const key = field.getAttribute("config-value");
      const value = this._config[key] || "";
    
      if (field.value !== value) {
        field.value = value;
      }
    });
    
  }
}

if (!customElements.get("indego-mower-card-editor")) {
  customElements.define("indego-mower-card-editor", IndegoMowerCardEditor);
}
