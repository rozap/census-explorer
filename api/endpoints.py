from api import json_view
from flask import g, abort, request



@json_view
def search():
    term = request.args.get('q')

    result = g.es.search(index = 'sf1.variables',
        body = {'query' : {'text' : {'label' : term}}})

    if result.has_key('hits'):
        result = [i['_source'] for i in result['hits']['hits']]


    return 'search', result