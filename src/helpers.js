export const DEFAULT_CONFIG = {
  entity: "",
  map_entity: "",
  battery_entity: "",
  charging_entity: "",
  state_detail_entity: "",
  mowed_entity: "",
  mowed_size_entity: "",
  stuck_entity: "",
  alert_entity: "",
  show_map: true,
  show_battery_header: true,
  show_status: true,
  action_layout: "icon",
  theme_button_background: "var(--card-background-color)",
  theme_primary_color: "var(--primary-color)",
  theme_warning_color: "var(--warning-color)",
  theme_error_color: "var(--error-color)",
  theme_border_color: "rgba(0,150,136,0.2)"
};

export function formatValue(entity, fallbackUnit = "") {
  if (!entity) return null;
  const unit = entity.attributes.unit_of_measurement || fallbackUnit;
  return `${entity.state}${unit ? " " + unit : ""}`;
}

export function batteryHeaderColor(percent) {
  if (percent > 70) return "rgba(0,180,0,0.35)";
  if (percent > 30) return "rgba(255,165,0,0.35)";
  return "rgba(200,0,0,0.35)";
}

export function batteryFillColor(percent) {
  if (percent > 50) return "rgba(0,180,0,0.20)";
  if (percent > 25) return "rgba(255,165,0,0.20)";
  return "rgba(255,0,0,0.20)";
}

export function cameraProxyUrl(camera) {
  if (!camera) return "";

  const token = camera.attributes?.access_token;

  return token
    ? `/api/camera_proxy/${camera.entity_id}?token=${token}`
    : `/api/camera_proxy/${camera.entity_id}`;
}

export function getErrorCount(entity) {
  if (!entity) return 0;

  const state = Number(entity.state);
  if (Number.isFinite(state)) {
    return state;
  }

  const alertsCount = Number(entity.attributes?.alerts_count);
  if (Number.isFinite(alertsCount)) {
    return alertsCount;
  }

  const errorCount = Number(entity.attributes?.error_count);
  if (Number.isFinite(errorCount)) {
    return errorCount;
  }

  return 0;
  
}

export function autoDetectIndegoEntities(hass, mowerEntityId) {
  if (!hass || !mowerEntityId) return {};

  const objectId = mowerEntityId.split(".")[1];
  if (!objectId) return {};

  const candidates = {
    map_entity: `camera.${objectId}`,
    battery_entity: `sensor.${objectId}_battery_percentage`,
    charging_entity: `binary_sensor.${objectId}_battery_charging`,
    state_detail_entity: `sensor.${objectId}_mower_state_detail`,
    mowed_entity: `sensor.${objectId}_lawn_mowed`,
    mowed_size_entity: `sensor.${objectId}_lawn_mowed_size`,
    stuck_entity: `binary_sensor.${objectId}_mower_stuck`,
    alert_entity: `binary_sensor.${objectId}_alert`,
  };

  const detected = {};

  Object.entries(candidates).forEach(([key, entityId]) => {
    if (hass.states[entityId]) {
      detected[key] = entityId;
    }
  });

  return detected;
}
