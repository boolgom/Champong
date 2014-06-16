# -*- coding:utf-8 -*-
import urllib2

opener = urllib2.build_opener()
opener.addheaders = [('User-agent', 'Mozilla/4.0')]
opener.addheaders = [('Content-Type', 'application/oct-stream')]

currencyUrl = "http://rate-exchange.appspot.com/currency?from=USD&to=KRW"
currency = opener.open(currencyUrl).read()
print currency[22:28]
