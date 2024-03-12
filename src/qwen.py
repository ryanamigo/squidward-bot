from http import HTTPStatus
from flask import Flask, request
import dashscope

dashscope.api_key = "sk-d4366c2670d44645a6784dedc6e1059c"

app = Flask(__name__)

@app.route("/qwen/<model>", methods=["POST"])
def hello(model):
  messages = request.get_json();
  response = dashscope.Generation.call(
      model=model,
      messages=messages,
      # set the random seed, optional, default to 1234 if not set
      result_format='message',  # set the result to be "message" format.
  )
  if response.status_code == HTTPStatus.OK:
    return response
  else:
    print('Request id: %s, Status code: %s, error code: %s, error message: %s' % (
      response.request_id, response.status_code,
      response.code, response.message
    ))
    return response

if __name__ == "__main__":
    app.run(port=5678)