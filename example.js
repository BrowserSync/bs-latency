var bs = require('browser-sync').create();
var latency = require('path').dirname(require.resolve('./'));

bs.init({
    server:  'test/fixtures',
    plugins: [{
        module: latency,
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

