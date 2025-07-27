import os
from flask import Flask


def create_app():
    # build absolute path to frontend folder for development
    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_folder = os.path.abspath(
        os.path.join(current_dir, "..", "..", "frontend", "public")
    )

    app = Flask(
        __name__,
        static_url_path="",
        static_folder=static_folder,
    )

    from app import routes

    routes.init(app)

    @app.route("/")
    def index():
        return app.send_static_file("index.html")

    return app
