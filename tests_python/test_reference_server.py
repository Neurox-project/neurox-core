"""NEUROX CORE V6 offline server contract tests; no model weights required."""
import pathlib
import sys
import unittest
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from fastapi import HTTPException
from server import app as module

class ServerTests(unittest.IsolatedAsyncioTestCase):
    def test_prompt(self):
        self.assertEqual(module.prompt_text(module.ChatRequest(message="Hello")), "Hello")
        item = module.Message(role="user", content="hello")
        self.assertIn("Assistant:", module.prompt_text(module.ChatRequest(message="Hi", history=[item])))

    def test_validation(self):
        for data in ({"message":"hello","max_tokens":500}, {"message":"x"*2001}):
            with self.assertRaises(ValueError):
                module.ChatRequest(**data)
        with self.assertRaises(ValueError):
            module.Message(role="system", content="hi")

    async def test_health(self):
        with patch.object(module, "model_ready", return_value=False):
            result = await module.health()
        self.assertEqual(result["status"], "not_ready")

    async def test_chat_success(self):
        with patch.object(module, "model_ready", return_value=True), patch.object(
            module, "generate", new_callable=AsyncMock, return_value="generated"
        ) as fn:
            result = await module.chat(module.ChatRequest(message="hello", max_tokens=16))
        self.assertEqual(result["response"], "generated")
        fn.assert_awaited_once_with("hello", 16)

    async def test_missing_weights(self):
        with patch.object(module, "model_ready", return_value=False):
            with self.assertRaises(HTTPException) as err:
                await module.chat(module.ChatRequest(message="hello"))
        self.assertEqual(err.exception.status_code, 503)

    async def test_no_internal_error_leakage(self):
        with patch.object(module, "model_ready", return_value=True), patch.object(
            module, "generate", new_callable=AsyncMock, side_effect=RuntimeError("/private/path")
        ):
            with self.assertRaises(HTTPException) as err:
                await module.chat(module.ChatRequest(message="hello"))
        self.assertEqual(err.exception.status_code, 500)
        self.assertNotIn("/private", str(err.exception.detail))
