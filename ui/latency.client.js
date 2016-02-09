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
            $event.target.blur();
            if (ctrl.state.adding) {
                resetInputs();
                closeForm();
            } else {
                openForm();
            }
        }

        ctrl.pause = function (item) {

            item.active = !item.active;

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
            ctrl.inputs.active  = item.active;
            ctrl.ui.buttonText  = 'Cancel';
            ctrl.state.adding   = true;
        };

        ctrl.delete = function (item) {
            /**
             * deleted the item in the edit fields
             */
            if (ctrl.inputs.id === item.id) {
                resetInputs();
                closeForm();
            }

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
                active: ctrl.inputs.active === undefined ? true : ctrl.inputs.active,
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
                    ctrl.state.classname = 'ready';
                    resetInputs();
                    closeForm();
                }, 500);
            }, 300);
        }

        function resetInputs () {
            ctrl.inputs.route   = "";
            ctrl.inputs.latency = 1000;
            ctrl.inputs.id      = undefined;
            ctrl.inputs.active  = undefined;
        }

        function closeForm () {
            ctrl.ui.buttonText  = 'Add Route';
            ctrl.state.adding    = false;
        }

        function openForm () {
            ctrl.ui.buttonText  = 'Cancel';
            ctrl.state.adding    = true;
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
