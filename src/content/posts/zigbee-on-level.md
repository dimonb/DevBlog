---
title: "Zigbee turn on Level"
description: "Learn how to configure Zigbee lights to remember their previous brightness level when turned on. A simple MQTT setup ensures consistent lighting preferences in your smart home."
pubDate: 2024-11-09T15:33:16+02:00
author: "DimonB"
image: "/posts/zigbee-on-level/banner.webp"

category: "Zigbee & Networks"

featured: false
tags:
  - homeassistant
  - zigbee
---

Sometimes, you may encounter a situation where a Zigbee light turns on at its minimum brightness by default. After a bit of research, it turns out there's a setting that defines the brightness level of the light upon turning on. Interestingly, among several lights, one had its brightness level set to 1 at startup.

Here's how to set it up:

```yaml
action: mqtt.publish
data:
  topic: zigbee2mqtt/celing_lamp1/set
  payload: "{\"level_config\": {\"on_level\": \"previous\"}}"
```

As implied by the command, this mode sets the light to its previous brightness level upon turning on.
