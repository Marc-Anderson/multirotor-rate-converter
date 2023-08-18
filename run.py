from app import app


if __name__ == "__main__":

    @app.route('/')
    def public():
        return app.send_static_file('index.html')

    app.run(host='localhost', port=3000, debug=True)


# may need to run these???
# export FLASK_APP=app
# export FLASK_ENV=development
# export FLASK_RUN_HOST=localhost
# export FLASK_RUN_PORT=3000