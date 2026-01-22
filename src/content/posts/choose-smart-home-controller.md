---
title: "Which Smart Home Controller to Choose: My Setup"
description: "People often ask what to build a smart home on. Here’s why I use a Raspberry Pi 4 with Zigbee2MQTT and why I avoid Wi‑Fi devices."
pubDate: 2025-11-02T12:00:00+02:00
author: "DimonB"
image: "/posts/choose-smart-home-controller/banner.webp"

category: "Smart Home"

featured: false
tags:
  - homeassistant
  - zigbee
  - zigbee2mqtt
  - raspberry-pi
---

People often ask: “What should I base my smart home on?” Over the years, I’ve settled on a setup that’s reliable, local, and efficient. Here’s why I run a Raspberry Pi 4 inside a fanless case combined with a Zigbee USB dongle, and why I steer clear of Wi‑Fi devices.

### What matters most

When choosing a smart home controller, I focus on a few key points:

- **Local control**: The system should work without relying on the internet.
- **Reliability**: It needs to run smoothly with minimal restarts and no hidden cloud dependencies.
- **Expandability**: It should be easy to add components like Zigbee2MQTT, ESPHome, databases, and dashboards.
- **Energy efficiency**: Since it runs 24/7, it must stay quiet.

### Why Raspberry Pi 4 with a fanless case?

For the “brain” of my smart home, the Raspberry Pi 4 hits the sweet spot. It’s powerful enough to run Home Assistant, Zigbee2MQTT, and a few other services without breaking a sweat. To keep things silent and dust-free, I use a fanless aluminum case that doubles as a heatsink. For example, this [fanless aluminum case for Raspberry Pi 4](https://he.aliexpress.com/item/1005007792773504.html) works great.

Here’s what I like about this setup:

- Compact, silent, and energy-efficient.
- USB 3.0 support.
- Stable Home Assistant experience, including Supervised mode with add-ons.
- Easy to migrate and recover if needed.

Minimal build essentials:

- Raspberry Pi 4 (4–8 GB recommended; my setup uses 8 GB)
- Reliable 5V/3A power supply (the USB port on my home Wi‑Fi router works fine for my setup)
- USB SSD (preferred over microSD for durability)
- Passive cooling case

### Coordinator: Zigbee via USB dongle

Most of my smart devices use Zigbee and connect through a USB dongle. Mine is quite old (about 10 years), so the exact model isn’t crucial — **any dongle supported by Zigbee2MQTT will do**. The important part is that it’s listed among supported devices and has up-to-date coordinator firmware.

Why I choose Zigbee:

- **Mesh network**: Mains-powered devices like sockets and bulbs extend the network range.
- **Energy efficient**: Battery-powered devices last longer.
- **Local control**: Works completely offline without cloud delays.

### Why I avoid Wi‑Fi devices

Wi‑Fi gadgets often come with closed protocols and cloud lock‑in. This means many features stop working without internet, latency creeps in, and updates from vendors can break integrations. I prefer devices that:

- Work locally out of the box or through projects like Zigbee2MQTT and ESPHome.
- Have clear documentation and Home Assistant compatibility.
- Don’t require a constant cloud connection.

### Alternatives to Raspberry Pi

- **Mini-PC or NUC**: More powerful and pricier; ideal for heavy workloads like video recognition, cameras, databases, or long-term data storage.
- **NAS**: Convenient if you already own one; you can run Home Assistant in a container, but watch out for USB access for the Zigbee coordinator.
- **Vendor hubs**: Easy to start with but often lock you into their ecosystem with less flexibility.


---

### Bottom line

If you want a smart home that’s reliable, controllable, and respects your privacy, the combination of a **Raspberry Pi 4** in a fanless case plus a **Zigbee USB dongle** running **Zigbee2MQTT** is hard to beat. You get local control, predictability, and flexibility — without the headaches of cloud lock‑in or unexpected surprises.
