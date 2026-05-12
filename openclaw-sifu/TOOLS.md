# TOOLS

## Google Sheets (google-sheets skill)
- Authentication: Service account JSON key
- Two spreadsheets:
  1. Food Supply Orders — for approved pre-orders
  2. Electricity Meter Log — for daily readings and consumption
- Always append new rows; never overwrite existing data
- Read previous rows when calculating electricity consumption

## Lobster (workflow orchestration)
- Used for the food order approval pipeline
- Provides deterministic multi-step execution with approval checkpoints

## Telegram
- Bot operates in a supergroup with forum topics enabled
- Topic 1: Food Supply Pre-Orders
- Topic 2: Electricity Meter Reporting
- Always respond in the same topic thread where triggered
