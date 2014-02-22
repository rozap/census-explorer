import elasticsearch
from elasticsearch.helpers import bulk
from elasticsearch.exceptions import NotFoundError
import json
from datetime import datetime
from settings import IDX_NAME
import requests

es = elasticsearch.Elasticsearch()


def insert_ds(dataset_name, data):
    items = data['variables']

    actions = []
    for varname, info in items.iteritems():
        actions.append({
            '_index': IDX_NAME,
            '_type': 'var',
            '_id': len(actions),
            '_source': {
                "variable" : varname,
                "label" : info.get('label', ''),
                "concept" : info.get('concept', ''),
                "dataset" : dataset_name,
                "date": datetime.now(),
            }
        })
    bulk(es, actions)




def main():
    # Connect to localhost:9200 by default:
    index = elasticsearch.client.IndicesClient(es)

    try:
        index.delete(IDX_NAME)
        print "Existing index removed"
    except NotFoundError:
        pass

    index.create(IDX_NAME, {
       "settings" : {
          "analysis" : {
             "analyzer" : {
                "varname_search" : {
                   "tokenizer" : "varname",
                   "filter" : ["lowercase"]
                },
                "varname_index" : {
                   "tokenizer" : "varname",
                   "filter" : ["lowercase","edge_ngram"]
                }
             },
             "tokenizer" : {
                "varname" : {
                   "pattern" : "[^\\p{L}\\d]+",
                   "type" : "pattern"
                }
             },
             "filter" : {
                "edge_ngram" : {
                   "side" : "front",
                   "max_gram" : 20,
                   "min_gram" : 1,
                   "type" : "edgeNGram"
                }
             }
          }
       },
       "mappings" : {
          "var" : {
             "properties" : {
                "concept" : {
                   "type" : "string",
                   "search_analyzer" : "varname_search",
                   "index_analyzer" : "varname_index"
                },
                "label" : {
                   "type" : "string",
                   "search_analyzer" : "varname_search",
                   "index_analyzer" : "varname_index"
                }
             }
          }
       }
    })


    data_sets = ['acs5', 'sf1']
    var_link = 'http://api.census.gov/data/2010/%s/variables.json'
    for ds in data_sets:
        resp = requests.get(var_link % ds)
        data = json.loads(resp.content)
        print "inserting %s" % ds
        insert_ds(ds, data)

    



if __name__ == '__main__':
    main()