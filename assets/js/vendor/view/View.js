var View = (function($, _){

  var View = function(options) {
    this._id = _.uniqueId('view')
    this.type = "view"
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions))
    this._ensureElement()
    this.initialize.apply(this, arguments)
    this.delegateEvents()
  }

  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  _.extend(View.prototype, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    $: function(selector) {
      return this.$el.find(selector);
    },

    initialize: function(){},

    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof $ ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        if (is_mobile) {
          if (eventName === 'mouseenter' || eventName === 'mouseleave') {
            continue
          }
/*
          // cordova apps have some issue with click on android
          if (is_android && eventName === 'click') {
            eventName = 'touchstart'
          }
*/
        }
        eventName += '.delegateEvents' + this._id;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this._id);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      this.setElement(_.result(this, 'el'), false);
    },
    
    preventDefault: function(e){
      e && e.preventDefault()
    },
    
    stopPropagation: function(e){
      e && e.stopPropagation()
    },

  });


  var extend = function(protoProps, staticProps) {
    var staticProps = staticProps || {}
    var parent = this;
    var child;
    var childEvents = {};

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Extend events so we can subclass views
    _.extend(childEvents, parent.prototype.events, protoProps.events)

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.prototype.__super__ = parent.prototype;
    child.prototype.events = childEvents

    return child;
  };

  View.extend = extend;
  
  return View;
})(jQuery, _)
