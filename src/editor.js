import { LitElement, html, css } from "lit";
import { DEFAULT_CONFIG, autoDetectIndegoEntities } from "./helpers.js";
import { getTranslations, t } from "./translations.js";

const ACTION_OPTIONS = [
  ["more-info", "More info"],
  ["navigate", "Navigate"],
  ["url", "URL"],
  ["call-service", "Call service"],
  ["assist", "Assist"],
  ["none", "None"],
];

const ACTION_FIELDS = {
  map_entity: "map",
  battery_entity: "battery",
  state_detail_entity: "status",
  mowed_entity: "mowed",
  stuck_entity: "stuck",
  alert_entity: "alerts",
};

export class IndegoMowerCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static styles = css`
    .editor {
      padding: 16px;
    }

    .field {
      margin-bottom: 16px;
    }

    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      gap: 12px;
    }

    .label {
      font-size: 14px;
      font-weight: 500;
    }

    .switch-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .switch-label,
    .sub-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .sub-label {
      margin-bottom: 4px;
    }

    .section-title {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 500;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 10px;
    }

    ha-entity-picker,
    ha-select {
      display: block;
      width: 100%;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    @media (max-width: 600px) {
      .grid-2,
      .action-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  setConfig(config) {
    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const translations = getTranslations(this.hass);

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

    const actionLayoutOptions = [
      ["icon", t(translations, "editor.action_layout_icon")],
      ["text", t(translations, "editor.action_layout_text")],
      ["icon_text", t(translations, "editor.action_layout_icon_text")],
      ["text_icon", t(translations, "editor.action_layout_text_icon")],
    ];

    return html`
      <div class="editor">
        ${fields.map(([key, label, toggleKey]) =>
          this.renderEntityField(translations, key, label, toggleKey)
        )}

        <div class="section-title">${t(translations, "editor.colors")}</div>

        <div class="grid-2">
          ${colorFields.map(([key, label]) => this.renderTextField(key, label))}
        </div>

        <div class="section-title">${t(translations, "editor.action_layout")}</div>

        ${this.renderSelect(
          this._config.action_layout || "icon",
          actionLayoutOptions,
          (value) => this.updateConfig({ action_layout: value || "icon" })
        )}
      </div>
    `;
  }

  renderEntityField(translations, key, label, toggleKey) {
    return html`
      <div class="field">
        <div class="field-header">
          <div class="label">${label}</div>

          ${toggleKey
            ? html`
                <div class="switch-row">
                  <span class="switch-label">
                    ${t(translations, `editor.${toggleKey}`)}
                  </span>
                  <ha-switch
                    .checked=${this._config[toggleKey] !== false}
                    @change=${(event) =>
                      this.updateConfig({ [toggleKey]: event.target.checked })}
                  ></ha-switch>
                </div>
              `
            : html``}
        </div>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config[key] || ""}
          .includeDomains=${key === "entity" ? ["lawn_mower"] : undefined}
          allow-custom-entity
          @value-changed=${(event) => this.handleEntityChanged(key, event)}
        ></ha-entity-picker>

        ${ACTION_FIELDS[key] ? this.renderActionControls(ACTION_FIELDS[key]) : html``}
      </div>
    `;
  }

  renderActionControls(prefix) {
    return html`
      <div class="action-grid">
        ${this.renderActionSelect(prefix, "tap", "Tap action")}
        ${this.renderActionSelect(prefix, "double_tap", "Double tap")}
        ${this.renderActionSelect(prefix, "hold", "Hold action")}
      </div>
    `;
  }

  renderActionSelect(prefix, actionType, label) {
    const configKey = `${prefix}_${actionType}_action`;
    const value =
      this._config[configKey]?.action ||
      (actionType === "tap" ? "more-info" : "none");

    return html`
      <div>
        <div class="sub-label">${label}</div>
        ${this.renderSelect(value, ACTION_OPTIONS, (selectedValue) =>
          this.updateConfig({
            [configKey]: { action: selectedValue },
          })
        )}
      </div>
    `;
  }

  renderTextField(key, label) {
    return html`
      <label>
        <div class="sub-label">${label}</div>
        <input
          type="text"
          .value=${this._config[key] || ""}
          @change=${(event) => {
            const value = event.target.value?.trim();
            const config = { ...this._config };

            if (value) {
              config[key] = value;
            } else {
              delete config[key];
            }

            this.setAndDispatchConfig(config);
          }}
        />
      </label>
    `;
  }

  renderSelect(value, options, onChange) {
    return html`
      <ha-select
        .value=${value}
        naturalMenuWidth
        fixedMenuPosition
        @closed=${(event) => event.stopPropagation()}
      >
        ${options.map(
          ([optionValue, label]) => html`
            <mwc-list-item
              .value=${optionValue}
              ?selected=${value === optionValue}
              @click=${(event) => {
                onChange(optionValue);
  
                const select = event.target.closest("ha-select");
                if (select) {
                  select.open = false;
                }
              }}
            >
              ${label}
            </mwc-list-item>
          `
        )}
      </ha-select>
    `;
  }

  handleEntityChanged(key, event) {
    const value = event.detail.value;
    const config = { ...this._config };

    if (value) {
      config[key] = value;

      if (key === "entity") {
        const detected = autoDetectIndegoEntities(this.hass, value);

        Object.entries(detected).forEach(([detectedKey, detectedValue]) => {
          if (!config[detectedKey]) {
            config[detectedKey] = detectedValue;
          }
        });
      }
    } else {
      delete config[key];
    }

    this.setAndDispatchConfig(config);
  }

  updateConfig(changes) {
    this.setAndDispatchConfig({
      ...this._config,
      ...changes,
    });
  }

  setAndDispatchConfig(config) {
    this._config = config;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (!customElements.get("indego-mower-card-editor")) {
  customElements.define("indego-mower-card-editor", IndegoMowerCardEditor);
}
