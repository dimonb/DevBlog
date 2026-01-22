---
title: "Automating Blinds with Zigbee and Home Assistant"
description: "Automate blinds with Zigbee and Home Assistant! Learn how I integrated my blinds using a Zigbee relay switch, precise timed controls, and custom automations without sensors."
pubDate: 2024-11-09T16:38:06+02:00
author: "DimonB"
image: "/posts/curtain-control/banner.webp"
category: "Home Assistant"
featured: false
tags:
  - homeassistant
  - zigbee
---


I have blinds on my window and for a long time, I was wondering how to integrate them into my Home Assistant setup. The blinds are operated by a standard three-position switch that controls a motor to either open or close the blinds. The challenge was to make these blinds smart without using any dedicated position sensors, which would normally tell me whether the blinds are fully open, fully closed, or somewhere in between.

To start, I decided to use a Zigbee relay switch like this one from AliExpress: [Zigbee Relay Switch](https://www.aliexpress.com/item/1005004912874347.html?spm=a2g0o.order_list.order_list_main.426.503c5e5be9TP04). However, you can use any similar switch that has basic on/off relay functionality. The switch I chose exposes two separate entities for control, each responsible for moving the blinds in one direction. One downside of using these relay switches is that both relays can be activated at the same time, which results in the motor making an unpleasant noise. Therefore, part of the challenge was to prevent simultaneous activation of both relays.

The next problem was that there is no feedback mechanism to determine the current position of the blinds. Typically, such feedback could be obtained using sensors or current draw detection, but the chosen switch does not have this capability. Hence, I realized that the only feasible way to determine the position was by measuring the time it takes to move from fully open to fully closed (13 seconds in my case). Using a timed approach, I could approximate the position of the blinds at any point.

Below are the automations and scripts I created to integrate everything into a control panel for managing the blinds in Home Assistant. This setup allows for convenient control of the blinds, including the ability to open, close, or set them to any percentage of openness.

### Automation to Prevent Both Relays from Turning On

The first automation is designed to ensure that both relays cannot be activated simultaneously. In my case, the switch exposes two entities, `switch.curtain_switch01_left` and `switch.curtain_switch01_right`, which correspond to the left and right relays respectively. The left relay is used for opening the blinds, while the right relay is used for closing.

To prevent simultaneous activation, I implemented two automations. When one switch turns on, the other is automatically turned off. This prevents both switches from being active at the same time, avoiding the motor overload.

```yaml
alias: Curtain sw restrict left
description: ""
triggers:
  - platform: state
    entity_id:
      - switch.curtain_switch01_left
    from: "off"
    to: "on"
conditions: []
actions:
  - service: switch.turn_off
    target:
      entity_id: switch.curtain_switch01_right
mode: single
```

And vice versa:

```yaml
alias: Curtain sw restrict right
description: ""
triggers:
  - platform: state
    entity_id:
      - switch.curtain_switch01_right
    from: "off"
    to: "on"
conditions: []
actions:
  - service: switch.turn_off
    target:
      entity_id: switch.curtain_switch01_left
mode: single
```

### Helper Entities

To manage the automation, we need three helper entities:

- `input_number.bedroom_blinds_position` - Stores the current position of the blinds, as a percentage from 0 (fully closed) to 100 (fully open).
- `input_datetime.bedroom_blinds_moving_start` - Records the timestamp of when the blinds started moving. This helps calculate how long they have been moving.
- `input_text.bedroom_blinds_moving_direction` - Stores the direction in which the blinds are currently moving (`opening` or `closing`).

### Position Sensor

Since there are no physical sensors to detect the current position, I created a sensor to calculate the estimated position of the blinds in real time. Here is the template sensor for `sensor.bedroom_blinds_current_position`. It calculates the position based on the direction and the elapsed time since the blinds started moving:

```yaml
{% set direction = states('input_text.bedroom_blinds_moving_direction') %}
{% set current_position = float(states('input_number.bedroom_blinds_position')) %}
{% set current_time = now().timestamp() %}
{% set movement_start_time = states('input_datetime.bedroom_blinds_moving_start') %}
{% set delta_time = current_time - as_timestamp(movement_start_time) %}
{% set time_per_percent = 13 / 100 %}  # Assuming it takes 13 seconds to move from fully closed to fully open
{% set delta_position = delta_time / time_per_percent %}

{% if direction == 'opening' %}
  {{ min(current_position + delta_position, 100) | float }}
{% elif direction == 'closing' %}
  {{ max(current_position - delta_position, 0) | float }}
{% else %}
  {{ current_position | float }}
{% endif %}
```

This sensor calculates the position of the blinds by estimating how far they have moved from the start time, using a fixed time-per-percentage value. The `time_per_percent` value is derived from the total time taken to fully open or close the blinds.

### Scripts to Open/Close Blinds for a Duration

To facilitate movement control, I created scripts that open or close the blinds for a specified duration. This is essential for setting the blinds to a specific position.

#### Script to Open the Blinds for `N` Seconds

```yaml
alias: bedroom_blinds_open_for_duration
sequence:
  - service: switch.turn_on
    target:
      entity_id: switch.curtain_switch01_left
  - delay: "{{ duration }}"
  - service: switch.turn_off
    target:
      entity_id: switch.curtain_switch01_left
description: Open blinds for a specified duration
fields:
  duration:
    description: Duration in seconds
    example: 5
mode: single
icon: mdi:blinds-horizontal-closed
```

#### Script to Close the Blinds for `N` Seconds

```yaml
alias: bedroom_blinds_close_for_duration
sequence:
  - service: switch.turn_on
    target:
      entity_id: switch.curtain_switch01_right
  - delay: "{{ duration }}"
  - service: switch.turn_off
    target:
      entity_id: switch.curtain_switch01_right
description: Close blinds for a specified duration
fields:
  duration:
    description: Duration in seconds
    example: 5
mode: single
icon: mdi:blinds-horizontal-closed
```

### Script to Move Blinds to a Specified Position

To move the blinds to a desired position, I created the following script. This script calculates the required movement time based on the current and target positions, and then calls the appropriate open or close script.

```yaml
description: Move blinds to a specified position
fields:
  position:
    description: Desired position (0-100)
    example: 50
sequence:
  - variables:
      current_position: "{{ states('input_number.bedroom_blinds_position') | int }}"
      desired_position: "{{ position | int }}"
      delta_position: "{{ desired_position - current_position }}"
      time_per_percent: "{{ 13 / 100 }}"
      duration: "{{ (delta_position | abs * time_per_percent) | float }}"
  - choose:
      - conditions:
          - condition: template
            value_template: "{{ delta_position < 0 }}"
        sequence:
          - service: script.bedroom_blinds_close_for_duration
            data:
              duration: "{{ duration }}"
      - conditions:
          - condition: template
            value_template: "{{ delta_position > 0 }}"
        sequence:
          - service: script.bedroom_blinds_open_for_duration
            data:
              duration: "{{ duration }}"
alias: bedroom_blinds_move_to_position
mode: single
icon: mdi:blinds-horizontal
```

### Configuration for `cover`

In `configuration.yaml`, I added a `cover` configuration that allows Home Assistant to treat the blinds as a cover device. This provides a unified interface for controlling the blinds.

```yaml
cover:
  - platform: template
    covers:
      bedroom_window:
        unique_id: bedroom_cover
        device_class: blind
        set_cover_position:
          service: script.bedroom_blinds_move_to_position
          data:
            position: "{{position}}"
        position_template: "{{ states('sensor.bedroom_blinds_current_position') }}"
```

With this configuration, I can control the blinds using the Home Assistant `cover` entity, which allows me to specify the desired position directly in the UI or through voice assistants like Apple HomeKit.

### Start and Stop Scripts for Blinds

Two additional scripts are needed to handle the start and stop of blinds movement. These scripts record the time and direction when the blinds start moving and calculate the final position when the movement stops.

#### Start Script

This script is triggered whenever the blinds start moving, and it records the start time and movement direction.

```yaml
alias: bedroom_blinds_start
sequence:
  - variables:
      current_time: "{{ now().timestamp() }}"
      direction: >-
        {{ iif(is_state('switch.curtain_switch01_left', 'on'), 'opening',
        iif(is_state('switch.curtain_switch01_right', 'on'), 'closing',
        'stopped')) }}
  - service: input_datetime.set_datetime
    data:
      timestamp: "{{ current_time }}"
    target:
      entity_id: input_datetime.bedroom_blinds_moving_start
  - service: input_text.set_value
    target:
      entity_id: input_text.bedroom_blinds_moving_direction
    data:
      value: "{{ direction }}"
mode: single
description: ""
```

#### Stop Script

This script is triggered when the blinds stop moving, either because the desired position is reached or manually stopped. It calculates the new position based on the elapsed time and updates the `input_number.bedroom_blinds_position` accordingly.

```yaml
alias: bedroom_blinds_stop
sequence:
  - variables:
      current_position: "{{ states('input_number.bedroom_blinds_position') | float }}"
      current_time: "{{ now().timestamp() }}"
      movement_start_time: "{{ as_timestamp(states('input_datetime.bedroom_blinds_moving_start')) }}"
      delta_time: "{{ current_time - movement_start_time }}"
      time_per_percent: "{{ 13 / 100 }}"
      delta_position: "{{ (delta_time / time_per_percent) | float }}"
      direction: "{{ states('input_text.bedroom_blinds_moving_direction') | string }}"
  - service: input_number.set_value
    data:
      entity_id: input_number.bedroom_blinds_position
      value: |
        {% if direction == 'opening' %}
          {{ min(current_position + delta_position, 100) }}
        {% elif direction == 'closing' %}
          {{ max(current_position - delta_position, 0) }}
        {% else %}
          {{ current_position }}
        {% endif %}
  - service: switch.turn_off
    target:
      entity_id:
        - switch.curtain_switch01_left
        - switch.curtain_switch01_right
  - service: input_text.set_value
    data:
      value: stopped
    target:
      entity_id: input_text.bedroom_blinds_moving_direction
mode: single
description: ""
```

### Automations for Starting and Stopping Movement

To ensure the start and stop scripts are executed correctly, I created two automations that are triggered whenever the blinds start or stop moving.

#### Start Automation

This automation is triggered when either of the relays is turned on, indicating that the blinds have started moving.

```yaml
alias: Bedroom Blinds Start Movement
triggers:
  - platform: state
    entity_id:
      - switch.curtain_switch01_left
      - switch.curtain_switch01_right
    to: "on"
actions:
  - service: script.bedroom_blinds_start
mode: single
```

#### Stop Automation

This automation is triggered when both relays are turned off, indicating that the blinds have stopped moving.

```yaml
alias: Bedroom Blinds Stop Movement
triggers:
  - platform: state
    entity_id:
      - switch.curtain_switch01_left
      - switch.curtain_switch01_right
    to: "off"
actions:
  - service: script.bedroom_blinds_stop
mode: single
```

### Summary

With these automations, scripts, and configurations, I now have a comprehensive control system for managing my blinds. The system allows me to open, close, or adjust the blinds to a specific percentage with ease. Moreover, this setup is seamlessly integrated with Apple HomeKit, allowing me to control the blinds through voice commands or directly from my phone. The timed approach for estimating the position works surprisingly well, providing a simple yet effective solution without the need for additional sensors.

![Blinds Control Panel](/posts/curtain-control/blinds-control-panel.webp)

It all comes together beautifully, creating a smart home experience that feels almost magical!
