// window.addEventListener('message', function(e) {
//   console.log(e.data)
//   if (e.data == "click") {
//     document.body.click()
//   }
//   if (e.data == "ready") {
//     app.ready()
//   }
// })

var TWO_PI = Math.PI * 2
var DEG_TO_RAD = Math.PI/180
var RAD_TO_DEG = 180/Math.PI

function gray(n) {
  var s = Math.round(n * 255).toString(16) + ""
  if (s.length == 1) s = "0" + s
  return "#" + s + s + s
}

function sanitize (s){ return (s || "").replace(new RegExp("[<>&]", 'g'), "") }
function rand(n){ return (Math.random()*n) }
function randint(n){ return rand(n)|0 }
function randrange(a,b){ return a + rand(b-a) }
function randsign(){ return Math.random() > 0.5 ? 1 : -1 }
function choice(a){ return a[randint(a.length)] }
function clamp(n,a,b){ return n<a?a:n<b?n:b }
function lerp(n,a,b){ return (b-a)*n+a }
function avg(m,n,a){ return (m*(a-1)+n)/a }
function mod(n,m){ return n-(m * Math.floor(n/m)) }
function quantize(a,b){ return Math.round(a/b)*b }
function dist(x0,y0,x1,y1){
  var dx = x1-x0
  var dy = y1-y0
  return Math.sqrt(dx*dx + dy*dy)
}
function angle(x0,y0,x1,y1){ return Math.atan2(y1-y0,x1-x0) }
function pluck(h,a){
  var hh = {}
  if (typeof a == "string") a = a.split(" ");
  a.forEach(function(s){ hh[s] = h[s] })
  return hh
}
function shuffle(a){
  for (var i = a.length; i > 0; i--){
    var r = randint(i)
    var swap = a[i-1]
    a[i-1] = a[r]
    a[r] = swap
  }
  return a
}
function defaults (dest, src) {
	dest = dest || {}
	for (var i in src) {
		dest[i] = typeof dest[i] == 'undefined' ? src[i] : dest[i]
	}
	return dest
}

function getFirstTouch(fn){
  return function(e){
    e.preventDefault()
    var touch = e.touches[0]
    fn(touch)
  }
}

function offsetFromPoint(event, element) {
  function a(width) {
    var l = 0, r = 200;
    while (r - l > 0.0001) {
      var mid = (r + l) / 2;
      var a = document.createElement('div');
      a.style.cssText = 'position: absolute;left:0;top:0;background: red;z-index: 1000;';
      a.style[width ? 'width' : 'height'] = mid.toFixed(3) + '%';
      a.style[width ? 'height' : 'width'] = '100%';
      element.appendChild(a);
      var x = document.elementFromPoint(event.clientX, event.clientY);
      element.removeChild(a);
      if (x === a) {
        r = mid;
      } else {
        if (r === 200) {
          return null;
        }
        l = mid;
      }
    }
    return mid;
  }
  var l = a(1), 
      t = a(0);
  return l && t ? {
    left: l / 100,
    top: t / 100,
    toString: function () {
      return 'left: ' + l + '%, top: ' + t + '%';
    }
  } : null;
}

// Check if supports 3D transforms
function has3d(){
	var el = $('<p>')[0], $iframe = $('<iframe>'), has3d, t,
		transforms = {
			'webkitTransform': '-webkit-transform',
			'OTransform': '-o-transform',
			'msTransform': '-ms-transform',
			'transform': 'transform'
		};
 
	// Add it to the body to get the computed style
	// Sandbox it inside an iframe to avoid Android Browser quirks
	$iframe.appendTo('body').contents().find('body').append( el );
 
	for (t in transforms) {
		if (el.style[t] !== undefined) {
			el.style[t] = 'translate3d(1px,1px,1px)';
			has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
		}
	}
 
	$iframe.remove();
 
	return has3d !== undefined && has3d.length > 0 && has3d !== "none";
}

// Identify browser based on useragent string
;(function( ua ) {
  ua = ua.toLowerCase();
  var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
    /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
    /(msie) ([\w.]+)/.exec( ua ) ||
    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
    [];
  var matched = {
    browser: match[ 1 ] || "",
    version: match[ 2 ] || "0"
  };
  browser = {};
  if ( matched.browser ) {
      browser[ matched.browser ] = true;
      browser.version = matched.version;
  }
  // Chrome is Webkit, but Webkit is also Safari.
  if ( browser.chrome ) {
    browser.webkit = true;
  } else if ( browser.webkit ) {
    browser.safari = true;
  }
  if (window.$) $.browser = browser;
  return browser;
})( navigator.userAgent );

// Naive useragent detection pattern
var is_iphone = (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))
var is_ipad = (navigator.userAgent.match(/iPad/i))
var is_android = (navigator.userAgent.match(/Android/i))
var is_mobile = is_iphone || is_ipad || is_android
var is_desktop = ! is_mobile;
var transformProp = browser.safari ? "WebkitTransform" : "transform";

if (is_mobile) {
	$("html").addClass("mobile")
}
else {
  $("html").addClass("desktop")
}

// rAF shim
;(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
