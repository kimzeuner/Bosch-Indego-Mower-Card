# Bosch Indego Mower Card

> A modern Home Assistant Lovelace card for Bosch Indego robotic mowers — live map, battery visualization, mower controls and statistics in a single compact card.

![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Custom%20Card-blue?style=for-the-badge&logo=home-assistant)
[![Bosch Indego](https://img.shields.io/badge/Bosch-Indego-green?style=for-the-badge)](https://github.com/sander1988/indego)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange?style=for-the-badge)](https://hacs.xyz/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Donate](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.me/KZeuner)

> **Note**
> This card was developed for the Bosch Indego integration but is also compatible with standard Home Assistant `lawn_mower` entities.

---

## Features

- **Live mower map** — real-time camera entity overlay
- **Dynamic battery** — visual charge indicator with charging state
- **Mowing statistics** — mowed percentage and area
- **Controls** — start, pause, and return to dock
- **Alert counter** — surfaces errors from sensors, counters, or binary sensors
- **Stuck indication** — dedicated binary sensor support
- **Visual editor** — configure without writing YAML
- **Localization** — English and German
- **Full theme support** — adapts to your Home Assistant theme

---

## Screenshots

| Mowing | Docked | Visual Editor |
|---|---|---|
| ![Mowing](images/mower_card_mowing.png) | ![Docked](images/mower_card_docked.png) | ![Editor](images/mower_card_visual_editor.png) |

---

## Installation

### Via HACS (Recommended)

1. Open **HACS** → **Frontend**
2. Click the three-dot menu → **Custom Repositories**
3. Add repository: https://github.com/kimzeuner/Bosch-Indego-Mower-Card
Category: **Dashboard**
4. Install **Bosch Indego Mower Card**
5. Restart Home Assistant

### Manual

1. Download the latest release and copy `indego-mower-card.js` to `/config/www/`
2. Add a dashboard resource:
```yaml
   resources:
     - url: /local/indego-mower-card.js
       type: module
```
3. Restart Home Assistant

---

## Configuration

The card supports both the visual editor and manual YAML configuration.

### Required

| Option | Description |
|---|---|
| `entity` | Lawn mower entity |

### Optional

| Option | Description |
|---|---|
| `map_entity` | Camera entity for the live mower map |
| `battery_entity` | Battery percentage sensor |
| `charging_entity` | Charging binary sensor |
| `state_detail_entity` | Detailed mower status sensor |
| `mowed_entity` | Mowed percentage sensor |
| `mowed_size_entity` | Mowed area sensor |
| `stuck_entity` | Binary sensor indicating whether the mower is stuck |
| `alert_entity` | Alert entity — supports sensors, counters, and Bosch alert binary sensors |

### Example

```yaml
type: custom:indego-mower-card
entity: lawn_mower.indego
map_entity: camera.indego
battery_entity: sensor.indego_battery
charging_entity: binary_sensor.indego_charging
state_detail_entity: sensor.indego_state_detail
mowed_entity: sensor.indego_mowed
mowed_size_entity: sensor.indego_mowed_area
stuck_entity: binary_sensor.indego_stuck
alert_entity: binary_sensor.indego_alert
```

---

## Alert Entity Support

The card automatically handles multiple entity types for the alert/error counter.

| Type | Example | Value source |
|---|---|---|
| Counter | `counter.indego_errors` | Entity state |
| Sensor | `sensor.indego_errors` | Entity state |
| Bosch Binary Sensor | `binary_sensor.indego_alert` | `alerts_count` attribute — no template sensor needed |

---

## Compatibility

| Component | Version |
|---|---|
| Home Assistant | 2026.6.x |
| Bosch Indego Integration | latest |

---

## Contributing

Bug reports, feature requests and pull requests are welcome — please open an [Issue or PR on GitHub](https://github.com/kimzeuner/Bosch-Indego-Mower-Card).

---

## License

Released under the [MIT License](LICENSE).
