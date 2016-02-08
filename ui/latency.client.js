(function (angular) {

    var OPT_PATH    = ["shakyshane", "latency"];
    var NS          = OPT_PATH.join(":");

    /**
     * Display the snippet when in snippet mode
     */
    angular
        .module("BrowserSync")
        .directive("latency", function () {
            return {
                restrict:     "E",
                replace:      true,
                scope:        {
                    "options": "=",
                    "pluginOpts": "=",
                    "uiOptions": "="
                },
                templateUrl:  "latency/latency.directive.html",
                controller:   ["$scope", "Socket", "$timeout", latencyDirectiveControlller],
                controllerAs: "ctrl"
            };
        });

    /**
     * @param $scope
     * @param Socket
     */
    function latencyDirectiveControlller($scope, Socket, $timeout) {

        var ctrl = this;
        ctrl.state = {
            classname: "ready",
            adding: false,
            editing: false
        };
        ctrl.ui = {
            buttonText: 'Add Route'
        };
        ctrl.inputs = {
            latency: 1000,
            route: '',
            id: undefined
        };
        ctrl.latency = $scope.uiOptions[OPT_PATH[0]][OPT_PATH[1]];

        ctrl.showInputs = function ($event) {
            resetInputs();
            $event.target.blur();
            if (ctrl.state.adding) {
                ctrl.ui.buttonText = 'Add Route';
                ctrl.state.adding = false;
            } else {
                ctrl.ui.buttonText = 'Cancel';
                ctrl.state.adding = true;
            }
        }

        ctrl.pause = function (item) {
            item.success = true;

            Socket.uiEvent({
                namespace: NS,
                event: 'pause',
                data: item
            });

            $timeout(function () {
                item.success = false;
            }, 1000);
        };

        ctrl.edit = function (item) {
            ctrl.inputs.latency = item.latency;
            ctrl.inputs.route   = item.route;
            ctrl.inputs.id      = item.id;
            ctrl.ui.buttonText  = 'Cancel';
            ctrl.state.adding   = true;
        };

        ctrl.delete = function (item) {
            Socket.uiEvent({
                namespace: NS,
                event: 'delete',
                data: item
            });
        };

        ctrl.save = function () {
            ctrl.state.classname = 'waiting';
            var incoming = {
                latency: ctrl.inputs.latency,
                route: ctrl.inputs.route,
                active: true,
                id: ctrl.inputs.id
            }
            Socket.uiEvent({
                namespace: NS,
                event: 'add',
                data: incoming
            });
            $timeout(function () {
                ctrl.state.classname = 'success';
                $timeout(function () {
                    resetInputs();
                }, 500);
            }, 300);
        }

        function resetInputs () {
            ctrl.inputs.route = "";
            ctrl.inputs.latency = 1000;
            ctrl.inputs.id = undefined;
            ctrl.ui.buttonText = 'Add Route';
            ctrl.state.classname = 'ready';
            ctrl.state.adding = false;
        }

        ctrl.updateItems = function (data) {
            ctrl.latency.items = data.items;
            $scope.$digest();
        }

        //console.log(ctrl.latency);
        Socket.on(ctrl.latency.config.EVENT_UPDATE, ctrl.updateItems);

        $scope.$on("$destory", function () {
            Socket.off(ctrl.latency.config.EVENT_UPDATE, ctrl.updateItems);
        });
    }
})(angular);
