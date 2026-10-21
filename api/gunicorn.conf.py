# Gunicorn loads this file automatically when started from the api/ folder.
# Flags passed on the command line (e.g. --timeout, --threads) override these values.

# Match the frontend's 180s axios timeout so slow analyses aren't killed early
timeout = 180

# Threads let one slow upload run without blocking other users on the same worker
threads = 4
