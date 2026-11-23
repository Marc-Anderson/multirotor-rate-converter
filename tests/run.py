"""Run the offline suite and optionally write a GitHub Actions job summary."""

import os
from pathlib import Path
import platform
import time
import unittest

import numpy
import scipy

from .test_bulk_test_cases import RateConverterTest


def write_summary(result, elapsed):
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_path:
        return

    baseline_sum = getattr(RateConverterTest, "test_sum", 0)
    current_sum = getattr(RateConverterTest, "new_sum", 0)
    rows = [
        ("Tests run", result.testsRun),
        ("Failures", len(result.failures)),
        ("Errors", len(result.errors)),
        ("Skipped", len(result.skipped)),
        ("Expected failures", len(result.expectedFailures)),
        ("Unexpected successes", len(result.unexpectedSuccesses)),
        ("Baseline error sum", f"{baseline_sum:.2f}"),
        ("Current error sum", f"{current_sum:.2f}"),
        ("Difference (current - baseline)", f"{current_sum - baseline_sum:+.2f}"),
        ("Duration (seconds)", f"{elapsed:.2f}"),
        ("Python", platform.python_version()),
        ("NumPy", numpy.__version__),
        ("SciPy", scipy.__version__),
    ]
    status = "Passed" if result.wasSuccessful() else "Failed"
    with Path(summary_path).open("a", encoding="utf-8") as file:
        file.write(f"## Core regression tests: {status}\n\n")
        file.write("| Metric | Value |\n| --- | ---: |\n")
        for name, value in rows:
            file.write(f"| {name} | {value} |\n")


def main():
    suite = unittest.defaultTestLoader.loadTestsFromName("tests.test_bulk_test_cases")
    if suite.countTestCases() == 0:
        raise RuntimeError("No regression tests were discovered")
    print(
        f"Python {platform.python_version()}, "
        f"NumPy {numpy.__version__}, SciPy {scipy.__version__}",
        flush=True,
    )
    start = time.perf_counter()
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    write_summary(result, time.perf_counter() - start)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
