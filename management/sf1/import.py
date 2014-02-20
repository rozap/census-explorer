import elasticsearch
from elasticsearch.helpers import bulk
from elasticsearch.exceptions import NotFoundError
import json
from datetime import datetime

index_name = "sf1.variables"


def main():
    # Connect to localhost:9200 by default:
    es = elasticsearch.Elasticsearch()
    index = elasticsearch.client.IndicesClient(es)

    try:
        index.delete(index_name)
        print "Existing index removed"
    except NotFoundError:
        pass

    index.create(index_name, {
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

    with open('variables.json') as f:
        data = json.loads(f.read())
        
        items = data['variables']

        actions = []
        for varname, info in items.iteritems():
            if info.has_key('label') and info.has_key('concept'):
                actions.append({
                    '_index': index_name,
                    '_type': 'var',
                    '_id': len(actions),
                    '_source': {
                        "variable" : varname,
                        "label" : info['label'],
                        "concept" : info['concept'],
                        "dataset" : "sf1",
                        "date": datetime.now(),
                    }
                })
        bulk(es, actions)




if __name__ == '__main__':
    main()