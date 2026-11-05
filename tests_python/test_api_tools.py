"""Run: python3 -m unittest discover -s tests_python -v (stdlib only)."""
import json
import pathlib
import sys
import unittest
from unittest import mock
from urllib.error import HTTPError

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "python"))
import neurox_client
import benchmark_api


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self, limit):
        return json.dumps(self.payload).encode()


class ClientTests(unittest.TestCase):
    def test_health_get(self):
        def responder(req, timeout):
            self.assertEqual(req.get_method(), "GET")
            self.assertTrue(req.full_url.endswith("/health"))
            return FakeResponse({"status": "ok", "model": "NEUROX V6"})
        with mock.patch.object(neurox_client.urllib.request, "urlopen", side_effect=responder):
            self.assertEqual(neurox_client.health("http://127.0.0.1:8000")["status"], "ok")

    def test_chat_history_and_limits(self):
        def responder(req, timeout):
            self.assertEqual(req.get_method(), "POST")
            body = json.loads(req.data)
            self.assertEqual(body["history"][0]["role"], "user")
            self.assertEqual(body["max_tokens"], 16)
            return FakeResponse({"reply": "Solana is a blockchain."})
        with mock.patch.object(neurox_client.urllib.request, "urlopen", side_effect=responder):
            result = neurox_client.chat("http://127.0.0.1:8000/", "Solana?", 16,
                                        [{"role": "user", "content": "Hi"}])
            self.assertIn("Solana", result["reply"])
        with self.assertRaises(ValueError):
            neurox_client.chat("http://localhost:8000", "hi", max_tokens=129)

    def test_reject_credentials_in_url(self):
        with self.assertRaises(ValueError):
            neurox_client.request_json("https://user:pass@example.com/", "health")

    def test_http_failure_does_not_expose_body(self):
        err = HTTPError("https://example.com/chat", 429, "Too Many Requests", {}, None)
        with mock.patch.object(neurox_client.urllib.request, "urlopen", side_effect=err):
            with self.assertRaisesRegex(neurox_client.APIError, "HTTP 429"):
                neurox_client.chat("https://example.com", "Hello")

    def test_percentile(self):
        self.assertEqual(benchmark_api.percentile([1.0, 3.0, 2.0], 0.5), 2.0)
        self.assertAlmostEqual(benchmark_api.percentile([1.0, 3.0], .95), 2.9)

    def test_benchmark_mock(self):
        with mock.patch.object(benchmark_api, "health", return_value={"status":"ok"}), \
             mock.patch.object(benchmark_api, "chat", return_value={"reply":"ok"}):
            result=benchmark_api.benchmark("http://localhost:8000", "hello", samples=2)
            self.assertEqual(result["samples"], 2)
            self.assertIn("p95_interpolated",result["latency_seconds"])


if __name__=="__main__":
    unittest.main()
