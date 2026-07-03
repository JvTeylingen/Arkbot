"""
ARK Server Log Watcher — Companion script for ARK Bot.

Tails an ARK server log file and forwards death events to the bot via webhook.

Usage:
    ./log-watcher.py <webhook_url> [log_file]

Defaults:
    log_file: /path/to/ShooterGame/Saved/Logs/ShooterGame.log
"""

import sys
import time
import json
import requests
import os
import re

DEATH_PATTERNS = [
    re.compile(r'(?P<player>.+?) was killed by (?P<killer>.+?)\.'),
    re.compile(r'(?P<player>.+?) died\.'),
    re.compile(r'(?P<player>.+?) was eaten by (?P<killer>.+?)\.'),
]

DEFAULT_LOG_PATH = (
    os.environ.get('ARK_LOG_PATH')
    or '/ShooterGame/Saved/Logs/ShooterGame.log'
)


def tail_file(filepath):
    """Yield new lines from a file (like `tail -f`)."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        f.seek(0, 2)  # Go to end of file
        while True:
            line = f.readline()
            if line:
                yield line.rstrip('\n')
            else:
                time.sleep(0.5)


def parse_death_event(line):
    """Extract death info from a log line."""
    for pattern in DEATH_PATTERNS:
        match = pattern.search(line)
        if match:
            return {
                'player': match.group('player'),
                'killer': match.group('killer') if 'killer' in match.groupdict() else 'unknown',
                'raw': line,
            }
    return None


def send_event(webhook_url, event):
    """Send a death event to the bot via webhook."""
    try:
        resp = requests.post(
            webhook_url,
            json={'type': 'death', 'data': event},
            timeout=5,
        )
        resp.raise_for_status()
        print(f'[OK] Sent death event: {event["player"]}')
    except requests.RequestException as e:
        print(f'[ERR] Failed to send event: {e}', file=sys.stderr)


def main():
    if len(sys.argv) < 2:
        print(f'Usage: {sys.argv[0]} <webhook_url> [log_file]', file=sys.stderr)
        sys.exit(1)

    webhook_url = sys.argv[1]
    log_file = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_LOG_PATH

    if not os.path.exists(log_file):
        print(f'Log file not found: {log_file}', file=sys.stderr)
        sys.exit(1)

    print(f'Watching: {log_file}')
    print(f'Webhook: {webhook_url}')

    for line in tail_file(log_file):
        event = parse_death_event(line)
        if event:
            send_event(webhook_url, event)


if __name__ == '__main__':
    main()