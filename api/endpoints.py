from api import json_view
from flask import g, abort, request
from census import Census, CensusException
from settings import API_KEY

@json_view
def search():
    term = request.args.get('q')

    result = g.es.search(index = 'sf1.variables',
        size = 400,
        body = {'query' : {'text' : {'label' : term}}})

    def concat(a, b):
        a.update(b)
        return a

    if result.has_key('hits'):

        result = [concat(i['_source'], {'id' : i['_id']}) for i in result['hits']['hits']]


    return 'search', result


@json_view
def sf1(dataset, doc_id):
    c = Census(API_KEY)
    year = request.args.get('year', '2010')
    try:
        result = c.sf1.get(('NAME', dataset), {'for' : 'state:*'}, year = year)
    except CensusException as e:
        return 'sf1', {
            'error' : e.message
        }, 400


    doc = g.es.get(index = 'sf1.variables', id = int(doc_id))

    return 'sf1', {
        'data' : result,
        'meta' : doc['_source']
        }