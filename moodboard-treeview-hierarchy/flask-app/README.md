# Flask example

Using Flask to build a Restful API Server with Swagger document.

Integration with Flask-restplus, Flask-Cors<!--, Flask-Testing, Flask-SQLalchemy,and Flask-OAuth extensions.-->

### Extension:
<TODO>
<!-- - Restful: [Flask-restplus](http://flask-restplus.readthedocs.io/en/stable/) -->

<!-- - SQL ORM: [Flask-SQLalchemy](http://flask-sqlalchemy.pocoo.org/2.1/) -->

<!-- - Testing: [Flask-Testing](http://flask.pocoo.org/docs/0.12/testing/) -->

<!-- - OAuth: [Flask-OAuth](https://pythonhosted.org/Flask-OAuth/) -->

<!-- - ESDAO: [elasticsearch](https://elasticsearch-py.readthedocs.io/en/master/) , [elasticsearch-dsl](http://elasticsearch-dsl.readthedocs.io/en/latest/index.html) -->


## Installation

Install with pip:

```
$ pip install -r requirements.txt
```

## Flask Application Structure 
```
.
|──────flask-app/
| |────app.py
| |────Database.json

```


## Flask Configuration

#### Example

```
app = Flask(__name__)
app.config['DEBUG'] = True
```
### Conflicting port 5000
On few newer MacOS devices, Airplay receiver runs on post 5000. You can either change that or try running the flask application on some other port like following:
```py
if __name__ == '__main__':
    app.run(debug=True, port=5001)
```

### Running the app
Simply run the `app.py` file as (use `nohup` to keep terminal free):
```
$ python3 app.py
```