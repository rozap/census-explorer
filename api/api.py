from werkzeug import import_string, cached_property
import json
from flask import Response
from decimal import Decimal

class Encoder(json.JSONEncoder):
    def default(self, obj):
        print obj
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)

class LazyView(object):

    def __init__(self, import_name):
        self.__module__, self.__name__ = import_name.rsplit('.', 1)
        self.import_name = import_name

    @cached_property
    def view(self):
        return import_string(self.import_name)

    def __call__(self, *args, **kwargs):
        return self.view(*args, **kwargs)




def json_view(fn):
    def wrapped(*args, **kwargs):
        res = fn(*args, **kwargs)
        if len(res) == 2:
            root, result = res
            status = 200
        else:
            root, result, status = res

        if root:
            js = json.dumps({root : result}, cls = Encoder)
        else:
            js = json.dumps(result, cls = Encoder)
        resp = Response(js, mimetype="application/json")
        resp.status_code = status
        return resp
    return wrapped