---
title: "Localtuya templating problem fix"
description: "Learn how to manage smart home infrared controllers locally with LocalTuya for full offline control. Discover how I fixed a Home Assistant template issue for seamless integration."
pubDate: 2024-11-20T08:47:13+01:00
author: "DimonB"
image: "/posts/localtuya-templating/banner.webp"

category: "Home Assistant"
featured: false
tags:
  - homeassistant
  - localtuya
---


To manage my smart home, I use infrared controllers
([like these](https://promotion.tuya.com/solution/CMa8f7dk0e3sb7-en)). 
By using the LocalTuya project, I ensure independence from the cloud, allowing me to control these devices locally without relying on an internet connection. 


During my experiments with the air conditioner (which I will discuss in the next article), I found that it was not possible to send a command through LocalTuya using the Home Assistant template language:

```yaml
    - action: localtuya.set_dp
      data:
        device_id: {{ python_script_output['device'] }}
        dp: 201
        value: >-
          {"control":"send_ir","head":"{{ python_script_output['head'] }}","key1":"{{ python_script_output['packet'] }}","type":0,"delay":300}
```

This template resulted in no response, and the command was simply ignored.

Through debugging, I learned that the `localtuya.set_dp` method requires a string as a parameter, whereas the templating engine was providing an object. Fortunately, a minor fix available [here](https://github.com/rospogrigio/localtuya/commit/6e2b2f7627754c85631e8a2ad31a1c466050bd6a) addresses this problem.
