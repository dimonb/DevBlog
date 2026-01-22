---
title: "Installing Home Assistant in Supervised Mode"
description: "Learn how to install Home Assistant in Supervised Mode on an unsupported OS like Ubuntu."
pubDate: 2024-11-14T16:38:36+02:00
author: "DimonB"

category: "Technology"
featured: false
tags:
  - homeassistant
  - garmin
---


The main advantage of Supervised Mode is the ability to install add-ons. This makes it easy to integrate tools like Zigbee2MQTT, ESPHome, Grafana, and many other useful add-ons without having to configure each one manually. Essentially, these add-ons are Docker containers with specifications that define access permissions, configuration parameters, and other necessary settings.

A detailed installation guide can be found [here](https://github.com/home-assistant/supervised-installer). Unfortunately, one of the requirements is Debian 12, as other operating systems are not officially supported.

If you attempt to install it on Ubuntu, you’ll encounter an incompatibility error:

```log
[error] Ubuntu 24.04.1 LTS is not supported!
dpkg: error processing archive homeassistant-supervised.deb (--install):
 new homeassistant-supervised package pre-installation script subprocess returned error exit status 1
```

After considerable research through forums and source code, I discovered an environment variable that bypasses this restriction, allowing installation on an unsupported OS:

```bash
sudo BYPASS_OS_CHECK=true dpkg -i homeassistant-supervised.deb
```

And voilà, Supervised Home Assistant is installed! In this mode, it may take some time to start up (around 5–10 minutes on a Raspberry Pi 4), but in return, you get a convenient way to manage add-ons.
