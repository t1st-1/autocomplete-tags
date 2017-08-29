(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
      }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {
    var ComponentManager = function () {
      function ComponentManager(permissions, onReady) {
        _classCallCheck(this, ComponentManager);

        this.sentMessages = [];
        this.messageQueue = [];
        this.permissions = permissions;
        this.loggingEnabled = false;
        this.onReadyCallback = onReady;

        window.addEventListener("message", function (event) {
          if (this.loggingEnabled) {
            console.log("Components API Message received:", event.data);
          }
          this.handleMessage(event.data);
        }.bind(this), false);
      }

      _createClass(ComponentManager, [{
        key: "handleMessage",
        value: function handleMessage(payload) {
          if (payload.action === "component-registered") {
            this.sessionKey = payload.sessionKey;
            this.componentData = payload.componentData;
            this.onReady();

            if (this.loggingEnabled) {
              console.log("Component successfully registered with payload:", payload);
            }
          } else if (payload.action === "themes") {
            this.activateThemes(payload.data.themes);
          } else if (payload.original) {
            // get callback from queue
            var originalMessage = this.sentMessages.filter(function (message) {
              return message.messageId === payload.original.messageId;
            })[0];

            if (originalMessage.callback) {
              originalMessage.callback(payload.data);
            }
          }
        }
      }, {
        key: "onReady",
        value: function onReady() {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.messageQueue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var message = _step.value;

              this.postMessage(message.action, message.data, message.callback);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          this.messageQueue = [];

          if (this.onReadyCallback) {
            this.onReadyCallback();
          }
        }
      }, {
        key: "setComponentDataValueForKey",
        value: function setComponentDataValueForKey(key, value) {
          this.componentData[key] = value;
          this.postMessage("set-component-data", { componentData: this.componentData }, function (data) {});
        }
      }, {
        key: "clearComponentData",
        value: function clearComponentData() {
          this.componentData = {};
          this.postMessage("set-component-data", { componentData: this.componentData }, function (data) {});
        }
      }, {
        key: "componentDataValueForKey",
        value: function componentDataValueForKey(key) {
          return this.componentData[key];
        }
      }, {
        key: "postMessage",
        value: function postMessage(action, data, callback) {
          if (!this.sessionKey) {
            this.messageQueue.push({
              action: action,
              data: data,
              callback: callback
            });
            return;
          }

          var message = {
            action: action,
            data: data,
            messageId: this.generateUUID(),
            sessionKey: this.sessionKey,
            permissions: this.permissions,
            api: "component"
          };

          var sentMessage = JSON.parse(JSON.stringify(message));
          sentMessage.callback = callback;
          this.sentMessages.push(sentMessage);

          if (this.loggingEnabled) {
            console.log("Posting message:", message);
          }

          window.parent.postMessage(message, '*');
        }
      }, {
        key: "setSize",
        value: function setSize(type, width, height) {
          this.postMessage("set-size", { type: type, width: width, height: height }, function (data) {});
        }
      }, {
        key: "streamItems",
        value: function streamItems(callback) {
          this.postMessage("stream-items", { content_types: ["Tag"] }, function (data) {
            var tags = data.items;
            callback(tags);
          }.bind(this));
        }
      }, {
        key: "streamContextItem",
        value: function streamContextItem(callback) {
          this.postMessage("stream-context-item", null, function (data) {
            var item = data.item;
            callback(item);
          }.bind(this));
        }
      }, {
        key: "selectItem",
        value: function selectItem(item) {
          this.postMessage("select-item", { item: this.jsonObjectForItem(item) });
        }
      }, {
        key: "createItem",
        value: function createItem(item) {
          this.postMessage("create-item", { item: this.jsonObjectForItem(item) }, function (data) {
            var item = data.item;
            this.associateItem(item);
          }.bind(this));
        }
      }, {
        key: "associateItem",
        value: function associateItem(item) {
          this.postMessage("associate-item", { item: this.jsonObjectForItem(item) });
        }
      }, {
        key: "deassociateItem",
        value: function deassociateItem(item) {
          this.postMessage("deassociate-item", { item: this.jsonObjectForItem(item) });
        }
      }, {
        key: "clearSelection",
        value: function clearSelection() {
          this.postMessage("clear-selection", { content_type: "Tag" });
        }
      }, {
        key: "deleteItem",
        value: function deleteItem(item) {
          this.deleteItems([item]);
        }
      }, {
        key: "deleteItems",
        value: function deleteItems(items) {
          var params = {
            items: items.map(function (item) {
              return this.jsonObjectForItem(item);
            }.bind(this))
          };
          this.postMessage("delete-items", params);
        }
      }, {
        key: "saveItem",
        value: function saveItem(item) {
          this.saveItems([item]);
        }
      }, {
        key: "saveItems",
        value: function saveItems(items) {
          items = items.map(function (item) {
            return this.jsonObjectForItem(item);
          }.bind(this));

          this.postMessage("save-items", { items: items }, function (data) {});
        }
      }, {
        key: "jsonObjectForItem",
        value: function jsonObjectForItem(item) {
          var copy = Object.assign({}, item);
          copy.children = null;
          copy.parent = null;
          return copy;
        }

        /* Themes */

      }, {
        key: "activateThemes",
        value: function activateThemes(urls) {
          this.deactivateAllCustomThemes();

          if (this.loggingEnabled) {
            console.log("Activating themes:", urls);
          }

          if (!urls) {
            return;
          }

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = urls[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var url = _step2.value;

              if (!url) {
                continue;
              }

              var link = document.createElement("link");
              link.href = url;
              link.type = "text/css";
              link.rel = "stylesheet";
              link.media = "screen,print";
              link.className = "custom-theme";
              document.getElementsByTagName("head")[0].appendChild(link);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }, {
        key: "deactivateAllCustomThemes",
        value: function deactivateAllCustomThemes() {
          var elements = document.getElementsByClassName("custom-theme");

          [].forEach.call(elements, function (element) {
            if (element) {
              element.disabled = true;
              element.parentNode.removeChild(element);
            }
          });
        }

        /* Utilities */

      }, {
        key: "generateUUID",
        value: function generateUUID() {
          var crypto = window.crypto || window.msCrypto;
          if (crypto) {
            var buf = new Uint32Array(4);
            crypto.getRandomValues(buf);
            var idx = -1;
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              idx++;
              var r = buf[idx >> 3] >> idx % 8 * 4 & 15;
              var v = c == 'x' ? r : r & 0x3 | 0x8;
              return v.toString(16);
            });
          } else {
            var d = new Date().getTime();
            if (window.performance && typeof window.performance.now === "function") {
              d += performance.now(); //use high-precision timer if available
            }
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = (d + Math.random() * 16) % 16 | 0;
              d = Math.floor(d / 16);
              return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
            });
            return uuid;
          }
        }
      }]);

      return ComponentManager;
    }();

    window.ComponentManager = ComponentManager;
  }, {}] }, {}, [1]);
;'use strict';

angular.module('app', []);
var HomeCtrl = function HomeCtrl($rootScope, $scope, $timeout) {
  _classCallCheck(this, HomeCtrl);

  $scope.tags = [];

  var delimitter = ".";

  var permissions = [{
    name: "stream-items",
    content_types: ["Tag"]
  }, {
    name: "stream-context-item"
  }];

  var componentManager = new window.ComponentManager(permissions, function () {
    // on ready
  });

  $scope.formData = {};
  var defaultHeight = 50;

  $scope.tagsInputChange = function ($event) {
    var input = $scope.formData.input;

    var lastTag = input.split("#").slice(-1)[0];
    if (lastTag) {
      $scope.results = $scope.tags.filter(function (tag) {
        var comps = tag.content.title.split(delimitter);
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = comps[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var comp = _step3.value;

            if (comp.length && comp.startsWith(lastTag)) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return tag.content.title.startsWith(lastTag);
      }).sort(function (a, b) {
        return a.content.title > b.content.title;
      });
    } else {
      $scope.results = [];
    }

    $scope.showAutocomplete($scope.results.length > 0);
    $scope.highlightTag($scope.results[0]);
  };

  $scope.showAutocomplete = function (show) {
    $scope.formData.showAutocomplete = show;

    $timeout(function () {
      componentManager.setSize("content", "100%", document.documentElement.scrollHeight);
    });
  };

  $scope.selectTag = function (tag) {
    var comps = tag.content.title.split(delimitter);
    for (var index = 1; index < comps.length + 1; index++) {
      var tagName = comps.slice(0, index).join(delimitter);
      var _tag = $scope.tags.filter(function (candidate) {
        return candidate.content.title === tagName;
      })[0];

      componentManager.associateItem(_tag);
    }

    $scope.showAutocomplete(false);
    $scope.formData.input = "";
    $scope.highlightedTag = null;
  };

  $scope.removeActiveTag = function (tag) {
    componentManager.deassociateItem(tag);
  };

  componentManager.streamItems(function (newTags) {
    $timeout(function () {
      var allTags = $scope.tags || [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = newTags[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var tag = _step4.value;

          var existing = allTags.filter(function (tagCandidate) {
            return tagCandidate.uuid === tag.uuid;
          })[0];
          if (existing) {
            Object.assign(existing, tag);
          } else {
            allTags.push(tag);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      $scope.tags = allTags;
    });
  }.bind(this));

  componentManager.streamContextItem(function (item) {
    $timeout(function () {
      var tags = $scope.tags.filter(function (tag) {
        var matchingReference = item.content.references.filter(function (ref) {
          return ref.uuid === tag.uuid;
        })[0];
        return matchingReference;
      });

      $scope.activeTags = tags.sort(function (a, b) {
        return a.content.title > b.content.title;
      });
    });
  });

  $scope.highlightTag = function (tag) {
    $scope.highlightedTag = tag;
  };

  $scope.highlightNextResult = function () {
    if (!$scope.results) {
      return;
    }
    var index = $scope.results.indexOf($scope.highlightedTag);
    $scope.highlighResultAtIndex(index + 1);
  };

  $scope.highlightPreviousResult = function () {
    if (!$scope.results) {
      return;
    }
    var index = $scope.results.indexOf($scope.highlightedTag);
    index--;
    if (index < 0) {
      index = $scope.results.length - 1;
    }
    $scope.highlighResultAtIndex(index);
  };

  $scope.highlighResultAtIndex = function (index) {
    $scope.highlightTag($scope.results[index % $scope.results.length]);
  };

  $scope.onEnter = function () {
    if ($scope.highlightedTag) {
      $scope.selectTag($scope.highlightedTag);
    } else if ($scope.formData.input) {
      componentManager.createItem({ content_type: "Tag", content: { title: $scope.formData.input } });
      $scope.formData.input = "";
    }
  };

  componentManager.setSize("container", "100%", defaultHeight);

  document.onkeydown = handleArrowKey;

  function handleArrowKey(e) {
    e = e || window.event;
    if (e.keyCode == '38') {
      // up arrow
      $timeout(function () {
        $scope.highlightPreviousResult();
      });
    } else if (e.keyCode == '40') {
      // down arrow
      $timeout(function () {
        $scope.highlightNextResult();
      });
    }
  }
};

// required for firefox


HomeCtrl.$$ngIsClass = true;

angular.module('app').controller('HomeCtrl', HomeCtrl);


},{}]},{},[1]);
