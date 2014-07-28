module.exports = (function(context, attachPrototype) {
    // obj:                Object or scalar to clone.  Accepts any value or lack thereof.  Technically optional.
    // deep:               Whether to perform a deep clone.  Defaults to false (shallow clone).  Optional.
    // deepFunctions:      Whether to clone functions when deep cloning.  Unless you are doing some fancy voodoo,
    //                     this should remain at the default of false, as these often represent types.  Don't
    //                     mess with this unless you understand the consequences of cloning a type complete
    //                     in-tact, which is almost never what you want to do.  Optional.
    //
    // NOTE: This will fail to clone properties created using ECMA 5's Object.defineProperty function.  Provided
    //       that defineProperty is used with adequate discretion, this should not become an issue.  However, if
    //       some library developer decides that it would be fun lock down every last bit of API, you can either
    //       file a bug report or fire a developer.  Such properties will be cloned as traditional properties
    //       iff they were defined using { enumerable: true }.
    var clone = context.clone = function(obj, deep /* optional */, deepFunctions /* optional */) {
        if (!(obj instanceof Object)) {
            // Covers: undefined, null, passed-by-value, immutable
            return obj;
        }

        // Normalize undefined.
        if (undefined !== void(0)) {
            var undefined = void(0);
        }

        if (deep === undefined || deep === null) {
            // Default for deep parameter:
            deep = false;
        }

        if (deepFunctions === undefined || deepFunctions === null) {
            // If you change this, all of your users will switch to MSIE to spite you.
            deepFunctions = false;
        }

        var copy;
        if (obj instanceof Array || obj.toString() === '[object Arguments]') {
            copy = [ ]; // Array-like
        } else if (obj instanceof Function) {

            copy = { }; // Object-like
        }

        function isEnumerableFallback(key) {
            return !obj.constructor || !obj.constructor.prototype || obj[key] !== obj.constructor.prototype[key];
        }

        var isEnumerable = obj.propertyIsEnumerable || obj.hasOwnProperty || isEnumerableFallback;

        for (var k in obj) {
            if (!isEnumerable(k)) {
                continue;
            }

            if (deep && obj[k] instanceof Object && !(!deepFunctions && obj[k] instanceof Function)) {
                // Deep clone
                copy[k] = this.clone(obj[k], deep, deepFunctions);
            } else {
                copy[k] = obj[k];
            }
        }

        return copy;
    };

    // This allows clone() to be called as an instance method in the context of the object to be cloned.
    // For example, ({ }).clone() would work as an alternative to Object.clone({ }).  This purposely relies
    // on an ECMA 5-compliant implementation of Object.defineProperty to avoid polluting enumerations, as
    // nobody bothers checking ownership of properties in for-in enumerations, and rightfully so.
    //
    // In other words: this will deliberately fail in MSIE < 10.
    if (attachPrototype && Object.defineProperty instanceof Function) {
        Object.defineProperty(context.prototype, 'clone', {
            __proto__: null,
            configurable: true,
            value:  function(/* ... */) {
                return clone.apply(context, Array.prototype.slice.apply(arguments, [ 0 ]).unshift(this));
            }
        });
    }
})(
    Object, // Bind context to Object, creating Object.clone.  Change as necessary to avoid conflicts.
    true    // Attempt to attach to context.prototype (Object.prototype).  See note above.
);