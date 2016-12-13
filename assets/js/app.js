var app = (function() {

  var app = {}
  var last_t = 0, initial_t = 0

  app.init = function() {
    app.loader = new Loader ()
    app.bind()
    app.build()
    app.resize()
    app.ready()
    $("body,html").scrollTop(0)
  }

  app.bind = function() {
    if (is_mobile) {
      // FastClick.attach(document.body)
    }
    $(window).resize(app.resize)
  }

  app.build = function() {
    window.scrollTo(0,0)
    app.views = {}
    app.views.meme = new MemeView ()
  }

  app.ready = function() {
    if (last_t) return
    setTimeout(function () {
      $("html").removeClass("loading")
      window.scrollTo(0,0)
    }, 50)
    app.view = app.views.meme
    app.view.show()
    // app.animate(0)
  }

//   app.animate = function (t) {
//     requestAnimationFrame(app.animate)
//     if (! initial_t) {
//       initial_t = t
//       return
//     }
//     t -= initial_t
//     var dt = t - last_t
//     last_t = t
//     // environment.update(t, dt)
//   }

  app.resize = function () {
  }

  return app

})()

document.addEventListener('DOMContentLoaded', app.init)
