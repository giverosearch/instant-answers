(function() {
    "use strict";
    var _this;
    function IA() {
        _this = this;
        window.iFrameResizer = {
            onMessage: function(event){
                if (event.action) {
                    _this._callFromQueue(event.action, event.value, event.response)
                }
            }.bind(this)
        };
        this.queue = {};
    }
    IA.prototype = {
        QUERY_PARAMETER: 'q',
        imports: {
            getVariable: function (variableName, callback) {
                var action = 'getImportsVariable';
                if (!variableName || !callback) {
                    return;
                }
                var timer = setInterval(function(){
                    if (window.parentIFrame) {
                        window.parentIFrame.sendMessage({action: action, value: variableName});
                        _this._addToQueue(action, variableName, callback);
                        clearInterval(timer);
                    }
                }, 10);
            }
        },
        getParameterByName: function(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        },
        getQuery: function () {
            return this.getParameterByName(this.QUERY_PARAMETER);
        },
        ready: function () {
            var action = 'ready';
            var timer = setInterval(function(){
                if (window.parentIFrame) {
                    window.parentIFrame.sendMessage({action: action});
                    clearInterval(timer);
                }
            }, 10);
        },
        failed: function () {
            var action = 'failed';
            var timer = setInterval(function(){
                if (window.parentIFrame) {
                    window.parentIFrame.sendMessage({action: action});
                    clearInterval(timer);
                }
            }, 10);
        },
        _addToQueue: function (action, value, callback) {
           if (!this.queue[action]) {
               this.queue[action] = {};
           }
           if (value) {
               this.queue[action][value] = callback;
           } else {
               this.queue[action].empty = callback;
           }
        },
        _callFromQueue: function (action, value, response) {
            if (this.queue[action]) {
                if (value) {
                    this.queue[action][value](response);
                    delete this.queue[action][value];
                } else if (this.queue[action].empty) {
                    this.queue[action].empty(response);
                    delete this.queue[action].empty;
                }
            }
        }
    };
    window.IA = new IA();
})();