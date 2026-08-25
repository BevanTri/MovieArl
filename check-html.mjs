(async () => {
  const html = await (await fetch("http://localhost:3002/")).text();
  const scripts = html.match(/<script[^>]*>/g) || [];
  console.log("total <script>:", scripts.length);
  scripts.slice(0, 10).forEach((s) => console.log("  ", s.slice(0, 120)));
  const srcRe = /src="([^"]+)"/g;
  let m, count = 0;
  while ((m = srcRe.exec(html)) !== null) {
    if (m[1].includes("_next")) {
      count++;
      if (count <= 6) console.log("  SRC:", m[1].slice(0, 100));
    }
  }
  console.log("_next src total:", count);
})();
