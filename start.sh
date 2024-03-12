rm ./ding-dong-bot.memory-card.json
rm ./session-data/qwen/*.json

nohup python3 ./src/qwen.py &

pnpm run start