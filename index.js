/**
 *
 * Latency
 *  - a Browsersync.io plugin.
 *
 */
var config    = require("./config");
//var utils     = require("./utils");
var Immutable = require("immutable");

/**
 * @param {Object} opts
 * @param {BrowserSync} bs
 */
module.exports["plugin"] = function (opts, bs) {

    const ui         = bs.ui;
    const optPath    = config.OPT_PATH;
    var pluginActive = true;
    const itemsPath  = config.OPT_PATH.concat('items');
    const items   = opts.routes && opts.routes.length
        ? Immutable.fromJS(opts.routes)
        : Immutable.List([]);

    var mutableItems = [];

    bs.addMiddleware('*', function (req, res, next) {
        if (!pluginActive) {
            return next();
        }
        var match = mutableItems.filter(function (item) {
            return req.url.match(new RegExp('^' + item.route)) && item.active;
        });
        if (match.length && match[0].active) {
            setTimeout(next, match[0].latency);
        } else {
            next();
        }
    }, {override: true});


    ui.setOptionIn(optPath, Immutable.Map({
        name: config.PLUGIN_SLUG,
        title: config.PLUGIN_NAME,
        active: true,
        tagline: config.TAG_LINE,
        rate: 0,
        config: config,
        items: Immutable.List([])
    }));

    var uid = items.size;

    bs.events.on('plugins:configure', function (data) {
        if (data.name !== config.PLUGIN_NAME) {
            return;
        }
        pluginActive = data.active;
        ui.options = ui.options.setIn(config.OPT_PATH.concat('active'), data.active);
    });

    function resendItems(updated) {
        ui.options = updated;
        mutableItems = ui.options.getIn(itemsPath).toJS();
        ui.socket.emit(config.EVENT_UPDATE, {items:mutableItems});
    }

    var methods = {
        add: function (incoming) {

            if (!incoming.route.match(/^\//)) {
                incoming.route = '/' + incoming.route;
            }

            if (incoming.id !== undefined) {
                methods.edit(incoming);
                return;
            }

            const updated = ui.options.updateIn(itemsPath, function (items) {

                const match = items.filter(function (item) {
                    return item.get('route') === incoming.route;
                });

                if (match.size) {
                    return items;
                }

                return items.push(Immutable.fromJS(incoming).set('id', uid++));
            });
            resendItems(updated);
        },
        delete: function (incomingItem) {
            const updated = ui.options.updateIn(itemsPath, function (items) {
                return items.filter(function (item) {
                    return item.get('id') !== incomingItem.id;
                })
            });
            resendItems(updated);
        },
        pause: function (incoming) {
            const updated = ui.options.updateIn(itemsPath, function (items) {
                return items.map(function (item) {
                    if (item.get('id') === incoming.id) {
                        return item.merge({active: incoming.active});
                    }
                    return item;
                });
            });
            resendItems(updated);
        },
        edit: function (incoming) {
            const updated = ui.options.updateIn(itemsPath, function (items) {
                return items.map(function (item) {
                    if (item.get('id') === incoming.id) {
                        return item.merge({
                            route: incoming.route,
                            latency: incoming.latency,
                            active: incoming.active
                        });
                    }
                    return item;
                });
            });
            resendItems(updated);
        },
        event: function (event) {
            methods[event.event](event.data);
        }
    };

    if (opts.routes && opts.routes.length) {
        opts.routes.forEach(function (item) {
            methods.add(item);
        })
    }

    ui.listen(config.NS, methods);

    return methods;
};

/**
 * Plugin name.
 * @type {string}
 */
module.exports["plugin:name"] = config.PLUGIN_NAME;
