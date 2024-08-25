from flask import Flask

# create flask factory
def init_app():

    app = Flask(__name__, static_url_path='', static_folder='static')

    # initialize routes, injecting the app as a dependency
    from app import routes
    routes.init(app)

    return app