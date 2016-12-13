var Parser = {
	integrations: [{
		type: 'image',
		regex: /\.(jpeg|jpg|gif|png|svg)(\?.*)?$/i,
    tokenize: function(url){
      return {
        text: "<img src='" + sanitize(url) + "'>"
      }
    },
		fetch: function(url, done) {
			var img = new Image ()
			img.onload = function(){
				if (!img) return
				var width = img.naturalWidth, height = img.naturalHeight
				img = null
				done({
					url: url,
					type: "image",
					token: "",
					thumbnail: "",
					title: "",
					width: width,
					height: height,
				})
			}
			img.src = url
			if (img.complete) {
				img.onload()
			}
		},
		tag: function (media) {
			return '<img src="' + media.url + '">';
		}
	}, {
		type: 'video',
		regex: /\.(mp4|webm)(\?.*)?$/i,
		fetch: function(url, done) {
			var video = document.createElement("video")
			var url_parts = url.replace(/\?.*$/, "").split("/")
			var filename = url_parts[ url_parts.length-1 ]
			video.addEventListener("loadedmetadata", function(){
				var width = video.videoWidth, height = video.videoHeight
				video = null
				done({
					url: url,
					type: "video",
					token: url,
					thumbnail: "http://okfocus.s3.amazonaws.com/misc/okcms/video.png",
					title: filename,
					width: width,
					height: height,
				})
			})
			video.src = url
			video.load()
		},
		tag: function (media) {
			return '<video src="' + media.url + '">';
		}
	}, {
		type: 'audio',
		regex: /\.(wav|mp3)(\?.*)?$/i,
		fetch: function(url, done) {
			var audio = document.createElement("audio")
			var url_parts = url.replace(/\?.*$/, "").split("/")
			var filename = url_parts[ url_parts.length-1 ]
			audio.addEventListener("loadedmetadata", function(){
				var duration = audio.duration
				audio = null
				done({
					url: url,
					type: "audio",
					token: url,
					thumbnail: "http://okfocus.s3.amazonaws.com/misc/okcms/audio.png",
					title: filename,
					duration: duration,
				})
			})
			audio.src = url
			audio.load()
		},
		tag: function (media) {
			return '<audio src="' + media.url + '">';
		}
	}, {
		type: 'youtube',
		regex:  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i,
    tokenize: function(url){
			var id = (url.match(/v=([-_a-zA-Z0-9]{11})/i) || url.match(/youtu.be\/([-_a-zA-Z0-9]{11})/i) || url.match(/embed\/([-_a-zA-Z0-9]{11})/i))[1].split('&')[0];
			var thumb = "http://i.ytimg.com/vi/" + id + "/hqdefault.jpg"
      return {
        text: "<img src='" + thumb + "'>"
      }
    },
		fetch: function(url, done) {
			var id = (url.match(/v=([-_a-zA-Z0-9]{11})/i) || url.match(/youtu.be\/([-_a-zA-Z0-9]{11})/i) || url.match(/embed\/([-_a-zA-Z0-9]{11})/i))[1].split('&')[0];
			var thumb = "http://i.ytimg.com/vi/" + id + "/hqdefault.jpg"
			$.ajax({
				type: 'GET',
				url: 'https://www.googleapis.com/youtube/v3/videos',
				dataType: "jsonp",
				data: {
					id: id,
					key: "AIzaSyCaLRGY-hxs92045X-Jew7w1FgQPkStHgc",
					part: "id,contentDetails,snippet,status",
				},
				success: function(result){
					if (! result || ! result.items.length) {
					  return alert("Sorry, this video URL is invalid.")
					}
					var res = result.items[0]
					// console.log(res)
					
					var dd = res.contentDetails.duration.match(/\d+/g).map(function(i){ return parseInt(i) })
					var duration = 0
					if (dd.length == 3) {
					  duration = ((dd[0] * 60) + dd[1] * 60) + dd[2]
					}
					else if (dd.length == 2) {
					  duration = (dd[0] * 60) + dd[1]
					}
					else {
					  duration = dd[0]
					}
					
					["maxres","high","medium","standard","default"].some(function(t){
            if (res.snippet.thumbnails[t]) {
              thumb = res.snippet.thumbnails[t].url
              return true
            }
            return false
          })
					
					done({
						url: url,
						type: "youtube",
						token: id,
						thumbnail: thumb,
						title: res.snippet.title,
						duration: duration,
						width: 640,
						height: 360,
					})
				}
			})
		},
		tag: function (media) {
			// return '<img class="video" type="youtube" vid="'+media.token+'" src="'+media.thumbnail+'"><span class="playvid">&#9654;</span>';
			return '<div class="video" style="width: ' + media.width + 'px; height: ' + media.height + 'px; overflow: hidden; position: relative;"><iframe frameborder="0" scrolling="no" seamless="seamless" webkitallowfullscreen="webkitAllowFullScreen" mozallowfullscreen="mozallowfullscreen" allowfullscreen="allowfullscreen" id="okplayer" width="' + media.width + '" height="' + media.height + '" src="http://youtube.com/embed/' + media.token + '?showinfo=0" style="position: absolute; top: 0px; left: 0px; width: ' + media.width + 'px; height: ' + media.height + 'px;"></iframe></div>'
		}
	}, {
		type: 'vimeo',
		regex: /vimeo.com\/\d+$/i,
		fetch: function(url, done) {
			var id = url.match(/\d+$/i)[0];
			$.ajax({
				type: 'GET',
				url: 'http://vimeo.com/api/v2/video/' + id + '.json',
				success: function(result){
					if (result.length == 0) { return done(id, "", 640, 360) }
					var res = result[0]
					if (res.embed_privacy != "anywhere") {
					  alert("Sorry, the author of this video has marked it private, preventing it from being embedded.", function(){})
					  return
					}
					done({
						url: url,
						type: "vimeo",
						token: id,
						thumbnail: res.thumbnail_large,
						duration: res.duration,
						title: res.title,
						width: res.width,
						height: res.height,
					})
				}
			})
		},
		tag: function (media) {
			// return '<img class="video" type="vimeo" vid="'+media.token+'" src="'+media.thumbnail+'"><span class="playvid">&#9654;</span>';
			return '<div class="video" style="width: ' + media.width + 'px; height: ' + media.height + 'px; overflow: hidden; position: relative;"><iframe frameborder="0" scrolling="no" seamless="seamless" webkitallowfullscreen="webkitAllowFullScreen" mozallowfullscreen="mozallowfullscreen" allowfullscreen="allowfullscreen" id="okplayer" src="http://player.vimeo.com/video/' + media.token + '?api=1&title=0&byline=0&portrait=0&playbar=0&player_id=okplayer&loop=0&autoplay=0" width="' + media.width + '" height="' + media.height + '" style="position: absolute; top: 0px; left: 0px; width: ' + media.width + 'px; height: ' + media.height + 'px;"></iframe></div>'
		}
	}, {
		type: 'soundcloud',
		regex: /soundcloud.com\/[-a-zA-Z0-9]+\/[-a-zA-Z0-9]+\/?$/i,
		fetch: function (url, done) {
			$.ajax({
				type: 'GET',
				url: 'http://api.soundcloud.com/resolve.json?url=' 
					+ url
					+ '&client_id=' 
					+ '0673fbe6fc794a7750f680747e863b10',
				success: function(result) {
				  console.log(result)
					done({
						url: url,
						type: "soundcloud",
						token: result.id,
						thumbnail: result.artwork_url || result.user.avatar_url,
						title: result.user.username + " - " + result.title,
						duration: result.duration,
						width: 166,
						height: 166,
					})
				}
			});
		},
		tag: function (media) {
			return '<iframe width="166" height="166" scrolling="no" frameborder="no"' +
					'src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + media.token +
					'&amp;color=ff6600&amp;auto_play=false&amp;show_artwork=true"></iframe>'
		}
	},
	{
		type: 'link',
		regex: /^http.+/i,
		fetch: function(url, done) {
			done({
				url: url,
				type: "link",
				token: "",
				thumbnail: "",
				title: "",
				width: 100,
				height: 100,
			})
		},
		tag: function (media) {
			return '<a href="' + media.url + '" target="_blank">' + media.url + '</a>'
		}
	},
	],

	parse: function (url, cb) {
		var matched = Parser.integrations.some(function(integration){
			if (integration.regex.test(url)) {
				integration.fetch(url, function(res){
					cb(res)
				})
				return true
			}
			return false
		})
		if (! matched) {
			cb(null)
		}
	},

	tokenize: function (url) {
	  var tokenized
		var matched = Parser.integrations.some(function(integration){
			if (integration.regex.test(url)) {
				tokenized = integration.tokenize ? integration.tokenize(url) : {}
        tokenized.url = url
        tokenized.text = tokenized.text || sanitize(url).replace(/\//g, "/&shy;")
        tokenized.type = integration.type
				return true
			}
			return false
		})
		if (! matched) {
			return null
		}
		else {
      return tokenized
		}
	},
	
	tag: function (media){
	  if (media.type in Parser.lookup) {
	    return Parser.lookup[media.type].tag(media)
	  }
	  return ""
	},

	loadImage: function(url, cb, error){
		if (Parser.lookup.image.regex.test(url)) {
			Parser.lookup.image.fetch(url, function(media){
				cb(media)
			})
		}
		else error && error()
	},
	
  thumbnail: function (media) {
    return '<img src="' + (media.thumbnail || media.url) + '" class="thumb">';
  },

};
// Parser.lookup = _.indexBy(Parser.integrations, 'type');
