import ctypes
import errno
import json
import os
import signal
import subprocess
import sys

# CI hosts have an init process that reaps orphaned grandchildren. This container
# has a non-reaping PID 1; supply the same reaping behavior only to our owned test tree.
libc = ctypes.CDLL(None, use_errno=True)
if libc.prctl(36, 1, 0, 0, 0) != 0:  # PR_SET_CHILD_SUBREAPER
    raise OSError(ctypes.get_errno(), 'subreaper setup failed')
os.umask(0o022)
command = sys.argv[1:]
if not command:
    raise SystemExit('Command required')
child = subprocess.Popen(command, start_new_session=True)
def forward(signum, frame):
    try:
        os.killpg(child.pid, signum)
    except ProcessLookupError:
        pass
for signum in (signal.SIGINT, signal.SIGTERM):
    signal.signal(signum, forward)
result = None
orphans = 0
while True:
    try:
        pid, status = os.waitpid(-1, 0)
    except InterruptedError:
        continue
    except ChildProcessError:
        break
    if pid == child.pid:
        result = os.waitstatus_to_exitcode(status)
        child.returncode = result
    else:
        orphans += 1
print(json.dumps({'subreaper': True, 'umask': '022', 'reapedOrphans': orphans, 'commandExitCode': result}), flush=True)
sys.exit(result if result is not None and result >= 0 else 1)
