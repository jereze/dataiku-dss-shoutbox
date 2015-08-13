minify:
	html-minifier shoutbox.full.html --minify-css --collapse-whitespace > shoutbox.min.html
	uglifyjs shoutbox.full.js -c -m> shoutbox.min.js