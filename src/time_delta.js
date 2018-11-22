export default function TimeDelta({
  minutes = 0,
  seconds = 0,
  milliseconds = 0
}) {
  let t = minutes * 60;
  t = (t + seconds) * 1000;
  t = (t + milliseconds);
  return t;
}