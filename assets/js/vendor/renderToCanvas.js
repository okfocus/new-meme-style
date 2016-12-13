function renderToCanvas(img, options) {
  if (!img) return
  options = options || {}

  // Canvas max size for any side
  var maxSize = 2000
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  var initialScale = options.scale || 1
  // Scale to needed to constrain canvas to max size
  // var scale = getScale(img.width * initialScale,
  //     img.height * initialScale, maxSize, maxSize)
  var scale = 1
  // Still need to apply the user defined scale
  scale *= initialScale
  var width = canvas.width = Math.round(img.width * scale)
  var height = canvas.height = Math.round(img.height * scale)
  var correctOrientation = options.correctOrientation
  var jpeg = !!img.src.match(/data:image\/jpeg|\.jpeg$|\.jpg$/i)
  var dataURI = !!img.src.match(/^data:/)

  ctx.save()

  // Can only correct orientation on JPEGs represented as dataURIs
  // for the time being
  if (correctOrientation && jpeg && dataURI) {
    applyOrientationCorrection()
  }
  // Resize image if too large
  if (scale !== 1) {
    ctx.scale(scale, scale)
  }

  ctx.drawImage(img, 0, 0)
  ctx.restore()

  return canvas

  function applyOrientationCorrection() {
    var orientation = getOrientation(img.src)
    // Only apply transform if there is some non-normal orientation
    if (orientation && orientation !== 1) {
      var transform = orientationToTransform[orientation]
      var rotation = transform.rotation
      var mirror = transform.mirror
      var flipAspect = rotation === 90 || rotation === 270
      if (flipAspect) {
        // Fancy schmancy swap algo
        canvas.width = canvas.height + canvas.width
        canvas.height = canvas.width - canvas.height
        canvas.width -= canvas.height
      }
      if (rotation > 0) {
        applyRotation(rotation)
      }
      if (mirror) {
        // TODO This is broken. Not sure how to apply this transform
        //      No biggie, we don't run into this case ATM
        // applyMirror()
      }
    }
  }

  /**
   * Some images are friggin rotated n shit! (iOS)
   * wut the heck
   * dang it
   * man
   * read the EXIF data
   * return EXIF orientation value
   */
  function getOrientation(uri) {
    var exif = new ExifReader
    // Split off the base64 data
    var base64String = uri.split(',')[1]
    // Read off first 128KB, which is all we need to
    // get the EXIF data
    var arr = base64ToUint8Array(base64String, 0, Math.pow(2, 17))
    try {
      exif.load(arr.buffer)
      return exif.getTagValue('Orientation')
    } catch (err) {
      return 1
    }
  }

  /**
   * Apply rotation such that rotated image will be
   * centered in canvas
   */
  function applyRotation(deg) {
    var radians = deg * (Math.PI / 180)
    if (deg === 90) {
      ctx.translate(canvas.width, 0)
    } else if (deg === 180) {
      ctx.translate(canvas.width, canvas.height)
    } else if (deg == 270) {
      ctx.translate(0, canvas.height)
    }
    ctx.rotate(radians)
  }

  function applyMirror() {
    ctx.scale(-1, 1)
  }
}

var orientationToTransform = {
  1: { rotation: 0, mirror: false },
  2: { rotation: 0, mirror: true },
  3: { rotation: 180, mirror: false },
  4: { rotation: 180, mirror: true },
  5: { rotation: 90, mirror: true },
  6: { rotation: 90, mirror: false },
  7: { rotation: 270, mirror: true },
  8: { rotation: 270, mirror: false }
}

function base64ToUint8Array(string, start, finish) {
  var start = start || 0
  var finish = finish || string.length
  // atob that shit
  var binary = atob(string)
  var buffer = new Uint8Array(binary.length)
  for (var i = start; i < finish; i++) {
    buffer[i] = binary.charCodeAt(i)
  }
  return buffer
}

var dataUriToUint8Array = function(uri){
  var data = uri.split(',')[1];
  var bytes = atob(data);
  var buf = new ArrayBuffer(bytes.length);
  var u8 = new Uint8Array(buf);
  for (var i = 0; i < bytes.length; i++) {
    u8[i] = bytes.charCodeAt(i);
  }
  return u8 
}

window.dataUriToBlob = (function(){
  /**
   * Blob constructor.
   */

  var Blob = window.Blob;

  /**
   * ArrayBufferView support.
   */

  var hasArrayBufferView = new Blob([new Uint8Array(100)]).size == 100;

  /**
   * Return a `Blob` for the given data `uri`.
   *
   * @param {String} uri
   * @return {Blob}
   * @api public
   */

  var dataUriToBlob = function(uri){
    var data = uri.split(',')[1];
    var bytes = atob(data);
    var buf = new ArrayBuffer(bytes.length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < bytes.length; i++) {
      arr[i] = bytes.charCodeAt(i);
    }

    if (!hasArrayBufferView) arr = buf;
    var blob = new Blob([arr], { type: mime(uri) });
    blob.slice = blob.slice || blob.webkitSlice;
    return blob;
  };

  /**
   * Return data uri mime type.
   */

  function mime(uri) {
    return uri.split(';')[0].slice(5);
  }

  return dataUriToBlob;

})()
