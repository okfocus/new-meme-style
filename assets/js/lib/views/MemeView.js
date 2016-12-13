var MemeView = View.extend({

  el: "body",
  
  events: {
    "keydown #text": "clear",
    "click #save": "save",
  },

  initialize: function(){
    this.loader = new Loader ()
    this.$text = this.$("#text")
    this.$image = this.$("#image")
    this.uploader = new UploadView ({ el: "#image" })
    this.initialText = this.$text.html()
    this.lastImage = new Image
    this.lastImage.src = "assets/img/placeholder.png"
    this.$text.focus()
  },
  
  lastImage: null,
  
  load: function(url){
    this.lastImage = new Image
    this.lastImage.src = url
    this.$image.css("background-image", "url(" + url + ")")
  },
  
  show: function(){
  },
  
  clear: function(){
    var html = this.$text.html().replace( new RegExp(this.initialText), "")
    this.$text.html(html)
  },
  
  save: function(){
    var canvas = document.createElement("canvas")
    var ctx = canvas.getContext('2d')
    
    var vmin = Math.min( window.innerWidth, window.innerHeight ) / 100
    var fontSize = 5 * vmin
    
    canvas.width = 100 * vmin
    canvas.height = 100 * vmin

    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = fontSize + "px 'Helvetica'"
    ctx.fillStyle = "black"
    var y = wrapText(ctx, this.$text.text(), 50, 50 + fontSize, 100*vmin - 100, fontSize * 1.2)
    
    var offset = this.$image.offset()
    var w = this.$image.width(), h = this.$image.height()
    
    var img = this.lastImage
    
    var src = w / h
    var dest = img.naturalWidth / img.naturalHeight
    if (dest > src) {
      w = w
      h = Math.round( w / dest )
    }
    else {
      w = Math.round( h * dest )
      h = h
    }

    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, offset.left, y+20, w, h)

    // document.body.insertBefore(canvas, document.body.firstChild)
    var uri = canvas.toDataURL("image/png")
    var blob = dataUriToBlob(uri)
    saveAs(blob, "meme.png")
  },

})

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ')
  var line = ''

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' '
    var metrics = ctx.measureText(testLine)
    var testWidth = metrics.width
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y)
      line = words[n] + ' '
      y += lineHeight
    }
    else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
  return y
}