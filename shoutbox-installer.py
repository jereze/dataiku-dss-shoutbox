# -*- coding: utf-8 -*-

#=============================================================================
#
# Install Shoutbox in your Data Science Studio
#
# Place the script in your dataiku-dss-version directory
# and run `python shoutbox-installer.py`
#
#=============================================================================


import os
import sys
import fileinput
import urllib2
import re

# DSS Directory

#dataiku_dss="/Applications/DataScienceStudio.app/Contents/Resources/kit"
dataiku_dss = os.path.dirname(os.path.realpath(__file__))
print "OK - Trying to find DSS in " + dataiku_dss

# Checking DSS files

html_file=dataiku_dss+'/frontend/index.html'
js_file=dataiku_dss+'/frontend/static/dataiku/js/mainpack.js'

if not os.path.isfile(html_file) or not os.path.isfile(js_file):
	print "Error - Did not found DSS files"
	raise SystemExit
print "OK - DSS installation found"

# Downloading files from Github

response = urllib2.urlopen('https://raw.githubusercontent.com/jereze/dataiku-dss-shoutbox/master/shoutbox.min.html')
html_code = response.read()

response = urllib2.urlopen('https://raw.githubusercontent.com/jereze/dataiku-dss-shoutbox/master/shoutbox.min.js')
js_code = response.read()
js_code = js_code.replace('\n', ' ')

# HTML installation

filedata = None
with open(html_file, 'r') as file :
	filedata = file.read()

if filedata.find('shoutbox')>-1:
	print "OK - Existing version in HTML file, going to replace"
	filedata = re.sub(r"(\<\!\-\- shoutbox begin)(.*)(shoutbox end \-\-\>)", "", filedata)
else:
	print "OK - No existing version in HTML file, first install"
	
filedata = filedata.replace('</body>', '<!-- shoutbox begin -->'+html_code+'<!-- shoutbox end -->\n</body>')

with open(html_file, 'w') as file:
	file.write(filedata)
	print "OK - Installation done in HTML file"

# JS installation

filedata = None
with open(js_file, 'r') as file :
	filedata = file.read()

if filedata.find('shoutbox')>-1:
	print "OK - Existing version in JS file, going to replace"
	filedata = re.sub(r"(\/\* shoutbox begin)(.*)(shoutbox end \*\/)", "", filedata)
else:
	print "OK - No existing version in JS file, first install"
	
filedata = filedata.replace('// Begining Clippy.js', '/* shoutbox begin */'+js_code+'/* shoutbox end */\n\n// Begining Clippy.js')

with open(js_file, 'w') as file:
	file.write(filedata)
	print "OK - Installation done in JS file"

print "OK - Installation done!"
