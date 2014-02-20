from flask import Flask, render_template, g
from api.api import LazyView
import elasticsearch
app = Flask(__name__)



app.add_url_rule('/api/1/search', view_func=LazyView('api.endpoints.search'))




@app.before_request
def before_request():
	g.es = elasticsearch.Elasticsearch()

@app.teardown_request
def teardown_request(exception):
    pass




@app.route("/")
def index():
    return render_template('index.html')





if __name__ == "__main__":
    app.run(debug = True)