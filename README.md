# Kubernetes + Hood logger + Hood agent => APM

# Hood Logger

![Jaeger trace example](https://github.com/asafsemo/hood_hoodjs-logger/blob/init/docs/jaeger_screenshot.png)

## Motivation
My biggest motivation behind creating Hood project is to provide APM for each project without the need to integrate special libraries into the code.
Each developer from the first line he writes in any project includes writing logs, I find there is a lot of data in those logs and with the usage of hood logger and agent in the Kubernetes environment we can provide you a lot of data.
The amazing gain each developer is getting by using hood logger & agent is the separation of concern between the business logic of your project and the monitoring of the code.
Clean Architecture recommend this approach.
Each integration of additional external service will be handled by the hood agent, and the requirements from the developer will always be to add more information in the logs.

## Quick start
Several ways to use Hood logger in a project, please review our example folder.
tasks:
* Add dependency in file package.json – 
"@hood/hoodjs-logger": "^2.0.2"

NOTE: using Bunyan CLI on the developer machine will transform the logs from json object to a text line which can be read by human :)

In order to install Hood Agent send an email to: asafsemo@gmail.com

## Installation
``` bash
npm install --save @hood/hoodjs-logger
```

# Usage
The recommended way to use hood logger, we recommend the minimum usage of log lines that are not related to traces.

## Table of content
* [Motivation](#motivation)
* [Quick start](#quick-start)
* [Installation](#installation)
* [Usage](#usage)
* [Table of content](#table-of-content)
* [Integration to external systems](#Integration-to-external-systems)
* [Logging]()
    * [Log levels]()
    * [Logger functions]()
* [Trace logger]()
    * [Create root trace logger]()
    * [Create child trace logger]()
* [Logger create params]()
* [Logger format]()
* [Using bunyan CLI on developer computer]()
* [Examples]()
* [Code snippets]()
* [Installing Hood agent on Kubernetes and receiving APM]()
* [Exceptions]()
    * [Handling uncaught exception]()
* [Tests]()

# Integration to external systems
At the current time Hood agent is sending data to hood servers, and Jaeger (https://www.jaegertracing.io/)

Screenshot from Hood service:

![Hood Web UI](https://github.com/asafsemo/hood_hoodjs-logger/blob/init/docs/hood_screenshot.png)

Future integrations:
Loggly (https://www.loggly.com/), Sentry (https://sentry.io/welcome/), Logz.io (https://logz.io/) 

# Logging
## Log levels
## Logger functions

# Trace Logger
## Create root trace logger
## Create child trace logger

# Logger create params
# Logger format
# Using bunyan CLI on developer computer
# Examples
# Code snippets
# Installing Hood agent on Kubernetes and receiving APM
# Exceptions
## Handling uncaught exception

# Tests


``` js
const a = hello;

```


#### Author: [Asaf Semo]
