export function calculateBenchmarkResults(samples, startTime) {
    if (!samples || samples.length === 0) {
        return { error: "No samples collected" };
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const min = sorted[0];
    const p1 = sorted[Math.floor(samples.length * 0.01)];

    return {
        avgFps: avg,
        minFps: min,
        p1Fps: p1,
        samples: samples.length,
        duration: performance.now() - startTime
    };
}
