---
title: "Fixing ESPHome CairoSVG Error on macOS Homebrew Installation"
description: "Quick fix for the CairoSVG dependency error when running ESPHome installed via Homebrew on macOS."
pubDate: 2025-02-21T12:00:00+02:00
author: "DimonB"

category: "ESPHome & DIY"
image: "/posts/esphome-cairosvg/banner.webp"

featured: false
tags:
  - esphome
  - homeassistant
  - macos
---

If you use ESPHome on macOS installed via Homebrew and encounter an error like this:

```sh
Failed config

image: [source esp32-s3-box-3-5aac68 copy.yaml:152]
  
  Please install the cairosvg python package to use this feature. (pip install cairosvg).
  - file: mdi:volume-off
    id: mute_icon
    resize: 40x40
    type: rgb
```

This issue is caused by the missing `cairosvg` Python package in the ESPHome virtual environment used by Homebrew.

#### The Fix

To resolve this, install `cairosvg` inside ESPHome’s virtual environment. Run the following command:

```bash
/opt/homebrew/Cellar/esphome/2025.2.0/libexec/bin/python -m pip install cairosvg
```

This ensures that `cairosvg` is installed in the correct environment and ESPHome can access it properly.

#### Why Does This Happen?

Homebrew installs ESPHome within its own isolated Python environment under `/opt/homebrew/Cellar/esphome/`. Since ESPHome’s dependencies are managed separately from the system Python, installing `cairosvg` globally (`pip install cairosvg`) will not affect the ESPHome environment.

To check if `cairosvg` is installed inside the ESPHome environment, you can run:

```bash
/opt/homebrew/Cellar/esphome/2025.2.0/libexec/bin/python -m pip list | grep -i cairosvg
```

If no output is returned, the package is missing and needs to be installed using the fix above.

#### Conclusion

With this simple fix, you can continue using ESPHome without issues. If you encounter other missing dependencies, you can install them in the same way by substituting `cairosvg` with the required package name.

