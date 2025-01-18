#!/bin/sh
ollama serve &
sleep 10
ollama pull phi
wait
