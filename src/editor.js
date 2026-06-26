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
      ["map_entity", t(translations, "editor.map")],
      ["battery_entity", t(translations, "editor.battery")],
      ["charging_entity", t(translations, "editor.charging")],
      ["state_detail_entity", t(translations, "editor.state_detail")],
      ["mowed_entity", t(translations, "editor.mowed")],
      ["mowed_size_entity", t(translations, "editor.mowed_size")],
      ["stuck_entity", t(translations, "editor.stuck")],
      ["alert_entity", t(translations, "editor.errors")],
    ];

    this.innerHTML = `
      <div style="padding:16px;">
        ${fields
          .map(([key, label]) => {
            if (key === "map_entity") {
              return `
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                  <ha-entity-picker
                    label="${label}"
                    config-value="${key}"
                    allow-custom-entity
                    style="flex:1;"
                  ></ha-entity-picker>
    
                  <ha-formfield label="${t(translations, "editor.show_map")}">
                    <ha-switch config-value="show_map"></ha-switch>
                  </ha-formfield>
                </div>
              `;
            }
    
            return `
              <ha-entity-picker
                label="${label}"
                config-value="${key}"
                allow-custom-entity
                style="display:block; margin-bottom:12px;"
              ></ha-entity-picker>
            `;
          })
          .join("")}
      </div>
    `;

    const showMapSwitch = this.querySelector('ha-switch[config-value="show_map"]');
    
    if (showMapSwitch) {
      showMapSwitch.checked = this._config.show_map !== false;
    
      showMapSwitch.addEventListener("change", (event) => {
        const config = {
          ...this._config,
          show_map: event.target.checked,
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
    }

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
    const showMapSwitch = this.querySelector('ha-switch[config-value="show_map"]');
    
    if (showMapSwitch) {
      showMapSwitch.checked = this._config.show_map !== false;
    }
  }
}

if (!customElements.get("indego-mower-card-editor")) {
  customElements.define("indego-mower-card-editor", IndegoMowerCardEditor);
}
