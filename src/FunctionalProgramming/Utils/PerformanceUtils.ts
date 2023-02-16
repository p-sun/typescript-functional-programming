export function runPerformanceTest(repeat: number, fn: () => void) {
  const startTime = new Date().getTime();
  for (let i = 0; i < repeat; i++) {
    fn();
  }
  console.log(
    `Took ${new Date().getTime() - startTime}ms to repeat ${repeat} times`
  );
}
