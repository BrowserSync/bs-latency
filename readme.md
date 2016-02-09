## bs-latency

> Add artificial latency to defined routes.

### Install

```shell
npm i browser-sync bs-latency
```

### Usage

```js
var bs = require('browser-sync').create();

bs.init({
    server: './app',
    plugins: ['bs-latency']
});
``` 

Now access the Plugins section of the UI (address given in the console)
& you'll be presented with:

![bs-latency](http://i.giphy.com/d4bmzddk72QKsXeM.gif)

### Why use this over the Network Throttle in Browsersync?

Network throttle is a site-wide setting, but sometime you just want to
simulate a slow response for certain assets/urls. For example, when developing
a gallery feature for a website & you're trying to nail the loading animations
and 'waiting' states, it can be helpful to add a short delay to the image request.


### Pre-defines routes.

You can add/edit routes in the 'Plugins' section of the UI, but if you want to always begin
with some pre-defined ones, configure it like this.

```js
var bs = require('browser-sync').create();

bs.init({
    server:  './app',
    plugins: [{
        module: 'bs-latency',
        options: {
            routes: [
                {
                    route: '/json',
                    latency: 5000,
                    active: true
                }
            ]
        }
    }]
});
```
