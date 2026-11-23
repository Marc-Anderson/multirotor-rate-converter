# API tests

Run simple api conversion check against the backend implementation, check for missing/invalid inputs, and unsupported HTTP
methods. 

With a Python 3.12 virtual environment activated, run from the repository root:

```sh
cd backend
python -m pip install -r requirements.txt
python -m pip check
python -m unittest discover -s ../tests -p 'test_backend.py' -v
```
