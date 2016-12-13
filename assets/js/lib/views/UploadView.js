var UploadView = View.extend({

  events: {
    "change input": "handleFileSelect",
  },
  
  initialize: function(){
    this.$input = this.$('input')
  },
  
  loaded: false,
  ready: function(){
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext('2d')
    this.$overlayer.append(this.canvas)
    this.draw()
  },

  handleFileSelect: function(e) {
    e.stopPropagation()
    e.preventDefault()
    
    var files = e.dataTransfer ? e.dataTransfer.files : e.target.files

    var file = files[0]

    if (! file) return
    if (! file.type.match('image.*')) return
    
    this.file = file
    if (file.type.match(/jpg|jpeg/)) {
      this.fixOrientationAndLoad(file)
    }
    else {
      var url = URL.createObjectURL(file)
      this.load(url)
    }
  },

  fixOrientationAndLoad: function(f){
    var reader = new FileReader()
    var img = new Image ()
    
    reader.addEventListener("load", function () {
      img.src = reader.result
    }, false)

    img.onload = function(){
      var max_side = Math.max(img.naturalWidth, img.naturalHeight)
      var scale = Math.min(1280 / max_side, 1)
      var canvas = renderToCanvas(img, {
        correctOrientation: true,
        scale: scale
      })
      
      var dataURI = canvas.toDataURL("image/jpeg", 0.8)
      this.load(dataURI)
    }.bind(this)

    reader.readAsDataURL(f)
  },
  
  load: function( url ){
    app.views.meme.load( url )
  },
  
})