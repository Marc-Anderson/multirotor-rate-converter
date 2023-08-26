from app import init_app

app = init_app()

if __name__ == "__main__":

    import os
    # configure environment variables for running locally if they werent already set(by docker for example)
    os.environ["FLASK_APP"] = os.environ.get("FLASK_APP", "app")
    os.environ["FLASK_ENV"] = os.environ.get("FLASK_ENV", "development")
    os.environ["FLASK_RUN_HOST"] = os.environ.get("FLASK_RUN_HOST", "localhost")
    os.environ["FLASK_RUN_PORT"] = os.environ.get("FLASK_RUN_PORT", "3000")

    # host the static files with flask while developing
    @app.route('/')
    def public():
        return app.send_static_file('index.html')

    # print(os.environ["FLASK_APP"],os.environ["FLASK_ENV"],os.environ["FLASK_RUN_HOST"],os.environ["FLASK_RUN_PORT"])
    app.run(host=os.environ["FLASK_RUN_HOST"], port=int(os.environ["FLASK_RUN_PORT"]), debug=True)