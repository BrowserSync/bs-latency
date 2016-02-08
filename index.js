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

    const ui      = bs.ui;
    const optPath = config.OPT_PATH;
    const items   = opts.routes && opts.routes.length
        ? Immutable.fromJS(opts.routes)
        : Immutable.List([]);

    ui.setOptionIn(optPath, Immutable.Map({
        name: config.PLUGIN_SLUG,
        title: config.PLUGIN_NAME,
        active: true,
        tagline: config.TAG_LINE,
        rate: 0,
        config: config,
        items: items.map(function (item, i) {
            return item.set('id', i);
        })
    }));

    var uid = items.size;

    bs.events.on('plugins:configure', function (data) {
        ui.options = ui.options.updateIn(config.OPT_PATH.concat('active'), function () {
            return data.active;
        });
        console.log(ui.options.getIn(config.OPT_PATH));
    });

    function resendItems(updated) {
        ui.options = updated;
        ui.socket.emit(config.EVENT_UPDATE, {items:ui.options.getIn(config.OPT_PATH.concat('items'))})
    }

    var methods = {
        add: function (incoming) {

            if (incoming.id !== undefined) {
                methods.edit(incoming);
                return;
            }

            const updated = ui.options.updateIn(config.OPT_PATH.concat('items'), function (items) {

                const match = items.filter(function (item) {
                    return item.get('route') === incoming.route;
                });

                if (match.size) {
                    return items;
                }

                if (!incoming.route.match(/^\//)) {
                    incoming.route = '/' + incoming.route;
                }

                return items.push(Immutable.fromJS(incoming).set('id', uid++));
            });
            resendItems(updated);
        },
        delete: function (incomingItem) {
            const updated = ui.options.updateIn(config.OPT_PATH.concat('items'), function (items) {
                return items.filter(function (item) {
                    return item.get('id') !== incomingItem.id;
                })
            });
            resendItems(updated);
        },
        pause: function () {
            console.log('PAUSE');
        },
        edit: function (incoming) {
            const updated = ui.options.updateIn(config.OPT_PATH.concat('items'), function (items) {
                return items.map(function (item) {
                    if (item.get('id') === incoming.id) {
                        return item.merge({route: incoming.route, latency: incoming.latency});
                    }
                    return item;
                });
            });
            resendItems(updated);
        },
        toggle: function (value) {
            //if (value !== true) {
            //    value = false;
            //}
            //if (value) {
            //    ui.setOptionIn(optPath.concat("active"), true);
            //    bs.addMiddleware("*", function (req, res, next) {
            //        setTimeout(next, timeout);
            //    }, {id: "cp-latency", override: true});
            //} else {
            //    ui.setOptionIn(optPath.concat("active"), false);
            //    bs.removeMiddleware("cp-latency");
            //}
        },
        adjust: function (data) {
            //timeout   = parseFloat(data.rate) * 1000;
            //var saved = ui.options.getIn(optPath.concat("rate"));
            //if (saved !== data.rate) {
            //    ui.setOptionIn(optPath.concat("rate"), timeout/1000);
            //}
        },
        event: function (event) {
            methods[event.event](event.data);
        }
    };

    methods.add({
        route: '/json',
        latency: 3000,
        active: true
    })

    console.log(ui.options.getIn(config.OPT_PATH.concat('items')).toJS());

    ui.listen(config.NS, methods);

    return methods;
};

/**
 * Plugin name.
 * @type {string}
 */
module.exports["plugin:name"] = config.PLUGIN_NAME;
