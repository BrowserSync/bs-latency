var config = exports;

config.PLUGIN_USER  = "shakyshane";
config.PLUGIN_NAME  = "Latency";
config.PLUGIN_SLUG  = "latency";
config.OPT_PATH     = [config.PLUGIN_USER, config.PLUGIN_SLUG];
config.NS           = config.OPT_PATH.join(":");
config.EVENT_UPDATE = [config.PLUGIN_USER, config.PLUGIN_SLUG, 'updated'].join(":");
config.TAG_LINE     = "Simulate slower connections by throttling the response time of each request.";

module.exports = config;
