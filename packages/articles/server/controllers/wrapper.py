# -*- coding:utf-8 -*-
import urllib2
import urllib
import re
import sys
import json
import goslate

opener = urllib2.build_opener()
opener.addheaders = [('User-agent', 'Mozilla/4.0')]
opener.addheaders = [('Content-Type', 'application/oct-stream')]
gs = goslate.Goslate()

url = "http://search.danawa.com/dsearch.php?tab=goodsmain&limit=50&"


def get_page(key):
    try:
        destUrl = url + urllib.urlencode({'query': key})
        data = opener.open(destUrl).read()
    except:
        return "fail"

    return data

keyword = sys.argv[1]
currency = sys.argv[2]
result = get_page(keyword).decode('euc-kr')
productList = result.split("<th")[1:]
outList = []
popularity = 50
descriptions = []
for productString in productList:
    productName = productString.split('</a')[2].split('\t\t\t')[4] \
        .replace('<b>', '').replace('</b>', '')
    productDescription = re.search('<a[^>]*>(.+?)</a>', productString) \
        .group(1)
    #productDescription = gs.translate(productDescription, 'en')
    descriptions.append(productDescription)
    productImgSrc = 'http:' + \
        re.search('<img src="(.+?)"[^>]*>', productString).group(1)
    productImgSrc = productImgSrc[:-7] + '.jpg'
    productCode = productImgSrc[-13:][:7]
    productPath = "http://prod.danawa.com/info/?pcode=" + productCode
    try:
        productPrice = re.search('<em[^>]*>(.+?)</em>', productString).group(1)
        productPrice = productPrice[:-1].replace(',', '')
    except:
        productPrice = 1
    data = {'name': productName, 'description': productDescription,
            'image': productImgSrc, 'price': productPrice,
            'popularity': popularity, 'path': productPath}
    outList.append(data)
    popularity -= 1
translateString = "|".join(descriptions)
translateString = gs.translate(translateString, 'en')
translations = translateString.split('|')
for i in range(len(outList)):
    outList[i]['descriptionEn'] = translations[i]
output = {'name': 'graph', 'children': outList, 'currency': currency[:-1]}
print json.dumps(output)
