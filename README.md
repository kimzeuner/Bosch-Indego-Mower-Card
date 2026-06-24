# Bosch Indego Mower Card

A custom Home Assistant Lovelace card for Bosch Indego robotic mowers.

The card provides a compact dashboard including:

- Live mower map
- Current mower status
- Start / Pause / Dock controls
- Battery visualization
- Mowing progress
- Error indication
- Stuck detection
- Visual configuration editor

## Features

### Live Map

Displays the mower map directly from a camera entity.

### Status Information

Shows the current mower status using any configured sensor.

### Dynamic Statistics

Displays:

- Mowed percentage
- Mowed area
- Error count
- Stuck state
- Battery charge

Statistics automatically adapt to the configured entities.

### Battery Visualization

Two battery indicators are available:

- Header battery bar while mowing
- Vertical battery level indicator while docked

Battery colors:

| Level | Color |
|---------|---------|
| 0-25% | Red |
| 25-50% | Orange |
| 50-100% | Green |

### Mower Controls

Direct mower control via:

- Start mowing
- Pause mowing
- Return to dock

Uses Home Assistant lawn mower services.

### Visual Editor

Supports Home Assistant's visual card editor with entity pickers.

No YAML editing required.

---

## Installation

### HACS

1. Open HACS
2. Add this repository as a custom repository
3. Install **Indego Mower Card**
4. Reload Home Assistant

### Manual Installation

Copy:

```text
indego-mower-card.js
```

to:

```text
/config/www/
```

Add the resource:

```yaml
resources:
  - url: /local/indego-mower-card.js
    type: module
```

Reload Home Assistant.

---

## Configuration

### Visual Editor

Simply add the card and select your entities.

### YAML Example

```yaml
type: custom:indego-mower-card
entity: lawn_mower.indego_123456
map_entity: camera.indego_map
battery_entity: sensor.indego_battery
charging_entity: binary_sensor.indego_charging
state_detail_entity: sensor.indego_status
mowed_entity: sensor.indego_mowed_percent
mowed_size_entity: sensor.indego_mowed_area
stuck_entity: binary_sensor.indego_stuck
error_entity: counter.indego_errors
```

---

## Required Entity

| Option | Description |
|----------|----------|
| entity | Lawn mower entity |

---

## Optional Entities

| Option | Description |
|----------|----------|
| map_entity | Camera entity for map display |
| battery_entity | Battery percentage sensor |
| charging_entity | Charging state sensor |
| state_detail_entity | Detailed mower status |
| mowed_entity | Mowed percentage |
| mowed_size_entity | Mowed area |
| stuck_entity | Mower stuck indicator |
| error_entity | Error counter |

---

## Screenshots

_Add screenshots here_

---

## Compatibility

Tested with:

- Bosch Indego
- Home Assistant 2026.6.x

---

## License

MIT License
